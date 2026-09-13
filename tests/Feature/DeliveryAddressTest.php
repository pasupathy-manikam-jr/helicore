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

class DeliveryAddressTest extends TestCase
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

        Schema::create('sales_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('delivery_address')->nullable();
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
    private function addressAttributes(int $clientId, array $overrides = []): array
    {
        return [
            'company_detail_id' => $clientId,
            'customer_name' => 'Acme Site A',
            'email' => 'site@example.com',
            'address' => '2 Jetty Lane',
            'city' => 'Johor',
            'state' => 'Johor',
            'country' => 'Malaysia',
            'location_type' => 'CL',
            'telephone' => '0712345678',
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('client-delivery.index'))->assertRedirect(route('login'));
    }

    public function test_the_listing_carries_the_parent_client_name()
    {
        $this->actingAsClientUser('company-list');

        $client = Client::create(['cname' => 'Acme Energy']);
        DeliveryAddress::create($this->addressAttributes($client->id));

        $this->get(route('client-delivery.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('addresses.0.customer_name', 'Acme Site A')
                ->where('addresses.0.client_name', 'Acme Energy')
            );
    }

    public function test_an_address_for_an_unknown_client_is_rejected()
    {
        $this->actingAsClientUser('company-create');

        $this->post(route('client-delivery.store'), $this->addressAttributes(404))
            ->assertSessionHasErrors('company_detail_id');
    }

    public function test_an_address_used_by_a_sales_order_cannot_be_deleted()
    {
        $this->actingAsClientUser('company-delete');

        $client = Client::create(['cname' => 'Acme Energy']);
        $address = DeliveryAddress::create($this->addressAttributes($client->id));
        DB::table('sales_orders')->insert(['delivery_address' => $address->id]);

        $this->delete(route('client-delivery.destroy', $address))->assertRedirect();

        $this->assertDatabaseHas('delivery_address', ['id' => $address->id]);
    }

    public function test_an_unused_address_can_be_deleted()
    {
        $this->actingAsClientUser('company-delete');

        $client = Client::create(['cname' => 'Acme Energy']);
        $address = DeliveryAddress::create($this->addressAttributes($client->id));

        $this->delete(route('client-delivery.destroy', $address))->assertRedirect();

        $this->assertDatabaseMissing('delivery_address', ['id' => $address->id]);
    }
}
