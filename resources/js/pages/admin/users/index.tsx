import { Head } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useMemo } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import ConfirmDelete from '@/components/confirm-delete';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { MatChip } from '@/components/mat-chip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { index } from '@/routes/admin/user';
import type { AdminUser } from './types';
import UserFormDialog from './user-form-dialog';

type Props = {
    users: AdminUser[];
    roles: string[];
    currentUserId: number;
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<AdminUser>();

export default function UsersIndex({
    users,
    roles,
    currentUserId,
    can,
}: Props) {
    const getInitials = useInitials();

    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('name', {
                    header: 'User',
                    cell: ({ row }) => (
                        <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                                <AvatarFallback className="text-xs">
                                    {getInitials(row.original.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">
                                    {row.original.name}
                                    {row.original.id === currentUserId && (
                                        <span className="text-muted-foreground ml-2 text-xs">
                                            you
                                        </span>
                                    )}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {row.original.email}
                                </div>
                            </div>
                        </div>
                    ),
                }),
                helper.accessor('department', { header: 'Department' }),
                helper.accessor('position', { header: 'Position' }),
                helper.accessor((row) => row.roles.join(', '), {
                    id: 'roles',
                    header: 'Roles',
                    cell: ({ row }) => (
                        <div className="flex flex-wrap gap-1">
                            {row.original.roles.map((role) => (
                                <MatChip key={role} group={role}>
                                    {role}
                                </MatChip>
                            ))}
                        </div>
                    ),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <UserFormDialog
                                    roles={roles}
                                    user={row.original}
                                    isSelf={row.original.id === currentUserId}
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

                            {can.delete &&
                                row.original.id !== currentUserId && (
                                    <ConfirmDelete
                                        url={UserController.destroy.url(
                                            row.original.id,
                                        )}
                                        label={row.original.name}
                                        description="The account is removed and the person loses access immediately."
                                    />
                                )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roles, currentUserId, can.edit, can.delete],
    );

    const table = useAppTable({
        data: users,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Users" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Users"
                    description={`${users.length} account(s) with access to Helicore.`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search name, email or department…"
                    emptyMessage="No users found."
                    toolbar={
                        can.create && (
                            <UserFormDialog
                                roles={roles}
                                trigger={
                                    <Button>
                                        <Plus /> Add user
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

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: index() }],
};
