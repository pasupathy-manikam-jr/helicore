<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller implements HasMiddleware
{
    /**
     * @return array<int, Middleware|string>
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('permission:users-list', only: ['index']),
            new Middleware('permission:users-create', only: ['store']),
            new Middleware('permission:users-edit', only: ['update']),
            new Middleware('permission:users-delete', only: ['destroy']),
        ];
    }

    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            // Explicit columns: the table also holds password hashes and
            // two factor secrets, and none of that belongs in a page prop.
            'users' => User::query()
                ->with('roles:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'avatar', 'department', 'position', 'mobile_phone'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'department' => $user->department,
                    'position' => $user->position,
                    'mobile_phone' => $user->mobile_phone,
                    'roles' => $user->roles->pluck('name')->all(),
                ]),
            'roles' => Role::query()->orderBy('name')->pluck('name'),
            'currentUserId' => $request->user()->id,
            'can' => [
                'create' => $request->user()->can('users-create'),
                'edit' => $request->user()->can('users-edit'),
                'delete' => $request->user()->can('users-delete'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'department' => $data['department'] ?? null,
            'position' => $data['position'] ?? null,
            'mobile_phone' => $data['mobile_phone'] ?? null,
        ]);

        $user->syncRoles($data['roles'] ?? []);

        return $this->done('User created.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate($this->rules($user));

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'department' => $data['department'] ?? null,
            'position' => $data['position'] ?? null,
            'mobile_phone' => $data['mobile_phone'] ?? null,
        ]);

        // Blank means "leave the current password alone".
        if (filled($data['password'] ?? null)) {
            $user->password = $data['password'];
        }

        $user->save();

        // Changing your own roles would let any user with users-edit grant
        // themselves anything; that has to go through somebody else.
        if ($user->isNot($request->user())) {
            $user->syncRoles($data['roles'] ?? []);
        }

        return $this->done('User updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return $this->refuse('You cannot delete your own account.');
        }

        if ($this->isLastAdministrator($user)) {
            return $this->refuse('This is the last administrator, so it cannot be deleted.');
        }

        $user->delete();

        return $this->done('User deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?User $user = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user),
            ],
            // Required on create, optional on edit.
            'password' => [
                $user ? 'nullable' : 'required',
                'confirmed',
                Password::defaults(),
            ],
            'department' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'mobile_phone' => ['nullable', 'string', 'max:40'],
            'roles' => ['array'],
            'roles.*' => ['string', Rule::exists('roles', 'name')],
        ];
    }

    private function isLastAdministrator(User $user): bool
    {
        return $user->hasRole('administrator')
            && User::role('administrator')->count() <= 1;
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
