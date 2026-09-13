<?php

namespace Tests\Feature;

use App\Models\Currency;
use App\Models\Tnc;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ReferenceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('currency', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->decimal('myrrate', 12, 4)->nullable();
        });

        Schema::create('tnc', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->text('tnclist')->nullable();
            $table->timestamps();
        });

        foreach (['afe', 'quote_refs', 'sales_orders', 'stock_order_transfers'] as $name) {
            Schema::create($name, function (Blueprint $table) use ($name) {
                $table->increments('id');
                $table->string($name === 'afe' ? 'currency_id' : 'currency')->nullable();
                $table->string('tnc')->nullable();
            });
        }
    }

    private function actingWith(string ...$permissions): User
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
        $this->get(route('currency.index'))->assertRedirect(route('login'));
    }

    public function test_the_list_permission_gates_the_page()
    {
        $this->actingWith('currency-create');

        $this->get(route('currency.index'))->assertForbidden();
    }

    public function test_fields_are_rendered_for_the_resource()
    {
        $this->actingWith('currency-list');
        Currency::create(['name' => 'USD', 'myrrate' => 4.7]);

        $this->get(route('currency.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('reference/index')
                ->where('resource.basePath', '/currency')
                ->where('fields.0.name', 'name')
                ->where('fields.1.type', 'number')
                ->where('rows.0.name', 'USD')
            );
    }

    public function test_declared_rules_reject_a_duplicate_and_a_non_number()
    {
        $this->actingWith('currency-list', 'currency-create');
        Currency::create(['name' => 'USD', 'myrrate' => 4.7]);

        $this->post(route('currency.store'), ['name' => 'USD', 'myrrate' => 4.8])
            ->assertSessionHasErrors('name');

        $this->post(route('currency.store'), ['name' => 'SGD', 'myrrate' => 'abc'])
            ->assertSessionHasErrors('myrrate');
    }

    public function test_the_unique_rule_ignores_the_row_being_edited()
    {
        $this->actingWith('currency-list', 'currency-edit');
        $usd = Currency::create(['name' => 'USD', 'myrrate' => 4.7]);

        $this->put(route('currency.update', $usd), ['name' => 'USD', 'myrrate' => 4.9])
            ->assertSessionHasNoErrors();

        $this->assertEqualsWithDelta(4.9, (float) Currency::find($usd->id)->myrrate, 0.0001);
    }

    public function test_a_currency_in_use_is_not_deleted()
    {
        $this->actingWith('currency-list', 'currency-delete');
        $usd = Currency::create(['name' => 'USD', 'myrrate' => 4.7]);
        DB::table('sales_orders')->insert(['currency' => $usd->id]);

        $this->delete(route('currency.destroy', $usd))->assertRedirect();

        $this->assertDatabaseHas('currency', ['id' => $usd->id]);
    }

    public function test_an_unused_currency_is_deleted()
    {
        $this->actingWith('currency-list', 'currency-delete');
        $sgd = Currency::create(['name' => 'SGD', 'myrrate' => 3.1]);

        $this->delete(route('currency.destroy', $sgd))->assertRedirect();

        $this->assertDatabaseMissing('currency', ['id' => $sgd->id]);
    }

    public function test_terms_referenced_by_a_quotation_are_not_deleted()
    {
        $this->actingWith('tnc-list', 'tnc-delete');
        $terms = Tnc::create(['name' => 'Standard', 'tnclist' => "One\nTwo"]);
        DB::table('quote_refs')->insert(['tnc' => $terms->id]);

        $this->delete(route('terms.destroy', $terms))->assertRedirect();

        $this->assertDatabaseHas('tnc', ['id' => $terms->id]);
    }
}
