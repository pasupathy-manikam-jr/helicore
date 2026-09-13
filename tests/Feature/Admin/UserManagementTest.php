<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
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
        $this->get(route('admin.user.index'))->assertRedirect(route('login'));
    }

    public function test_the_list_permission_gates_the_page()
    {
        $this->actingWith('users-create');

        $this->get(route('admin.user.index'))->assertForbidden();
    }

    public function test_password_hashes_and_two_factor_secrets_are_never_sent_to_the_browser()
    {
        $this->actingWith('users-list');
        User::factory()->create([
            'password' => Hash::make('secret-Password-1'),
            'two_factor_secret' => 'top-secret-value',
        ]);

        $response = $this->get(route('admin.user.index'))->assertOk();

        $response->assertDontSee('$2y$', false);
        $response->assertDontSee('top-secret-value', false);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->missing('users.0.password')
            ->missing('users.0.two_factor_secret')
        );
    }

    public function test_a_new_user_gets_a_hashed_password_and_the_chosen_roles()
    {
        $this->actingWith('users-list', 'users-create');
        Role::findOrCreate('sales', 'web');

        $this->post(route('admin.user.store'), [
            'name' => 'Nadia',
            'email' => 'nadia@example.com',
            'password' => 'correct-horse-9',
            'password_confirmation' => 'correct-horse-9',
            'roles' => ['sales'],
        ])->assertSessionHasNoErrors();

        $created = User::where('email', 'nadia@example.com')->firstOrFail();

        $this->assertNotSame('correct-horse-9', $created->password);
        $this->assertTrue(Hash::check('correct-horse-9', $created->password));
        $this->assertTrue($created->hasRole('sales'));
    }

    public function test_a_weak_or_unconfirmed_password_is_rejected()
    {
        $this->actingWith('users-list', 'users-create');

        $this->post(route('admin.user.store'), [
            'name' => 'Nadia',
            'email' => 'nadia@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertSessionHasErrors('password');

        $this->post(route('admin.user.store'), [
            'name' => 'Nadia',
            'email' => 'nadia2@example.com',
            'password' => 'correct-horse-9',
            'password_confirmation' => 'different-horse-9',
        ])->assertSessionHasErrors('password');
    }

    public function test_a_blank_password_on_edit_leaves_the_current_one_alone()
    {
        $this->actingWith('users-list', 'users-edit');
        $target = User::factory()->create(['password' => Hash::make('original-Password-1')]);

        $this->put(route('admin.user.update', $target), [
            'name' => 'Renamed',
            'email' => $target->email,
            'password' => '',
        ])->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('original-Password-1', $target->fresh()->password));
        $this->assertSame('Renamed', $target->fresh()->name);
    }

    public function test_a_user_cannot_grant_themselves_a_role()
    {
        Role::findOrCreate('administrator', 'web');
        $user = $this->actingWith('users-list', 'users-edit');

        $this->put(route('admin.user.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'roles' => ['administrator'],
        ])->assertSessionHasNoErrors();

        $this->assertFalse($user->fresh()->hasRole('administrator'));
    }

    public function test_a_user_cannot_delete_their_own_account()
    {
        $user = $this->actingWith('users-list', 'users-delete');

        $this->delete(route('admin.user.destroy', $user))->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_the_last_administrator_cannot_be_deleted()
    {
        $this->actingWith('users-list', 'users-delete');
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('administrator', 'web'));

        $this->delete(route('admin.user.destroy', $admin))->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_an_administrator_can_be_deleted_when_another_remains()
    {
        $this->actingWith('users-list', 'users-delete');
        $role = Role::findOrCreate('administrator', 'web');
        $first = User::factory()->create();
        $second = User::factory()->create();
        $first->assignRole($role);
        $second->assignRole($role);

        $this->delete(route('admin.user.destroy', $first))->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $first->id]);
    }
}
