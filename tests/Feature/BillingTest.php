<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Proforma;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Invoices and proformas bill against a sales order; work orders and stock
 * order transfers make and move the goods.
 */
class BillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('invoice', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('acct_invoiceno')->nullable();
            $table->integer('fsdno')->nullable();
            $table->string('indexno')->nullable();
            $table->double('subtotal')->nullable();
            $table->float('totalmyr')->nullable();
            $table->float('discount')->nullable();
            $table->string('paymentterms', 100)->nullable();
            $table->float('transportation')->nullable();
            $table->float('tax')->nullable();
            $table->float('custom')->nullable();
            $table->float('packing_charge')->nullable();
            $table->float('misc')->nullable();
            $table->string('misc_title')->nullable();
            $table->integer('sst')->nullable();
            $table->timestamps();
        });

        Schema::create('proforma', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('fsdno')->nullable();
            $table->string('indexno')->nullable();
            $table->double('subtotal')->nullable();
            $table->float('totalmyr')->nullable();
            $table->float('discount')->nullable();
            $table->string('paymentdue', 100)->nullable();
            $table->float('transportation')->nullable();
            $table->float('tax')->nullable();
            $table->float('custom')->nullable();
            $table->float('packing_charge')->nullable();
            $table->float('misc')->nullable();
            $table->string('misc_title')->nullable();
            $table->integer('sst')->nullable();
            $table->timestamps();
        });

        Schema::create('loading_note', function (Blueprint $table) {
            $table->increments('id');
            $table->string('type')->nullable();
            $table->integer('salesorder')->nullable();
            $table->timestamps();
        });

        Schema::create('loading_note_content', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('do_id')->nullable();
            $table->integer('item')->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('actual_qty')->nullable();
            $table->string('product', 50)->nullable();
            $table->text('description')->nullable();
            $table->string('stockcode', 100)->nullable();
            $table->decimal('unit_price', 10, 3)->nullable();
            $table->float('weight')->nullable();
            $table->decimal('sst', 10, 2)->nullable();
        });

        Schema::create('sales_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('customer_no')->nullable();
            $table->integer('currency')->nullable();
            $table->string('customer_order', 100)->nullable();
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
            $table->float('weight')->nullable();
            $table->decimal('unit_price', 10, 3)->nullable();
            $table->decimal('sst', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('stock_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('salesorder')->nullable();
            $table->integer('customer_no')->nullable();
            $table->string('contact_person', 100)->nullable();
            $table->integer('order_process_by')->nullable();
            $table->string('location', 30)->nullable();
            $table->date('goods_ready_date')->nullable();
            $table->date('closing_date')->nullable();
            $table->timestamps();
        });

        Schema::create('stockorder_lineitem', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('orderno')->nullable();
            $table->integer('item')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('stock_code', 100)->nullable();
            $table->float('weight')->nullable();
            $table->float('unit_price')->nullable();
        });

        Schema::create('stock_order_transfers', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('salesorder')->nullable();
            $table->integer('customer_no')->nullable();
            $table->integer('sales_person')->nullable();
            $table->integer('currency')->nullable();
            $table->decimal('freightcharge', 10, 2)->nullable();
            $table->decimal('discount', 10, 2)->nullable();
            $table->decimal('packcost', 10, 2)->nullable();
            $table->decimal('custom', 10, 2)->nullable();
            $table->decimal('miscvalue', 10, 2)->nullable();
            $table->string('customer_order', 100)->nullable();
            $table->string('contact_person', 100)->nullable();
            $table->string('location', 30)->nullable();
            $table->date('despatch_date')->nullable();
            $table->date('closing_date')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_order_transfer_lineitems', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('orderno')->nullable();
            $table->integer('item')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('stock_code', 100)->nullable();
            $table->float('weight')->nullable();
            $table->float('unit_price')->nullable();
        });

        Schema::create('company_details', function (Blueprint $table) {
            $table->increments('id');
            $table->string('cname')->nullable();
        });

        Schema::create('currency', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
        });
    }

    private function actingAsBillingUser(string ...$permissions): User
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
        $this->get(route('invoice.index'))->assertRedirect(route('login'));
        $this->get(route('proforma.index'))->assertRedirect(route('login'));
        $this->get(route('work-order.index'))->assertRedirect(route('login'));
        $this->get(route('stock-transfer.index'))->assertRedirect(route('login'));
    }

    public function test_billing_and_production_have_separate_permissions()
    {
        $this->actingAsBillingUser('invoice-list');

        $this->get(route('invoice.index'))->assertOk();
        // Proformas have no permission rows of their own, so they follow the
        // invoice one rather than being locked for everyone.
        $this->get(route('proforma.index'))->assertOk();
        $this->get(route('work-order.index'))->assertForbidden();
        $this->get(route('stock-transfer.index'))->assertForbidden();
    }

    public function test_an_invoice_bills_the_despatched_quantity_not_the_ordered_one()
    {
        $this->actingAsBillingUser('invoice-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $orderId = DB::table('sales_orders')->insertGetId(['customer_no' => $clientId]);
        $doId = DB::table('loading_note')->insertGetId(['type' => 'salesorder', 'salesorder' => $orderId]);
        DB::table('loading_note_content')->insert([
            ['do_id' => $doId, 'item' => 1, 'quantity' => 10, 'actual_qty' => 4, 'unit_price' => 25, 'sst' => 0],
        ]);

        $invoiceId = DB::table('invoice')->insertGetId([
            'fsdno' => $orderId,
            'indexno' => (string) $doId,
            'transportation' => 50,
            'custom' => 0,
            'packing_charge' => 20,
            'misc' => 0,
            'discount' => 10,
            'sst' => 0,
            'tax' => 0,
        ]);

        $totals = Invoice::findOrFail($invoiceId)->totals();

        // 4 x 25, not 10 x 25
        $this->assertSame(100.0, $totals['subtotal']);
        $this->assertSame(4, $totals['quantity']);
        // 100 + 50 + 20 - 10
        $this->assertSame(160.0, $totals['grand_total']);

        $this->get(route('invoice.show', $invoiceId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('invoice.client', 'Acme Energy')
                ->where('lines.0.line_total', 100)
            );
    }

    public function test_an_invoice_that_charges_sst_adds_the_line_sst()
    {
        $this->actingAsBillingUser('invoice-list');

        $doId = DB::table('loading_note')->insertGetId(['type' => 'salesorder']);
        DB::table('loading_note_content')->insert([
            'do_id' => $doId, 'item' => 1, 'actual_qty' => 2, 'unit_price' => 50, 'sst' => 10,
        ]);

        $invoiceId = DB::table('invoice')->insertGetId([
            'indexno' => (string) $doId, 'sst' => 1, 'discount' => 0,
        ]);

        $totals = Invoice::findOrFail($invoiceId)->totals();

        $this->assertSame(110.0, $totals['subtotal']);
        $this->assertSame(10.0, $totals['sst']);
    }

    public function test_a_proforma_quotes_the_ordered_lines_of_its_sales_order()
    {
        $this->actingAsBillingUser('invoice-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);
        $orderId = DB::table('sales_orders')->insertGetId([
            'customer_no' => $clientId, 'currency' => $currencyId,
        ]);
        DB::table('sales_order_line_item')->insert([
            ['fsdorder' => $orderId, 'item' => 1, 'quantity' => 3, 'unit_price' => 100, 'sst' => 0],
        ]);

        $proformaId = DB::table('proforma')->insertGetId([
            'fsdno' => $orderId, 'packing_charge' => 200, 'discount' => 0, 'sst' => 0,
        ]);

        $totals = Proforma::findOrFail($proformaId)->totals();

        $this->assertSame(300.0, $totals['subtotal']);
        $this->assertSame(500.0, $totals['grand_total']);

        $this->get(route('proforma.show', $proformaId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('proforma.client', 'Acme Energy')
                ->where('proforma.currency', 'USD')
                ->count('lines', 1)
            );
    }

    public function test_a_work_order_totals_what_it_makes()
    {
        $this->actingAsBillingUser('stockorder-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $woId = DB::table('stock_orders')->insertGetId(['customer_no' => $clientId]);
        DB::table('stockorder_lineitem')->insert([
            ['orderno' => $woId, 'item' => 1, 'quantity' => 4, 'unit_price' => 12.5, 'weight' => 2],
            ['orderno' => $woId, 'item' => 2, 'quantity' => 1, 'unit_price' => 50, 'weight' => 0],
        ]);

        $totals = WorkOrder::findOrFail($woId)->totals();

        $this->assertSame(5, $totals['quantity']);
        $this->assertSame(8.0, $totals['weight']);
        $this->assertSame(100.0, $totals['value']);

        $this->get(route('work-order.show', $woId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('order.client', 'Acme Energy'));
    }

    public function test_a_stock_transfer_takes_its_discount_off_the_end()
    {
        $this->actingAsBillingUser('stockorder-list');

        $transferId = DB::table('stock_order_transfers')->insertGetId([
            'freightcharge' => 100,
            'packcost' => 0,
            'custom' => 0,
            'miscvalue' => 0,
            'discount' => 50,
        ]);
        DB::table('stock_order_transfer_lineitems')->insert([
            'orderno' => $transferId, 'item' => 1, 'quantity' => 2, 'unit_price' => 250, 'weight' => 1,
        ]);

        $this->get(route('stock-transfer.show', $transferId))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('totals.subtotal', 500)
                // 500 + 100 - 50
                ->where('totals.grand_total', 550)
            );
    }
}
