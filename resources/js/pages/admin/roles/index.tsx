import { Head } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useMemo } from 'react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import ConfirmDelete from '@/components/confirm-delete';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { index } from '@/routes/admin/role';
import RoleFormDialog from './role-form-dialog';
import type { AdminRole, PermissionModules } from './types';

type Props = {
    roles: AdminRole[];
    modules: PermissionModules;
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<AdminRole>();

export default function RolesIndex({ roles, modules, can }: Props) {
    const totalPermissions = useMemo(
        () => Object.values(modules).flat().length,
        [modules],
    );

    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('name', {
                    header: 'Role',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('users_count', {
                    header: 'Users',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.accessor((row) => row.permissions.length, {
                    id: 'permissions',
                    header: 'Permissions',
                    cell: ({ row }) => (
                        <span className="tabular-nums">
                            {row.original.permissions.length}
                            <span className="text-muted-foreground">
                                {' '}
                                of {totalPermissions}
                            </span>
                        </span>
                    ),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <RoleFormDialog
                                    modules={modules}
                                    role={row.original}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${row.original.name}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            )}

                            {can.delete && !row.original.protected && (
                                <ConfirmDelete
                                    url={RoleController.destroy.url(
                                        row.original.id,
                                    )}
                                    label={row.original.name}
                                    description="Roles still assigned to users cannot be deleted."
                                />
                            )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [modules, totalPermissions, can.edit, can.delete],
    );

    const table = useAppTable({
        data: roles,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Roles" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Roles"
                    description={`${roles.length} role(s) built from ${totalPermissions} permissions.`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search roles…"
                    emptyMessage="No roles yet."
                    toolbar={
                        can.create && (
                            <RoleFormDialog
                                modules={modules}
                                trigger={
                                    <Button>
                                        <Plus /> Add role
                                    </Button>
                                }
                            />
                        )
                    }
                />
            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [{ title: 'Roles', href: index() }],
};
