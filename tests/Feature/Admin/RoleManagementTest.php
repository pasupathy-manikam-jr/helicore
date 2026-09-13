<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

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
        $this->get(route('admin.role.index'))->assertRedirect(route('login'));
    }

    public function test_the_view_permission_gates_the_page()
    {
        $this->actingWith('roles-create');

        $this->get(route('admin.role.index'))->assertForbidden();
    }

    public function test_permissions_are_grouped_by_module()
    {
        $this->actingWith('roles-show');
        Permission::create(['name' => 'supplier-list', 'guard_name' => 'web', 'module' => 'supplier', 'sequence' => 1]);
        Permission::create(['name' => 'tax-index', 'guard_name' => 'web', 'module' => 'tax', 'sequence' => 1]);

        $this->get(route('admin.role.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/roles/index')
                ->where('modules.supplier', ['supplier-list'])
                ->where('modules.tax', ['tax-index'])
            );
    }

    public function test_syncing_permissions_replaces_rather_than_adds()
    {
        $this->actingWith('roles-show', 'roles-edit');
        foreach (['a-one', 'a-two', 'a-three'] as $name) {
            Permission::findOrCreate($name, 'web');
        }
        $role = Role::findOrCreate('sales', 'web');
        $role->syncPermissions(['a-one', 'a-two']);

        $this->put(route('admin.role.update', $role), [
            'name' => 'sales',
            'permissions' => ['a-three'],
        ])->assertSessionHasNoErrors();

        $this->assertSame(['a-three'], $role->fresh()->permissions->pluck('name')->all());
    }

    public function test_an_unknown_permission_name_is_rejected()
    {
        $this->actingWith('roles-show', 'roles-create');

        $this->post(route('admin.role.store'), [
            'name' => 'invented',
            'permissions' => ['not-a-real-permission'],
        ])->assertSessionHasErrors('permissions.0');
    }

    public function test_the_administrator_role_cannot_be_deleted()
    {
        $this->actingWith('roles-show', 'roles-delete');
        $role = Role::findOrCreate('administrator', 'web');

        $this->delete(route('admin.role.destroy', $role))->assertRedirect();

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    public function test_a_role_still_assigned_to_users_cannot_be_deleted()
    {
        $this->actingWith('roles-show', 'roles-delete');
        $role = Role::findOrCreate('sales', 'web');
        User::factory()->create()->assignRole($role);

        $this->delete(route('admin.role.destroy', $role))->assertRedirect();

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    public function test_an_unused_role_is_deleted()
    {
        $this->actingWith('roles-show', 'roles-delete');
        $role = Role::findOrCreate('retired', 'web');

        $this->delete(route('admin.role.destroy', $role))->assertRedirect();

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }
}
