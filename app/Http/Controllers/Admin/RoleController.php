<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller implements HasMiddleware
{
    /** Roles the application depends on and so will not delete. */
    private const PROTECTED_ROLES = ['administrator'];

    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            // The legacy permission set has no `roles-list`.
            new Middleware('permission:roles-show', only: ['index']),
            new Middleware('permission:roles-create', only: ['store']),
            new Middleware('permission:roles-edit', only: ['update']),
            new Middleware('permission:roles-delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        return Inertia::render('admin/roles/index', [
            'roles' => Role::query()
                ->with('permissions:id,name')
                ->withCount('users')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'users_count' => $role->users_count,
                    'permissions' => $role->permissions->pluck('name')->all(),
                    'protected' => in_array($role->name, self::PROTECTED_ROLES, true),
                ]),

            // Grouped the way the permissions table orders them, so the form
            // reads module by module rather than as one long list.
            'modules' => Permission::query()
                ->orderBy('module')
                ->orderBy('sequence')
                ->get(['id', 'name', 'module'])
                ->groupBy('module')
                ->map(fn ($group) => $group->pluck('name')->all()),

            'can' => [
                'create' => $request->user()->can('roles-create'),
                'edit' => $request->user()->can('roles-edit'),
                'delete' => $request->user()->can('roles-delete'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());

        Role::create(['name' => $data['name']])
            ->syncPermissions($data['permissions'] ?? []);

        return $this->done('Role created.');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $data = $request->validate($this->rules($role));

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return $this->done('Role updated.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if (in_array($role->name, self::PROTECTED_ROLES, true)) {
            return $this->refuse("The {$role->name} role cannot be deleted.");
        }

        if ($role->users()->exists()) {
            return $this->refuse('That role is still assigned to users.');
        }

        $role->delete();

        return $this->done('Role deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?Role $role = null): array
    {
        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('roles', 'name')->ignore($role),
            ],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ];
    }

    private function refuse(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'error', 'message' => $message]);

        return back();
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}
