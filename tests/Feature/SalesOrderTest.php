<?php

namespace Tests\Feature;

use App\Models\SalesOrder;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SalesOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('sales_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('sst')->nullable();
            $table->decimal('freightcharge', 10, 2)->nullable();
            $table->decimal('discount', 10, 2)->nullable();
            $table->decimal('packcost', 10, 2)->nullable();
            $table->decimal('custom', 10, 2)->nullable();
            $table->string('miscellaneous', 100)->nullable();
            $table->decimal('miscvalue', 10, 2)->nullable();
            $table->string('contact_person', 100)->nullable();
            $table->string('customer_order', 100)->nullable();
            $table->integer('sales_person')->nullable();
            $table->integer('contract_reviewed_by')->nullable();
            $table->integer('order_process_by')->nullable();
            $table->integer('currency')->nullable();
            $table->integer('customer_no')->nullable();
            $table->integer('delivery_address')->nullable();
            $table->integer('workorder')->nullable();
            $table->string('invoice', 50)->nullable();
            $table->date('closing_date')->nullable();
            $table->string('receiving_note', 500)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('mode_of_shipment', 100)->nullable();
            $table->string('freight', 100)->nullable();
            $table->string('packaging_type', 20)->nullable();
            $table->string('certification', 100)->nullable();
            $table->integer('is_cod')->nullable();
            $table->string('customer_reqdate')->nullable();
            $table->date('required_datetime')->nullable();
            $table->date('goods_ready_date')->nullable();
            $table->date('despatch_date')->nullable();
            $table->date('packorder_date')->nullable();
            $table->string('quote_basis', 100)->nullable();
            $table->string('delivery', 100)->nullable();
            $table->string('bid_validity', 100)->nullable();
            $table->string('pay_terms', 100)->nullable();
            $table->string('afe', 100)->nullable();
            $table->string('sp_instruct1', 100)->nullable();
            $table->string('sp_instruct2', 100)->nullable();
            $table->string('sp_instruct3', 255)->nullable();
            $table->text('remarks')->nullable();
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
            $table->date('linedate')->nullable();
            $table->float('weight')->nullable();
            $table->text('description')->nullable();
            $table->decimal('unit_price', 10, 3)->nullable();
            $table->decimal('totalmyr', 10, 2)->nullable();
            $table->decimal('sst', 10, 2)->nullable();
            $table->string('batch', 50)->nullable();
            $table->string('type_of_certification', 100)->nullable();
            $table->string('operator', 100)->nullable();
            $table->integer('fgmr')->nullable();
            $table->integer('wo')->nullable();
            $table->integer('po')->nullable();
            $table->timestamps();
        });

        Schema::create('company_details', function (Blueprint $table) {
            $table->increments('id');
            $table->string('cname')->nullable();
        });

        Schema::create('currency', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->decimal('myrrate', 10, 4)->nullable();
        });

        Schema::create('delivery_address', function (Blueprint $table) {
            $table->increments('id');
            $table->string('customer_name')->nullable();
            $table->integer('company_detail_id')->nullable();
            $table->string('city')->nullable();
        });

        Schema::create('tax', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->decimal('value', 10, 2)->nullable();
        });

        Schema::create('quote_refs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('sst')->nullable();
            $table->timestamps();
        });

        Schema::create('quote_descs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('our_ref')->nullable();
            $table->integer('item')->nullable();
            $table->integer('qty')->nullable();
            $table->string('unit', 30)->nullable();
            $table->string('product')->nullable();
            $table->string('stockcode')->nullable();
            $table->string('std_stockcode')->nullable();
            $table->float('weight')->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('sst', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('modeshipment', function (Blueprint $table) {
            $table->increments('id');
            $table->string('mode')->nullable();
        });
    }

    private function actingAsSalesUser(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    private function makeOrder(array $attributes = []): SalesOrder
    {
        $id = DB::table('sales_orders')->insertGetId([
            'sst' => 0,
            'freightcharge' => 0,
            'discount' => 0,
            'packcost' => 0,
            'custom' => 0,
            'miscvalue' => 0,
            'created_at' => now(),
            ...$attributes,
        ]);

        return SalesOrder::findOrFail($id);
    }

    private function addLine(SalesOrder $order, array $attributes): void
    {
        DB::table('sales_order_line_item')->insert([
            'fsdorder' => $order->id,
            'item' => 1,
            'weight' => 0,
            'sst' => 0,
            ...$attributes,
        ]);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('sales-order.index'))->assertRedirect(route('login'));
    }

    public function test_users_without_the_list_permission_are_forbidden()
    {
        $this->actingAsSalesUser('quotation-list');

        $this->get(route('sales-order.index'))->assertForbidden();
        $this->get(route('sales-order.show', $this->makeOrder()))->assertForbidden();
    }

    public function test_the_listing_carries_the_client_and_salesperson()
    {
        $user = $this->actingAsSalesUser('salesorder-list');
        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);

        $this->makeOrder(['customer_no' => $clientId, 'sales_person' => $user->id]);

        $this->get(route('sales-order.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('orders.0.client', 'Acme Energy')
                ->where('orders.0.salesperson', $user->name)
            );
    }

    public function test_the_discount_is_an_amount_taken_off_after_the_charges()
    {
        $this->actingAsSalesUser('salesorder-list');

        $order = $this->makeOrder([
            'freightcharge' => 100,
            'packcost' => 50,
            'custom' => 25,
            'miscvalue' => 25,
            'discount' => 200,
        ]);

        $this->addLine($order, ['quantity' => 2, 'unit_price' => 500, 'weight' => 3]);

        $totals = $order->totals();

        $this->assertSame(1000.0, $totals['subtotal']);
        $this->assertSame(6.0, $totals['weight']);
        // 1000 + 100 + 50 + 25 + 25 - 200
        $this->assertSame(1000.0, $totals['grand_total']);
    }

    public function test_line_sst_counts_only_when_the_order_charges_it()
    {
        $this->actingAsSalesUser('salesorder-list');

        $charged = $this->makeOrder(['sst' => 1]);
        $this->addLine($charged, ['quantity' => 1, 'unit_price' => 100, 'sst' => 10]);

        $exempt = $this->makeOrder(['sst' => 0]);
        $this->addLine($exempt, ['quantity' => 1, 'unit_price' => 100, 'sst' => 10]);

        $this->assertSame(110.0, $charged->totals()['grand_total']);
        $this->assertSame(100.0, $exempt->totals()['grand_total']);
    }

    public function test_the_detail_page_carries_the_lines_and_totals()
    {
        $this->actingAsSalesUser('salesorder-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);
        $order = $this->makeOrder(['customer_no' => $clientId, 'currency' => $currencyId]);
        $this->addLine($order, ['quantity' => 2, 'unit_price' => 25, 'stock_code' => 'SPW-1']);

        $this->get(route('sales-order.show', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('order.client.cname', 'Acme Energy')
                ->where('order.currency', 'USD')
                ->where('lines.0.stock_code', 'SPW-1')
                ->where('lines.0.line_total', 50)
                ->where('totals.grand_total', 50)
            );
    }

    /**
     * @return array<string, mixed>
     */
    private function newOrderAttributes(array $overrides = []): array
    {
        $user = User::factory()->create();
        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);
        DB::table('modeshipment')->insert(['mode' => 'Sea']);

        return [
            'customer_no' => $clientId,
            'contact_person' => 'Sam',
            'receiving_note' => 'RN-1',
            'sales_person' => $user->id,
            'order_process_by' => $user->id,
            'currency' => $currencyId,
            'mode_of_shipment' => 'Sea',
            'sst' => '1',
            'is_cod' => '0',
            ...$overrides,
        ];
    }

    public function test_creating_needs_the_create_permission()
    {
        $this->actingAsSalesUser('salesorder-list');

        $this->get(route('sales-order.create'))->assertForbidden();
        $this->post(route('sales-order.store'), $this->newOrderAttributes())
            ->assertForbidden();
    }

    public function test_a_sales_order_can_be_created()
    {
        $this->actingAsSalesUser('salesorder-create');

        $this->post(route('sales-order.store'), $this->newOrderAttributes([
            'customer_order' => 'PO-77',
            'freightcharge' => 120,
        ]))->assertRedirect();

        $this->assertDatabaseHas('sales_orders', [
            'customer_order' => 'PO-77',
            'receiving_note' => 'RN-1',
            'sst' => 1,
            // Blank charges are stored as zero so the totals add up.
            'packcost' => 0,
            'discount' => 0,
            // The legacy schema keeps the freight charge in two columns.
            'freightcharge' => 120,
            'freight' => '120',
        ]);
    }

    public function test_the_required_header_fields_are_enforced()
    {
        $this->actingAsSalesUser('salesorder-create');

        $this->post(route('sales-order.store'), [])->assertSessionHasErrors([
            'customer_no', 'contact_person', 'receiving_note', 'sales_person',
            'order_process_by', 'currency', 'mode_of_shipment', 'sst', 'is_cod',
        ]);

        $this->assertDatabaseCount('sales_orders', 0);
    }

    public function test_a_zero_charge_is_accepted()
    {
        $this->actingAsSalesUser('salesorder-create');

        // The legacy rules said min:0.01, which refused a plain zero.
        $this->post(route('sales-order.store'), $this->newOrderAttributes([
            'freightcharge' => 0,
            'discount' => 0,
        ]))->assertSessionHasNoErrors();
    }

    public function test_editing_needs_the_edit_permission()
    {
        $this->actingAsSalesUser('salesorder-create');

        $this->get(route('sales-order.edit', $this->makeOrder()))->assertForbidden();
    }

    public function test_a_sales_order_can_be_edited()
    {
        $this->actingAsSalesUser('salesorder-edit');

        $order = $this->makeOrder();

        $this->put(route('sales-order.update', $order), $this->newOrderAttributes([
            'contact_person' => 'Dana',
        ]))->assertRedirect();

        $this->assertDatabaseHas('sales_orders', [
            'id' => $order->id,
            'contact_person' => 'Dana',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function lineAttributes(array $overrides = []): array
    {
        return [
            'product' => 'spw',
            'stock_code' => 'SPW-1',
            'description' => 'Spiral wound gasket',
            'unit' => 'Unit',
            'quantity' => 2,
            'unit_price' => 100,
            'weight' => 1.5,
            ...$overrides,
        ];
    }

    public function test_a_line_can_be_added_and_is_numbered_on_from_the_last()
    {
        $this->actingAsSalesUser('salesorder-edit');
        DB::table('tax')->insert(['name' => 'SST', 'value' => 10]);

        $order = $this->makeOrder(['sst' => 0]);
        $this->addLine($order, ['item' => 4, 'quantity' => 1, 'unit_price' => 1]);

        $this->post(route('sales-order.line.store', $order), $this->lineAttributes())
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame(5, (int) $order->lines()->max('item'));
        $this->assertSame(200.0, $order->fresh()->totals()['subtotal'] - 1);
    }

    public function test_line_sst_is_charged_only_when_the_order_says_so()
    {
        $this->actingAsSalesUser('salesorder-edit');
        DB::table('tax')->insert(['name' => 'SST', 'value' => 10]);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'MYR', 'myrrate' => 1]);

        $charged = $this->makeOrder(['sst' => 1, 'currency' => $currencyId]);
        $exempt = $this->makeOrder(['sst' => 0, 'currency' => $currencyId]);

        $this->post(route('sales-order.line.store', $charged), $this->lineAttributes());
        $this->post(route('sales-order.line.store', $exempt), $this->lineAttributes());

        $this->assertEqualsWithDelta(20, $charged->lines()->first()->sst, 0.001);
        $this->assertEqualsWithDelta(0, $exempt->lines()->first()->sst, 0.001);
    }

    public function test_a_line_cannot_be_touched_through_another_order()
    {
        $this->actingAsSalesUser('salesorder-edit', 'salesorder-delete');
        DB::table('tax')->insert(['name' => 'SST', 'value' => 10]);

        $owner = $this->makeOrder();
        $other = $this->makeOrder();
        $this->addLine($owner, ['quantity' => 1, 'unit_price' => 1]);
        $line = $owner->lines()->first();

        $this->put(route('sales-order.line.update', [$other, $line]), $this->lineAttributes())
            ->assertNotFound();
        $this->delete(route('sales-order.line.destroy', [$other, $line]))
            ->assertNotFound();

        $this->assertDatabaseHas('sales_order_line_item', ['id' => $line->id]);
    }

    public function test_quotation_lines_can_be_copied_onto_the_order()
    {
        $this->actingAsSalesUser('salesorder-edit');
        DB::table('tax')->insert(['name' => 'SST', 'value' => 10]);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'MYR', 'myrrate' => 1]);

        $order = $this->makeOrder(['sst' => 1, 'currency' => $currencyId]);
        // An order that already has a line: the copies number on from it.
        $this->addLine($order, ['item' => 1, 'quantity' => 1, 'unit_price' => 5]);

        $quotationId = DB::table('quote_refs')->insertGetId(['sst' => 0]);
        DB::table('quote_descs')->insert([
            ['our_ref' => $quotationId, 'item' => 1, 'qty' => 2, 'price' => 50, 'unit' => 'Unit', 'stockcode' => 'RTJ-1', 'description' => 'Ring'],
            ['our_ref' => $quotationId, 'item' => 2, 'qty' => 1, 'price' => 30, 'unit' => 'Lot', 'stockcode' => 'RTJ-2', 'description' => 'Ring 2'],
        ]);

        $this->post(route('sales-order.copy-quotation', $order), [
            'quotation_id' => $quotationId,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $lines = $order->lines()->get();

        $this->assertCount(3, $lines);
        $this->assertSame([1, 2, 3], $lines->pluck('item')->map('intval')->all());
        $copied = $lines->firstWhere('stock_code', 'RTJ-1');
        $this->assertSame(2, $copied->quantity);
        // Priced against this order's SST, not the quotation's.
        $this->assertEqualsWithDelta(10, $copied->sst, 0.001);
    }

    public function test_copying_an_empty_quotation_adds_nothing()
    {
        $this->actingAsSalesUser('salesorder-edit');

        $order = $this->makeOrder();
        $quotationId = DB::table('quote_refs')->insertGetId(['sst' => 0]);

        $this->post(route('sales-order.copy-quotation', $order), [
            'quotation_id' => $quotationId,
        ])->assertRedirect();

        $this->assertSame(0, $order->lines()->count());
    }

    public function test_copying_needs_a_quotation_that_exists()
    {
        $this->actingAsSalesUser('salesorder-edit');

        $this->post(route('sales-order.copy-quotation', $this->makeOrder()), [
            'quotation_id' => 404,
        ])->assertSessionHasErrors('quotation_id');
    }

    public function test_the_order_confirmation_reads_as_the_customer_document()
    {
        $this->actingAsSalesUser('salesorder-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);
        $order = $this->makeOrder([
            'customer_no' => $clientId,
            'currency' => $currencyId,
            'receiving_note' => 'RN-9',
            'customer_order' => 'PO-4',
        ]);
        $this->addLine($order, ['quantity' => 2, 'unit_price' => 75]);

        $this->get(route('sales-order.confirmation', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('sales-orders/confirmation')
                ->where('order.receiving_note', 'RN-9')
                ->where('order.customer_order', 'PO-4')
                ->where('order.client.cname', 'Acme Energy')
                ->where('lines.0.line_total', 150)
                ->where('totals.grand_total', 150)
            );
    }

    public function test_the_confirmation_needs_the_list_permission()
    {
        $this->actingAsSalesUser('quotation-list');

        $this->get(route('sales-order.confirmation', $this->makeOrder()))
            ->assertForbidden();
    }
}
