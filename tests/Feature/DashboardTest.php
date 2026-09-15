<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The dashboard reads legacy tables that predate this app and so have no
     * migrations. Stand up just enough of them for the test database.
     */
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['quote_refs', 'sales_orders', 'invoice', 'afe', 'supplier'] as $table) {
            Schema::create($table, function (Blueprint $blueprint) use ($table) {
                $blueprint->increments('id');
                $blueprint->timestamps();

                if ($table === 'afe') {
                    $blueprint->string('approvalstatus')->nullable();
                }

                if ($table === 'quote_refs') {
                    $blueprint->string('your_ref')->nullable();
                    $blueprint->string('attnto')->nullable();
                    $blueprint->string('client_buyer_name')->nullable();
                    $blueprint->integer('company_details_id')->nullable();
                    $blueprint->string('currency', 10)->nullable();
                    $blueprint->integer('sst')->nullable();
                    $blueprint->decimal('packcost', 10, 2)->nullable();
                    $blueprint->decimal('custom', 10, 2)->nullable();
                    $blueprint->decimal('miscvalue', 10, 2)->nullable();
                    $blueprint->string('freight', 30)->nullable();
                    $blueprint->decimal('discount', 10, 2)->nullable();
                }
            });
        }

        Schema::create('quote_descs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('our_ref')->nullable();
            $table->integer('item')->nullable();
            $table->integer('qty')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('total', 10, 2)->nullable();
            $table->decimal('sst', 10, 2)->nullable();
            $table->float('weight')->nullable();
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

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_the_root_url_sends_visitors_to_the_dashboard()
    {
        $this->get('/')->assertRedirect('/dashboard');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_only_unapproved_afes_are_counted_as_pending()
    {
        $this->travelTo(now());

        foreach (['Yes', 'No', ''] as $status) {
            DB::table('afe')->insert([
                'approvalstatus' => $status,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('pendingAfes', 2));
    }

    public function test_the_latest_quotations_carry_the_client_and_what_they_come_to()
    {
        $clientId = DB::table('company_details')->insertGetId(['cname' => 'Acme Energy']);
        $currencyId = DB::table('currency')->insertGetId(['name' => 'USD']);

        $older = DB::table('quote_refs')->insertGetId([
            'your_ref' => 'PO-1',
            'company_details_id' => $clientId,
            'currency' => (string) $currencyId,
            'discount' => 0,
            'created_at' => now()->subDay(),
        ]);
        $newest = DB::table('quote_refs')->insertGetId([
            'your_ref' => 'PO-2',
            'attnto' => 'Sam',
            'company_details_id' => $clientId,
            'currency' => (string) $currencyId,
            'discount' => 10,
            'created_at' => now(),
        ]);

        DB::table('quote_descs')->insert([
            ['our_ref' => $older, 'qty' => 1, 'price' => 50],
            ['our_ref' => $newest, 'qty' => 2, 'price' => 500],
        ]);

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('recentQuotations.0.id', $newest)
                ->where('recentQuotations.0.client', 'Acme Energy')
                ->where('recentQuotations.0.currency', 'USD')
                // 2 x 500, less the 10% discount.
                ->where('recentQuotations.0.value', 900)
                ->where('recentQuotations.1.id', $older)
            );
    }
}
