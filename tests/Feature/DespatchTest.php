<?php

namespace Tests\Feature;

use App\Models\Coc;
use App\Models\DeliveryOrder;
use App\Models\PackingList;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Delivery orders, certificates of conformity and packing lists: the three
 * documents raised once a sales order ships.
 */
class DespatchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('loading_note', function (Blueprint $table) {
            $table->increments('id');
            $table->string('type')->nullable();
            $table->integer('salesorder')->nullable();
            $table->string('customer_order', 50)->nullable();
            $table->integer('total_fsd_items')->nullable();
            $table->integer('delivered_fsd_items')->nullable();
            $table->string('status', 9)->nullable();
            $table->timestamps();
        });

        Schema::create('loading_note_content', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('do_id')->nullable();
            $table->integer('item')->nullable();
            $table->string('poitem', 11)->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('actual_qty')->nullable();
            $table->string('product', 50)->nullable();
            $table->text('description')->nullable();
            $table->string('postock_code', 100)->nullable();
            $table->string('stockcode', 100)->nullable();
            $table->string('std_stockcode')->nullable();
            $table->decimal('unit_price', 10, 3)->nullable();
            $table->float('weight')->nullable();
            $table->decimal('sst', 10, 2)->nullable();
        });

        Schema::create('coc', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('indexno')->nullable();
            $table->integer('customer_no')->nullable();
            $table->integer('fsdorder')->nullable();
            $table->string('quality_auth', 100)->nullable();
            $table->string('rowno', 1000)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('packinglist', function (Blueprint $table) {
            $table->increments('id');
            $table->string('fsdorder')->nullable();
            $table->string('altcustomername', 50)->nullable();
            $table->string('ref', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('packinglist_content', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('packingid')->nullable();
            $table->integer('salesorder')->nullable();
            $table->integer('do_id')->nullable();
            $table->integer('item')->nullable();
            $table->float('unit_weight')->nullable();
            $table->float('unit_value')->nullable();
            $table->decimal('decuval', 10, 2)->nullable();
        });

        Schema::create('sales_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('customer_no')->nullable();
            $table->timestamps();
        });

        Schema::create('sales_order_line_item', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('fsdorder')->nullable();
            $table->integer('item')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('unit', 10)->nullable();
            $table->string('product', 50)->nullable();
            $table->string('stock_code', 100)->nullable();
            $table->text('description')->nullable();
            $table->string('batch', 50)->nullable();
            $table->string('type_of_certification', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('company_details', function (Blueprint $table) {
            $table->increments('id');
            $table->string('cname')->nullable();
        });
    }

    private function actingAsDespatchUser(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('delivery-order.index'))->assertRedirect(route('login'));
        $this->get(route('coc.index'))->assertRedirect(route('login'));
        $this->get(route('packing-list.index'))->assertRedirect(route('login'));
    }

    public function test_each_document_has_its_own_permission()
    {
        $this->actingAsDespatchUser('do-list');

        $this->get(route('delivery-order.index'))->assertOk();
        $this->get(route('coc.index'))->assertForbidden();
        $this->get(route('packing-list.index'))->assertForbidden();
    }

    public function test_a_despatch_names_the_client_of_the_sales_order_it_ships()
    {
        $this->actingAsDespatchUser('do-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $orderId = DB::table('sales_orders')->insertGetId(['customer_no' => $clientId]);
        DB::table('loading_note')->insert([
            'type' => 'salesorder',
            'salesorder' => $orderId,
            'total_fsd_items' => 3,
            'delivered_fsd_items' => 3,
        ]);

        $this->get(route('delivery-order.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('orders.0.client', 'Acme Energy'));
    }

    public function test_a_despatch_against_a_work_order_has_no_client_to_name()
    {
        $this->actingAsDespatchUser('do-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        // A work order id that happens to match a sales order id must not be
        // mistaken for one.
        $orderId = DB::table('sales_orders')->insertGetId(['customer_no' => $clientId]);
        DB::table('loading_note')->insert([
            'type' => 'workorder',
            'salesorder' => $orderId,
        ]);

        $this->get(route('delivery-order.index'))
            ->assertInertia(fn ($page) => $page->where('orders.0.client', null));
    }

    public function test_the_despatch_totals_count_what_actually_went_out()
    {
        $this->actingAsDespatchUser('do-list');

        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder',
            'total_fsd_items' => 2,
            'delivered_fsd_items' => 1,
        ]);
        DB::table('loading_note_content')->insert([
            ['do_id' => $doId, 'item' => 1, 'quantity' => 10, 'actual_qty' => 4, 'unit_price' => 2.5, 'weight' => 1.5],
            ['do_id' => $doId, 'item' => 2, 'quantity' => 5, 'actual_qty' => 5, 'unit_price' => 10, 'weight' => 0],
        ]);

        $totals = DeliveryOrder::findOrFail($doId)->totals();

        $this->assertSame(15, $totals['quantity']);
        $this->assertSame(9, $totals['delivered']);
        $this->assertSame(6.0, $totals['weight']);
        // 4 x 2.50 plus 5 x 10
        $this->assertSame(60.0, $totals['value']);
        $this->assertFalse(DeliveryOrder::findOrFail($doId)->isComplete());
    }

    public function test_a_certificate_resolves_the_sales_order_lines_it_names()
    {
        $this->actingAsDespatchUser('coc-list');

        $orderId = DB::table('sales_orders')->insertGetId([]);
        $first = DB::table('sales_order_line_item')->insertGetId([
            'fsdorder' => $orderId, 'item' => 1, 'stock_code' => 'RTJ-1', 'quantity' => 2,
        ]);
        $second = DB::table('sales_order_line_item')->insertGetId([
            'fsdorder' => $orderId, 'item' => 2, 'stock_code' => 'RTJ-2', 'quantity' => 1,
        ]);
        DB::table('sales_order_line_item')->insert([
            'fsdorder' => $orderId, 'item' => 3, 'stock_code' => 'NOT-CERTIFIED',
        ]);

        $cocId = DB::table('coc')->insertGetId([
            'fsdorder' => $orderId,
            'rowno' => "{$first},{$second}",
            'quality_auth' => 'Dana',
        ]);

        $this->assertSame([$first, $second], Coc::findOrFail($cocId)->lineIds());

        $this->get(route('coc.show', $cocId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->count('lines', 2)
                ->where('lines.0.stock_code', 'RTJ-1')
            );
    }

    public function test_a_certificate_naming_no_lines_shows_none()
    {
        $this->actingAsDespatchUser('coc-list');

        $cocId = DB::table('coc')->insertGetId(['rowno' => '']);

        $this->assertSame([], Coc::findOrFail($cocId)->lineIds());
        $this->get(route('coc.show', $cocId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->count('lines', 0));
    }

    public function test_a_packing_list_covers_several_sales_orders()
    {
        $this->actingAsDespatchUser('pl-list');

        $listId = DB::table('packinglist')->insertGetId([
            'fsdorder' => '10952,10915,10873',
            'altcustomername' => 'Acme Energy',
        ]);

        $this->assertSame(
            [10952, 10915, 10873],
            PackingList::findOrFail($listId)->salesOrderIds(),
        );

        $this->get(route('packing-list.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->count('lists.0.sales_orders', 3));
    }

    public function test_packed_rows_take_their_description_from_the_despatch_line()
    {
        $this->actingAsDespatchUser('pl-list');

        $doId = DB::table('loading_note')->insertGetId(['type' => 'salesorder']);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 2, 'stockcode' => 'SPW-9',
            'description' => 'Spiral wound gasket', 'actual_qty' => 4,
        ]);

        $listId = DB::table('packinglist')->insertGetId(['fsdorder' => '1']);
        DB::table('packinglist_content')->insert([
            // The row points at an item number within the despatch, not a line id.
            'packingid' => $listId, 'do_id' => $doId, 'item' => 2,
            'unit_weight' => 1.5, 'unit_value' => 20,
        ]);

        $this->get(route('packing-list.show', $listId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('lines.0.stockcode', 'SPW-9')
                ->where('lines.0.description', 'Spiral wound gasket')
                ->where('lines.0.quantity', 4)
                ->where('totals.weight', 1.5)
                ->where('totals.value', 20)
            );
    }
}
