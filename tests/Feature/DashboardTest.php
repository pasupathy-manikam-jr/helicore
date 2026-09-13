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
                }
            });
        }
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
}
