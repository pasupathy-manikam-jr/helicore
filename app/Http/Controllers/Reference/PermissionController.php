<?php

namespace App\Http\Controllers\Reference;

use Spatie\Permission\Models\Permission;

class PermissionController extends ReferenceController
{
    protected const PERMISSION = 'permissions';

    /** The legacy permission set has no `permissions-list`; viewing is gated on show. */
    protected const LIST_PERMISSION = 'permissions-show';

    protected function model(): string
    {
        return Permission::class;
    }

    protected function meta(): array
    {
        return [
            'title' => 'Permissions',
            'description' => 'The individual rights roles are built from. Names are referenced directly in code, so renaming one silently removes access until the code is updated too.',
            'singular' => 'Permission',
            'basePath' => '/admin/permission',
        ];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'module', 'label' => 'Module', 'type' => 'text', 'help' => 'Groups the permission on the roles screen.'],
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'unique' => true, 'help' => 'Matched in code, e.g. supplier-edit.'],
            ['name' => 'sequence', 'label' => 'Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function usedBy(): array
    {
        return [['role_has_permissions', 'permission_id']];
    }
}
