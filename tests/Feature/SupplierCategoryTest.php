<?php

namespace Tests\Feature;

use App\Models\SupplierCategory;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SupplierCategoryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Both tables predate this app and so have no migrations of their own.
     */
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('supplier_category', function (Blueprint $table) {
            $table->increments('id');
            $table->string('category')->nullable();
            $table->string('subcategory')->nullable();
        });

        Schema::create('supplier', function (Blueprint $table) {
            $table->increments('id');
            $table->string('supplier_name')->nullable();
            $table->string('supplier_category_id')->nullable();
            $table->timestamps();
        });
    }

    private function actingAsSupplierUser(string ...$permissions): User
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
        $this->get(route('supplier-category.index'))
            ->assertRedirect(route('login'));
    }

    public function test_users_without_the_list_permission_are_forbidden()
    {
        $this->actingAsSupplierUser('supplier-create');

        $this->get(route('supplier-category.index'))->assertForbidden();
    }

    public function test_supplier_usage_is_tallied_from_the_comma_separated_column()
    {
        $this->actingAsSupplierUser('supplier-list');

        $tools = SupplierCategory::create(['category' => 'Assets', 'subcategory' => 'Tools']);
        $spare = SupplierCategory::create(['category' => 'Assets', 'subcategory' => 'Spares']);
        $unused = SupplierCategory::create(['category' => 'Assets', 'subcategory' => 'Unused']);

        DB::table('supplier')->insert([
            ['supplier_name' => 'A', 'supplier_category_id' => "{$tools->id},{$spare->id}"],
            ['supplier_name' => 'B', 'supplier_category_id' => (string) $tools->id],
            ['supplier_name' => 'C', 'supplier_category_id' => ''],
        ]);

        $this->get(route('supplier-category.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('categories.0.subcategory', 'Spares')
                ->where('categories.0.supplier_count', 1)
                ->where('categories.2.subcategory', 'Unused')
                ->where('categories.2.supplier_count', 0)
            );
    }

    public function test_a_category_still_in_use_cannot_be_deleted()
    {
        $this->actingAsSupplierUser('supplier-list', 'supplier-delete');

        $category = SupplierCategory::create(['category' => 'Assets', 'subcategory' => 'Tools']);
        DB::table('supplier')->insert([
            'supplier_name' => 'A',
            'supplier_category_id' => (string) $category->id,
        ]);

        $this->delete(route('supplier-category.destroy', $category))->assertRedirect();

        $this->assertDatabaseHas('supplier_category', ['id' => $category->id]);
    }

    public function test_an_unused_category_is_deleted()
    {
        $this->actingAsSupplierUser('supplier-list', 'supplier-delete');

        $category = SupplierCategory::create(['category' => 'Assets', 'subcategory' => 'Tools']);

        $this->delete(route('supplier-category.destroy', $category))->assertRedirect();

        $this->assertDatabaseMissing('supplier_category', ['id' => $category->id]);
    }

    public function test_subcategories_must_be_unique_except_for_the_row_being_edited()
    {
        $this->actingAsSupplierUser('supplier-list', 'supplier-create', 'supplier-edit');

        $tools = SupplierCategory::create(['category' => 'Assets', 'subcategory' => 'Tools']);

        $this->post(route('supplier-category.store'), [
            'category' => 'Assets',
            'subcategory' => 'Tools',
        ])->assertSessionHasErrors('subcategory');

        $this->put(route('supplier-category.update', $tools), [
            'category' => 'Consumables',
            'subcategory' => 'Tools',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('supplier_category', [
            'id' => $tools->id,
            'category' => 'Consumables',
        ]);
    }
}
