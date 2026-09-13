<?php

namespace Tests\Feature;

use App\Models\StockItem;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class StockCodeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * One table per product line, all the same shape, none with a migration.
     */
    protected function setUp(): void
    {
        parent::setUp();

        foreach (StockItem::PRODUCTS as $meta) {
            Schema::create($meta['table'], function (Blueprint $table) {
                $table->increments('id');
                $table->string('stock_code')->nullable();
                $table->string('description', 1000)->nullable();
                $table->decimal('weight', 10, 2)->nullable();
                $table->decimal('price', 10, 2)->nullable();
                $table->string('main_code', 50)->nullable();
                $table->string('size', 20)->nullable();
                $table->string('rating', 20)->nullable();
                $table->integer('stock_take')->nullable();
                $table->integer('stock_out')->nullable();
                $table->integer('balance')->default(0);
            });
        }
    }

    private function actingAsStockUser(string ...$permissions): User
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
        $this->get(route('stock-code.index'))->assertRedirect(route('login'));
    }

    public function test_users_without_the_permission_are_forbidden()
    {
        $this->actingAsStockUser('supplier-list');

        $this->get(route('stock-code.index'))->assertForbidden();
    }

    public function test_the_listing_defaults_to_the_first_product_line()
    {
        $this->actingAsStockUser('product-stockcodedescription');

        DB::table('rtj_stock')->insert(['stock_code' => '6-304OV-R23', 'main_code' => '6-304OV']);
        DB::table('spw_stock')->insert(['stock_code' => 'SPW-1', 'main_code' => 'SPW']);

        $this->get(route('stock-code.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('product', 'rtj')
                ->where('items.0.stock_code', '6-304OV-R23')
                ->count('items', 1)
            );
    }

    public function test_the_product_query_parameter_switches_table()
    {
        $this->actingAsStockUser('product-stockcodedescription');

        DB::table('spw_stock')->insert(['stock_code' => 'SPW-1', 'main_code' => 'SPW']);

        $this->get(route('stock-code.index', ['product' => 'spw']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('product', 'spw')
                ->where('items.0.stock_code', 'SPW-1')
            );
    }

    public function test_an_unknown_product_is_rejected()
    {
        $this->actingAsStockUser('product-stockcodedescription');

        $this->get(route('stock-code.index', ['product' => 'drop-table']))
            ->assertSessionHasErrors('product');
    }

    public function test_an_update_writes_to_that_products_table()
    {
        $this->actingAsStockUser('product-stockcodedescription');

        $id = DB::table('ins_stock')->insertGetId([
            'stock_code' => 'INS-1',
            'description' => 'Old',
            'weight' => 1,
            'price' => 2,
        ]);

        $this->put(route('stock-code.update', ['product' => 'ins', 'id' => $id]), [
            'description' => 'New description',
            'weight' => '3.50',
            'price' => '9.99',
        ])->assertRedirect();

        $this->assertDatabaseHas('ins_stock', [
            'id' => $id,
            'description' => 'New description',
            'weight' => '3.50',
            'price' => '9.99',
        ]);
    }

    public function test_stock_levels_cannot_be_edited_here()
    {
        $this->actingAsStockUser('product-stockcodedescription');

        $id = DB::table('kz_stock')->insertGetId([
            'stock_code' => 'KZ-1',
            'balance' => 7,
        ]);

        $this->put(route('stock-code.update', ['product' => 'kz', 'id' => $id]), [
            'description' => 'New',
            'weight' => 1,
            'price' => 1,
            'balance' => 999,
        ])->assertRedirect();

        $this->assertDatabaseHas('kz_stock', ['id' => $id, 'balance' => 7]);
    }

    public function test_a_negative_price_is_rejected()
    {
        $this->actingAsStockUser('product-stockcodedescription');

        $id = DB::table('rtj_stock')->insertGetId(['stock_code' => 'RTJ-1', 'price' => 5]);

        $this->put(route('stock-code.update', ['product' => 'rtj', 'id' => $id]), [
            'description' => 'x',
            'weight' => 1,
            'price' => -1,
        ])->assertSessionHasErrors('price');
    }
}
