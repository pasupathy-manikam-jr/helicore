import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
import ConfirmDelete from '@/components/confirm-delete';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { index } from '@/routes/client';
import { Pencil, Plus } from 'lucide-react';
import ClientFormDialog from './client-form-dialog';
import type { Client, Salesperson } from './types';

type Props = {
    clients: Client[];
    salespeople: Salesperson[];
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<Client>();

export default function ClientsIndex({ clients, salespeople, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('cname', {
                    header: 'Name',
                    cell: ({ row }) => (
                        <>
                            <span className="font-medium">
                                {row.original.cname}
                            </span>
                            <div className="text-muted-foreground text-xs">
                                {row.original.regno}
                            </div>
                        </>
                    ),
                }),
                helper.accessor(
                    (row) => [row.city, row.country].filter(Boolean).join(', '),
                    { id: 'location', header: 'Location' },
                ),
                helper.accessor('attn', {
                    header: 'Attention',
                    cell: ({ row }) => (
                        <>
                            {row.original.attn}
                            <div className="text-muted-foreground text-xs">
                                {row.original.phone}
                            </div>
                        </>
                    ),
                }),
                helper.accessor('client_email', { header: 'Email' }),
                helper.accessor('cstatus', { header: 'Type' }),
                helper.accessor('salesperson', { header: 'Salesperson' }),
                helper.accessor('delivery_addresses_count', {
                    header: 'Addresses',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.accessor('status', {
                    header: 'Status',
                    cell: ({ getValue }) => (
                        <span
                            className={
                                getValue() === 'Obsolete'
                                    ? 'text-muted-foreground'
                                    : 'text-primary font-semibold'
                            }
                        >
                            {getValue() ?? 'Active'}
                        </span>
                    ),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <ClientFormDialog
                                    salespeople={salespeople}
                                    client={row.original}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${row.original.cname}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            )}

                            {can.delete && (
                                <ConfirmDelete
                                    url={ClientController.destroy.url(
                                        row.original.id,
                                    )}
                                    label={row.original.cname ?? 'client'}
                                />
                            )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [salespeople, can.edit, can.delete],
    );

    const table = useAppTable({
        data: clients,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Clients" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Clients"
                    description={`${clients.length} client(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search clients…"
                    emptyMessage="No clients found."
                    toolbar={
                        can.create && (
                            <ClientFormDialog
                                salespeople={salespeople}
                                trigger={
                                    <Button>
                                        <Plus /> Add client
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

ClientsIndex.layout = {
    breadcrumbs: [{ title: 'Clients', href: index() }],
};
