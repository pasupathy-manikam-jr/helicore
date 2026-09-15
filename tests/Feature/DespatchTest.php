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
            $table->string('customer_order', 100)->nullable();
            $table->string('contact_person', 100)->nullable();
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
            $table->string('std_stockcode')->nullable();
            $table->string('postock_code', 100)->nullable();
            $table->string('polineitem', 50)->nullable();
            $table->decimal('unit_price', 10, 3)->nullable();
            $table->float('weight')->nullable();
            $table->decimal('sst', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->string('batch', 50)->nullable();
            $table->string('type_of_certification', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('company_details', function (Blueprint $table) {
            $table->increments('id');
            $table->string('cname')->nullable();
            $table->string('address', 500)->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('phone')->nullable();
            $table->string('fax')->nullable();
        });

        Schema::create('stock_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('customer_no')->nullable();
            $table->timestamps();
        });

        Schema::create('stockorder_lineitem', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('orderno')->nullable();
            $table->integer('item')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('stock_code', 100)->nullable();
            $table->float('unit_price')->nullable();
        });

        Schema::create('stock_order_transfers', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('customer_no')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_order_transfer_lineitems', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('orderno')->nullable();
            $table->integer('item')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('stock_code', 100)->nullable();
            $table->float('unit_price')->nullable();
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

    public function test_a_certificate_resolves_the_despatch_lines_it_names()
    {
        $this->actingAsDespatchUser('coc-list');

        $orderId = DB::table('sales_orders')->insertGetId([]);
        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'valid',
        ]);

        $first = DB::table('loading_note_content')->insertGetId([
            'do_id' => $doId, 'item' => 1, 'stockcode' => 'RTJ-1', 'quantity' => 2, 'actual_qty' => 2,
        ]);
        $second = DB::table('loading_note_content')->insertGetId([
            'do_id' => $doId, 'item' => 2, 'stockcode' => 'RTJ-2', 'quantity' => 1, 'actual_qty' => 1,
        ]);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 3, 'stockcode' => 'NOT-CERTIFIED',
        ]);

        $cocId = DB::table('coc')->insertGetId([
            'fsdorder' => $orderId,
            'indexno' => $doId,
            'rowno' => "{$first},{$second}",
            'quality_auth' => 'Dana',
        ]);

        $this->assertSame([$first, $second], Coc::findOrFail($cocId)->lineIds());

        $this->get(route('coc.show', $cocId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->count('lines', 2)
                ->where('lines.0.stockcode', 'RTJ-1')
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

    public function test_the_certificate_form_lists_that_month_s_despatches()
    {
        $this->actingAsDespatchUser('coc-create');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $orderId = DB::table('sales_orders')->insertGetId(['customer_no' => $clientId]);
        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'valid',
            'created_at' => '2022-05-06 00:00:00',
        ]);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 1, 'stockcode' => 'RTJ-1', 'quantity' => 2, 'actual_qty' => 2,
        ]);

        $this->get(route('coc.create', ['month' => '2022-05']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('deliveryOrders.0.id', $doId));

        $this->get(route('coc.create', ['month' => '2022-05', 'delivery_order' => $doId]))
            ->assertInertia(fn ($page) => $page
                ->where('deliveryOrder.client', 'Acme Energy')
                ->where('lines.0.stockcode', 'RTJ-1')
            );
    }

    public function test_a_certificate_records_the_ticked_despatch_lines()
    {
        $this->actingAsDespatchUser('coc-create', 'coc-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $orderId = DB::table('sales_orders')->insertGetId(['customer_no' => $clientId]);
        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'valid',
        ]);
        $first = DB::table('loading_note_content')->insertGetId([
            'do_id' => $doId, 'item' => 1, 'stockcode' => 'RTJ-1', 'actual_qty' => 2,
        ]);
        $second = DB::table('loading_note_content')->insertGetId([
            'do_id' => $doId, 'item' => 2, 'stockcode' => 'RTJ-2', 'actual_qty' => 1,
        ]);

        $this->post(route('coc.store'), [
            'delivery_order' => $doId,
            'quality_auth' => 'Dana',
            'remarks' => 'Checked against ASME B16.20',
            'lines' => [$first, $second],
        ])->assertRedirect();

        $coc = Coc::latest('id')->first();

        $this->assertSame($doId, $coc->indexno);
        $this->assertSame($orderId, $coc->fsdorder);
        $this->assertSame($clientId, $coc->customer_no);
        $this->assertSame([$first, $second], $coc->lineIds());
    }

    public function test_a_certificate_cannot_name_another_despatch_s_lines()
    {
        $this->actingAsDespatchUser('coc-create');

        $mine = DB::table('loading_note')->insertGetId(['type' => 'salesorder']);
        $theirs = DB::table('loading_note')->insertGetId(['type' => 'salesorder']);
        $theirLine = DB::table('loading_note_content')->insertGetId([
            'do_id' => $theirs, 'item' => 1, 'stockcode' => 'OTHER',
        ]);

        $this->post(route('coc.store'), [
            'delivery_order' => $mine,
            'quality_auth' => 'Dana',
            'lines' => [$theirLine],
        ])->assertRedirect();

        $this->assertDatabaseCount('coc', 0);
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

    /**
     * @return array{0: int, 1: array<int, int>} the sales order and its line ids
     */
    private function salesOrderWithLines(): array
    {
        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $orderId = DB::table('sales_orders')->insertGetId([
            'customer_no' => $clientId,
            'customer_order' => 'PO-5',
            'created_at' => '2022-05-06 00:00:00',
        ]);

        $first = DB::table('sales_order_line_item')->insertGetId([
            'fsdorder' => $orderId, 'item' => 1, 'quantity' => 10,
            'stock_code' => 'SPW-1', 'unit_price' => 25, 'weight' => 2, 'sst' => 3,
        ]);
        $second = DB::table('sales_order_line_item')->insertGetId([
            'fsdorder' => $orderId, 'item' => 2, 'quantity' => 4,
            'stock_code' => 'SPW-2', 'unit_price' => 50,
        ]);

        return [$orderId, [$first, $second]];
    }

    public function test_the_picker_lists_that_month_s_orders()
    {
        $this->actingAsDespatchUser('do-create');

        [$orderId] = $this->salesOrderWithLines();

        $this->get(route('delivery-order.create', ['type' => 'salesorder', 'month' => '2022-05']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('orders.0.id', $orderId)
                ->where('orders.0.client', 'Acme Energy')
                ->count('lines', 0)
            );

        // A month with nothing raised in it offers no orders.
        $this->get(route('delivery-order.create', ['type' => 'salesorder', 'month' => '2021-01']))
            ->assertInertia(fn ($page) => $page->count('orders', 0));
    }

    public function test_the_lines_show_the_earlier_notes_and_what_is_left()
    {
        $this->actingAsDespatchUser('do-create');

        [$orderId, [$first]] = $this->salesOrderWithLines();

        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'valid',
        ]);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 1, 'quantity' => 4, 'actual_qty' => 4,
        ]);

        $this->get(route('delivery-order.create', [
            'type' => 'salesorder', 'month' => '2022-05', 'order' => $orderId,
        ]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('order.client.cname', 'Acme Energy')
                ->where('lines.0.id', $first)
                ->where('lines.0.already_sent', 4)
                ->where('lines.0.outstanding', 6)
                ->where('lines.0.delivery_orders', [$doId])
                ->where('lines.1.outstanding', 4)
            );
    }

    public function test_a_despatch_marked_invalid_does_not_count_as_sent()
    {
        $this->actingAsDespatchUser('do-create');

        [$orderId] = $this->salesOrderWithLines();

        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'invalid',
        ]);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 1, 'quantity' => 4, 'actual_qty' => 4,
        ]);

        $this->get(route('delivery-order.create', [
            'type' => 'salesorder', 'month' => '2022-05', 'order' => $orderId,
        ]))->assertInertia(fn ($page) => $page->where('lines.0.already_sent', 0));
    }

    public function test_a_ticked_line_despatches_what_is_outstanding()
    {
        $this->actingAsDespatchUser('do-create', 'do-list');

        [$orderId, [$first]] = $this->salesOrderWithLines();

        // Four already gone, so this note should carry the remaining six.
        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'valid',
        ]);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 1, 'quantity' => 4, 'actual_qty' => 4,
        ]);

        $this->post(route('delivery-order.store'), [
            'type' => 'salesorder',
            'order' => $orderId,
            'customer_order' => 'PO-5',
            'lines' => [$first],
        ])->assertRedirect();

        $note = DeliveryOrder::latest('id')->first();
        $line = $note->lines->first();

        $this->assertSame('salesorder', $note->type);
        $this->assertSame(2, (int) $note->total_fsd_items);
        $this->assertSame(1, (int) $note->delivered_fsd_items);
        $this->assertSame(6, $line->quantity);
        $this->assertSame(6, $line->actual_qty);
        $this->assertSame('SPW-1', $line->stockcode);
        $this->assertEqualsWithDelta(25, $line->unit_price, 0.001);
    }

    public function test_a_line_already_delivered_in_full_is_refused()
    {
        $this->actingAsDespatchUser('do-create');

        [$orderId, [$first]] = $this->salesOrderWithLines();

        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'valid',
        ]);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 1, 'quantity' => 10, 'actual_qty' => 10,
        ]);

        $this->post(route('delivery-order.store'), [
            'type' => 'salesorder',
            'order' => $orderId,
            'lines' => [$first],
        ])->assertRedirect();

        // Only the earlier note exists; nothing was sent twice.
        $this->assertDatabaseCount('loading_note', 1);
    }

    public function test_a_despatch_can_be_raised_against_a_work_order()
    {
        $this->actingAsDespatchUser('do-create', 'do-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $woId = DB::table('stock_orders')->insertGetId([
            'customer_no' => $clientId, 'created_at' => '2022-05-06 00:00:00',
        ]);
        $lineId = DB::table('stockorder_lineitem')->insertGetId([
            'orderno' => $woId, 'item' => 1, 'quantity' => 3, 'stock_code' => 'WO-1',
        ]);

        $this->post(route('delivery-order.store'), [
            'type' => 'workorder',
            'order' => $woId,
            'lines' => [$lineId],
        ])->assertRedirect();

        $note = DeliveryOrder::latest('id')->first();

        $this->assertSame('workorder', $note->type);
        $this->assertSame($woId, $note->salesorder);
        $this->assertSame(3, $note->lines->first()->quantity);
    }

    public function test_despatching_needs_the_create_permission()
    {
        $this->actingAsDespatchUser('do-list');

        [$orderId, [$first]] = $this->salesOrderWithLines();

        $this->get(route('delivery-order.create'))->assertForbidden();
        $this->post(route('delivery-order.store'), [
            'type' => 'salesorder',
            'order' => $orderId,
            'lines' => [$first],
        ])->assertForbidden();
    }

    public function test_a_packing_list_packs_every_line_of_a_despatch()
    {
        $this->actingAsDespatchUser('pl-create', 'pl-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $orderId = DB::table('sales_orders')->insertGetId(['customer_no' => $clientId]);
        $doId = DB::table('loading_note')->insertGetId([
            'type' => 'salesorder', 'salesorder' => $orderId, 'status' => 'valid',
        ]);
        DB::table('loading_note_content')->insert([
            ['do_id' => $doId, 'item' => 1, 'stockcode' => 'RTJ-1', 'actual_qty' => 2, 'weight' => 1.5],
            ['do_id' => $doId, 'item' => 2, 'stockcode' => 'RTJ-2', 'actual_qty' => 1, 'weight' => 3],
        ]);

        $this->post(route('packing-list.store'), [
            'delivery_order' => $doId,
            'ref' => 'PL-7',
        ])->assertRedirect();

        $list = PackingList::latest('id')->first();

        $this->assertSame('PL-7', $list->ref);
        // The customer name defaults to the client on the sales order.
        $this->assertSame('Acme Energy', $list->altcustomername);
        $this->assertSame([$orderId], $list->salesOrderIds());
        $this->assertCount(2, $list->lines);
        $this->assertSame($doId, $list->lines->first()->do_id);
        $this->assertEqualsWithDelta(1.5, $list->lines->first()->unit_weight, 0.001);
    }

    public function test_a_despatch_with_no_lines_cannot_be_packed()
    {
        $this->actingAsDespatchUser('pl-create');

        $doId = DB::table('loading_note')->insertGetId(['type' => 'salesorder']);

        $this->post(route('packing-list.store'), ['delivery_order' => $doId])
            ->assertRedirect();

        $this->assertDatabaseCount('packinglist', 0);
    }

    public function test_packing_needs_the_create_permission()
    {
        $this->actingAsDespatchUser('pl-list');

        $this->get(route('packing-list.create'))->assertForbidden();
    }
}
