<?php

namespace Tests\Feature;

use App\Models\Quotation;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class QuotationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * All legacy tables, so the feature test builds the ones it reads.
     */
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('quote_refs', function (Blueprint $table) {
            $table->increments('id');
            $table->string('attnto')->nullable();
            $table->string('clientemail')->nullable();
            $table->integer('sst')->nullable();
            $table->string('attachment', 1000)->nullable();
            $table->string('your_ref', 100)->nullable();
            $table->string('tax', 30)->nullable();
            $table->decimal('packcost', 10, 2)->nullable();
            $table->decimal('custom', 10, 2)->nullable();
            $table->string('misc', 100)->nullable();
            $table->decimal('miscvalue', 10, 2)->nullable();
            $table->string('freight', 30)->nullable();
            $table->decimal('discount', 10, 2)->nullable();
            $table->integer('company_details_id')->nullable();
            $table->string('quote_basis', 100)->nullable();
            $table->string('delivery', 100)->nullable();
            $table->string('bid_valid', 100)->nullable();
            $table->string('pay_terms', 100)->nullable();
            $table->string('user_email', 200)->nullable();
            $table->string('issuermail', 200)->nullable();
            $table->string('currency', 10)->nullable();
            $table->integer('revno')->nullable();
            $table->date('tender_close_date')->nullable();
            $table->string('client_buyer_name', 50)->nullable();
            $table->string('rfq', 50)->nullable();
            $table->integer('tnc')->nullable();
            $table->string('so_ref')->nullable();
            $table->timestamps();
        });

        Schema::create('quote_descs', function (Blueprint $table) {
            $table->increments('id');
            $table->string('product')->nullable();
            $table->string('stockcode')->nullable();
            $table->float('weight')->nullable();
            $table->text('description')->nullable();
            $table->string('unit', 30)->nullable();
            $table->integer('qty')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('total', 10, 2)->nullable();
            $table->integer('our_ref')->nullable();
            $table->integer('item')->nullable();
            $table->decimal('sst', 10, 2)->nullable();
            $table->string('std_stockcode')->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->float('totalmyr')->nullable();
            $table->decimal('shipping_cost', 10, 2)->nullable();
            $table->decimal('mark_up', 10, 2)->nullable();
            $table->decimal('import_duty', 10, 2)->nullable();
            $table->string('pomaterialcode', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('tax', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->decimal('value', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('company_details', function (Blueprint $table) {
            $table->increments('id');
            $table->string('cname')->nullable();
            $table->string('address', 500)->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('phone')->nullable();
            $table->string('fax')->nullable();
            $table->timestamps();
        });

        Schema::create('currency', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->decimal('myrrate', 10, 4)->nullable();
        });

        Schema::create('tnc', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->text('tnclist')->nullable();
            $table->timestamps();
        });
    }

    private function actingAsQuotationUser(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    private function makeQuotation(array $attributes = []): Quotation
    {
        return Quotation::create([
            'your_ref' => 'PO-1',
            'attnto' => 'Sam',
            'discount' => 0,
            'packcost' => 0,
            'custom' => 0,
            'miscvalue' => 0,
            'freight' => 0,
            'sst' => 0,
            ...$attributes,
        ]);
    }

    private function addLine(Quotation $quotation, array $attributes): void
    {
        DB::table('quote_descs')->insert([
            'our_ref' => $quotation->id,
            'item' => 1,
            'weight' => 0,
            'sst' => 0,
            ...$attributes,
        ]);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('quotation.index'))->assertRedirect(route('login'));
    }

    public function test_users_without_the_list_permission_are_forbidden()
    {
        $this->actingAsQuotationUser('quotation-show');

        $this->get(route('quotation.index'))->assertForbidden();
    }

    public function test_the_listing_is_paged_by_the_database()
    {
        $this->actingAsQuotationUser('quotation-list');

        foreach (range(1, 30) as $i) {
            $this->makeQuotation(['your_ref' => "PO-{$i}"]);
        }

        $this->get(route('quotation.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('total', 30)
                ->count('quotations', 25)
                ->where('filters.page', 1)
                ->where('filters.per_page', 25)
            );

        $this->get(route('quotation.index', ['page' => 2]))
            ->assertInertia(fn ($page) => $page->count('quotations', 5));
    }

    public function test_the_search_matches_the_client_name_and_the_quote_number()
    {
        $this->actingAsQuotationUser('quotation-list');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $matching = $this->makeQuotation(['company_details_id' => $clientId]);
        $this->makeQuotation(['your_ref' => 'Other']);

        $this->get(route('quotation.index', ['q' => 'acme']))
            ->assertInertia(fn ($page) => $page
                ->where('total', 1)
                ->where('quotations.0.id', $matching->id)
                ->where('quotations.0.client', 'Acme Energy')
            );

        $this->get(route('quotation.index', ['q' => (string) $matching->id]))
            ->assertInertia(fn ($page) => $page->where('total', 1));
    }

    public function test_an_unknown_sort_column_is_rejected()
    {
        $this->actingAsQuotationUser('quotation-list');

        $this->get(route('quotation.index', ['sort' => 'quote_refs.id; drop table']))
            ->assertSessionHasErrors('sort');
    }

    public function test_totals_follow_the_legacy_order_of_operations()
    {
        $this->actingAsQuotationUser('quotation-list', 'quotation-show');

        $quotation = $this->makeQuotation([
            'discount' => 10,
            'packcost' => 100,
            'custom' => 50,
            'miscvalue' => 25,
            'freight' => '75',
            'created_at' => '2020-01-01 00:00:00',
        ]);

        $this->addLine($quotation, ['qty' => 2, 'price' => 500, 'total' => 1000, 'weight' => 3]);
        $this->addLine($quotation, ['qty' => 1, 'price' => 1000, 'total' => 1000, 'item' => 2]);

        $totals = $quotation->totals();

        $this->assertSame(3, $totals['quantity']);
        $this->assertSame(6.0, $totals['weight']);
        $this->assertSame(2000.0, $totals['subtotal']);
        $this->assertSame(200.0, $totals['discount']);
        $this->assertSame(1800.0, $totals['after_discount']);
        // 1800 + 100 + 50 + 25 + 75
        $this->assertSame(2050.0, $totals['sum_of_total']);
        $this->assertSame(0.0, $totals['gst']);
        $this->assertSame(2050.0, $totals['grand_total']);
    }

    public function test_line_sst_only_counts_when_the_quotation_charges_it()
    {
        $this->actingAsQuotationUser('quotation-show');

        $charged = $this->makeQuotation(['sst' => 1]);
        $this->addLine($charged, ['qty' => 1, 'price' => 100, 'total' => 100, 'sst' => 6]);

        $exempt = $this->makeQuotation(['sst' => 0]);
        $this->addLine($exempt, ['qty' => 1, 'price' => 100, 'total' => 100, 'sst' => 6]);

        $this->assertSame(106.0, $charged->totals()['subtotal']);
        $this->assertSame(6.0, $charged->totals()['sst']);
        $this->assertSame(100.0, $exempt->totals()['subtotal']);
        $this->assertSame(0.0, $exempt->totals()['sst']);
    }

    public function test_quotations_raised_before_june_2018_still_carry_gst()
    {
        $this->actingAsQuotationUser('quotation-show');

        $quotation = $this->makeQuotation(['created_at' => '2017-05-01 00:00:00']);
        $this->addLine($quotation, ['qty' => 1, 'price' => 1000, 'total' => 1000]);

        $totals = $quotation->totals();

        $this->assertSame(0.06, $totals['gst_rate']);
        $this->assertSame(60.0, $totals['gst']);
        $this->assertSame(1060.0, $totals['grand_total']);
    }

    public function test_a_quotation_can_be_created()
    {
        $user = $this->actingAsQuotationUser('quotation-create');
        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);

        $this->post(route('quotation.store'), [
            'company_details_id' => $clientId,
            'attnto' => 'Sam',
            'clientemail' => 'sam@example.com',
            'your_ref' => 'PO-99',
            'revno' => 0,
            'sst' => '1',
            'issuermail' => $user->id,
            'user_email' => $user->id,
            'currency' => $currencyId,
        ])->assertRedirect();

        $this->assertDatabaseHas('quote_refs', [
            'your_ref' => 'PO-99',
            'company_details_id' => $clientId,
            'sst' => 1,
            // Blank money columns are stored as zero so the totals add up.
            'packcost' => 0,
            'discount' => 0,
        ]);
    }

    public function test_creating_without_a_client_is_rejected()
    {
        $this->actingAsQuotationUser('quotation-create');

        $this->post(route('quotation.store'), [])
            ->assertSessionHasErrors([
                'company_details_id', 'attnto', 'clientemail', 'your_ref',
                'revno', 'sst', 'issuermail', 'user_email', 'currency',
            ]);

        $this->assertDatabaseCount('quote_refs', 0);
    }

    public function test_editing_requires_the_edit_permission()
    {
        $this->actingAsQuotationUser('quotation-show');

        $quotation = $this->makeQuotation();

        $this->get(route('quotation.edit', $quotation))->assertForbidden();
    }

    public function test_an_upload_is_appended_to_the_existing_attachments()
    {
        Storage::fake('local');

        $user = $this->actingAsQuotationUser('quotation-edit');
        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);

        $quotation = $this->makeQuotation([
            'attachment' => 'quotation/existing.pdf',
            'company_details_id' => $clientId,
        ]);

        $this->put(route('quotation.update', $quotation), [
            'company_details_id' => $clientId,
            'attnto' => 'Sam',
            'clientemail' => 'sam@example.com',
            'your_ref' => 'PO-1',
            'revno' => 1,
            'sst' => '0',
            'issuermail' => $user->id,
            'user_email' => $user->id,
            'currency' => $currencyId,
            'attachments' => [UploadedFile::fake()->create('drawing.pdf', 20, 'application/pdf')],
        ])->assertRedirect();

        $attachments = $quotation->fresh()->attachments();

        $this->assertCount(2, $attachments);
        $this->assertSame('quotation/existing.pdf', $attachments[0]);
        Storage::disk('local')->assertExists($attachments[1]);
    }

    public function test_an_attachment_that_is_gone_returns_not_found()
    {
        Storage::fake('local');

        $this->actingAsQuotationUser('quotation-show');

        $quotation = $this->makeQuotation(['attachment' => 'quotation/missing.pdf']);

        $this->get(route('quotation.attachment', [$quotation, 0]))->assertNotFound();
        $this->get(route('quotation.attachment', [$quotation, 5]))->assertNotFound();
    }

    public function test_the_detail_page_carries_the_lines_and_totals()
    {
        $this->actingAsQuotationUser('quotation-show');

        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD', 'myrrate' => 4.5]);

        $quotation = $this->makeQuotation([
            'company_details_id' => $clientId,
            'currency' => (string) $currencyId,
        ]);
        $this->addLine($quotation, ['qty' => 2, 'price' => 25, 'total' => 50, 'stockcode' => 'RTJ-1']);

        $this->get(route('quotation.show', $quotation))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('quotation.client.cname', 'Acme Energy')
                ->where('quotation.currency', 'USD')
                ->where('lines.0.stockcode', 'RTJ-1')
                ->where('totals.grand_total', 50)
            );
    }

    /**
     * @return array<string, mixed>
     */
    private function lineAttributes(array $overrides = []): array
    {
        return [
            'product' => 'spw',
            'stockcode' => 'SPW-1',
            'description' => 'Spiral wound gasket',
            'unit' => 'Unit',
            'qty' => 2,
            'cost_price' => 100,
            'shipping_cost' => 10,
            'mark_up' => 20,
            'import_duty' => 5,
            ...$overrides,
        ];
    }

    public function test_the_unit_price_stacks_shipping_then_markup_then_duty()
    {
        $this->actingAsQuotationUser('quotation-product-add');

        DB::table('tax')->insert(['name' => 'SST', 'value' => 6]);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD', 'myrrate' => 4]);
        $quotation = $this->makeQuotation(['currency' => (string) $currencyId, 'sst' => 0]);

        $this->post(route('quotation.line.store', $quotation), $this->lineAttributes())
            ->assertRedirect();

        // 100 + 10% = 110, + 20% = 132, + 5% = 138.60
        $line = $quotation->lines()->first();

        $this->assertEqualsWithDelta(138.60, $line->price, 0.001);
        $this->assertEqualsWithDelta(277.20, $line->total, 0.001);
        $this->assertEqualsWithDelta(0, $line->sst, 0.001);
        $this->assertEqualsWithDelta(1108.8, $line->totalmyr, 0.01);
    }

    public function test_line_sst_is_charged_only_when_the_quotation_opts_in()
    {
        $this->actingAsQuotationUser('quotation-product-add');

        DB::table('tax')->insert(['name' => 'SST', 'value' => 6]);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'MYR', 'myrrate' => 1]);
        $quotation = $this->makeQuotation(['currency' => (string) $currencyId, 'sst' => 1]);

        $this->post(route('quotation.line.store', $quotation), $this->lineAttributes([
            'cost_price' => 100,
            'shipping_cost' => 0,
            'mark_up' => 0,
            'import_duty' => 0,
            'qty' => 1,
        ]))->assertRedirect();

        $this->assertEqualsWithDelta(6, $quotation->lines()->first()->sst, 0.001);
    }

    public function test_item_numbers_continue_from_the_highest_on_the_quotation()
    {
        $this->actingAsQuotationUser('quotation-product-add');

        DB::table('tax')->insert(['name' => 'SST', 'value' => 6]);
        $quotation = $this->makeQuotation();
        $this->addLine($quotation, ['qty' => 1, 'price' => 1, 'total' => 1, 'item' => 7]);

        $this->post(route('quotation.line.store', $quotation), $this->lineAttributes())
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        // The relation already orders by item, so ask for the maximum rather
        // than adding a second, losing sort.
        $this->assertSame(8, (int) $quotation->lines()->max('item'));
    }

    public function test_adding_a_line_needs_the_product_add_permission()
    {
        $this->actingAsQuotationUser('quotation-edit');

        $quotation = $this->makeQuotation();

        $this->post(route('quotation.line.store', $quotation), $this->lineAttributes())
            ->assertForbidden();
    }

    public function test_a_line_cannot_be_changed_through_another_quotation()
    {
        $this->actingAsQuotationUser('quotation-edit', 'quotation-delete');

        DB::table('tax')->insert(['name' => 'SST', 'value' => 6]);
        $owner = $this->makeQuotation();
        $other = $this->makeQuotation();
        $this->addLine($owner, ['qty' => 1, 'price' => 1, 'total' => 1]);
        $line = $owner->lines()->first();

        $this->put(route('quotation.line.update', [$other, $line]), $this->lineAttributes())
            ->assertNotFound();

        $this->delete(route('quotation.line.destroy', [$other, $line]))->assertNotFound();

        $this->assertDatabaseHas('quote_descs', ['id' => $line->id]);
    }

    public function test_a_line_can_be_removed()
    {
        $this->actingAsQuotationUser('quotation-delete');

        $quotation = $this->makeQuotation();
        $this->addLine($quotation, ['qty' => 1, 'price' => 1, 'total' => 1]);
        $line = $quotation->lines()->first();

        $this->delete(route('quotation.line.destroy', [$quotation, $line]))
            ->assertRedirect();

        $this->assertDatabaseMissing('quote_descs', ['id' => $line->id]);
    }

    public function test_the_line_total_ignores_a_stored_total_that_already_holds_sst()
    {
        $this->actingAsQuotationUser('quotation-show');

        $quotation = $this->makeQuotation(['sst' => 1]);
        // How rows written before the current pricing code look: the stored
        // total already includes the SST value.
        $this->addLine($quotation, [
            'qty' => 2,
            'price' => 100,
            'sst' => 20,
            'total' => 220,
        ]);

        $this->get(route('quotation.show', $quotation))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('lines.0.line_total', 220)
                ->where('totals.subtotal', 220)
                ->where('totals.grand_total', 220)
            );
    }
}
