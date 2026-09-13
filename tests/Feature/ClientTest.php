<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\DeliveryAddress;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The legacy tables predate this app and so have no migrations.
     */
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('company_details', function (Blueprint $table) {
            $table->increments('id');
            $table->string('cname')->nullable();
            $table->string('regno')->nullable();
            $table->string('gst_regno')->nullable();
            $table->string('address', 500)->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('phone')->nullable();
            $table->string('fax')->nullable();
            $table->string('attn')->nullable();
            $table->string('client_email')->nullable();
            $table->string('user_email')->nullable();
            $table->string('cstatus', 20)->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('status', 10)->nullable();
            $table->timestamps();
        });

        Schema::create('delivery_address', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('company_detail_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('email')->nullable();
            $table->string('address', 500)->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('location_type', 6)->nullable();
            $table->string('fax')->nullable();
            $table->string('telephone')->nullable();
            $table->timestamps();
        });

        Schema::create('quote_refs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('company_details_id')->nullable();
        });
    }

    private function actingAsClientUser(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    private function clientAttributes(array $overrides = []): array
    {
        return [
            'cname' => 'Acme Energy',
            'regno' => 'R-1',
            'address' => '1 Refinery Road',
            'city' => 'Kuala Lumpur',
            'state' => 'Selangor',
            'country' => 'Malaysia',
            'phone' => '0312345678',
            'attn' => 'Sam',
            'client_email' => 'sam@example.com',
            'cstatus' => 'PLC',
            'payment_terms' => '30 days',
            'status' => 'Active',
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('client.index'))->assertRedirect(route('login'));
    }

    public function test_users_without_the_list_permission_are_forbidden()
    {
        $this->actingAsClientUser('company-create');

        $this->get(route('client.index'))->assertForbidden();
    }

    public function test_the_listing_resolves_the_salesperson_and_counts_addresses()
    {
        $user = $this->actingAsClientUser('company-list');

        $client = Client::create($this->clientAttributes(['user_email' => (string) $user->id]));
        $legacy = Client::create($this->clientAttributes([
            'cname' => 'Zenith Oil',
            'user_email' => 'lailatul',
        ]));

        DeliveryAddress::create([
            'company_detail_id' => $client->id,
            'customer_name' => 'Acme Site A',
        ]);

        $this->get(route('client.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('clients.0.cname', 'Acme Energy')
                ->where('clients.0.salesperson', $user->name)
                ->where('clients.0.delivery_addresses_count', 1)
                ->where('clients.1.id', $legacy->id)
                ->where('clients.1.salesperson', 'lailatul')
                ->where('clients.1.delivery_addresses_count', 0)
            );
    }

    public function test_a_client_can_be_created()
    {
        $user = $this->actingAsClientUser('company-create');

        $this->post(route('client.store'), $this->clientAttributes([
            'user_email' => $user->id,
        ]))->assertRedirect();

        $this->assertDatabaseHas('company_details', ['cname' => 'Acme Energy']);
    }

    public function test_the_server_rejects_an_empty_submission()
    {
        $this->actingAsClientUser('company-create');

        $this->post(route('client.store'), [])->assertSessionHasErrors([
            'cname', 'regno', 'address', 'city', 'state', 'country', 'phone',
            'attn', 'client_email', 'user_email', 'cstatus', 'payment_terms',
            'status',
        ]);

        $this->assertDatabaseCount('company_details', 0);
    }

    public function test_an_unknown_company_type_is_rejected()
    {
        $user = $this->actingAsClientUser('company-create');

        $this->post(route('client.store'), $this->clientAttributes([
            'user_email' => $user->id,
            'cstatus' => 'PARTNERSHIP',
        ]))->assertSessionHasErrors('cstatus');
    }

    public function test_a_client_with_delivery_addresses_cannot_be_deleted()
    {
        $this->actingAsClientUser('company-delete');

        $client = Client::create($this->clientAttributes());
        DeliveryAddress::create([
            'company_detail_id' => $client->id,
            'customer_name' => 'Acme Site A',
        ]);

        $this->delete(route('client.destroy', $client))->assertRedirect();

        $this->assertDatabaseHas('company_details', ['id' => $client->id]);
    }

    public function test_a_client_referenced_by_quotations_cannot_be_deleted()
    {
        $this->actingAsClientUser('company-delete');

        $client = Client::create($this->clientAttributes());
        DB::table('quote_refs')->insert(['company_details_id' => $client->id]);

        $this->delete(route('client.destroy', $client))->assertRedirect();

        $this->assertDatabaseHas('company_details', ['id' => $client->id]);
    }

    public function test_an_unreferenced_client_can_be_deleted()
    {
        $this->actingAsClientUser('company-delete');

        $client = Client::create($this->clientAttributes());

        $this->delete(route('client.destroy', $client))->assertRedirect();

        $this->assertDatabaseMissing('company_details', ['id' => $client->id]);
    }
}
