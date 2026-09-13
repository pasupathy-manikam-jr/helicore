import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import DeliveryAddressController from '@/actions/App/Http/Controllers/DeliveryAddressController';
import ConfirmDelete from '@/components/confirm-delete';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { index } from '@/routes/client-delivery';
import { Pencil, Plus } from 'lucide-react';
import DeliveryAddressFormDialog from './delivery-address-form-dialog';
import type { ClientOption, DeliveryAddress } from './types';

type Props = {
    addresses: DeliveryAddress[];
    clients: ClientOption[];
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<DeliveryAddress>();

export default function DeliveryAddressesIndex({
    addresses,
    clients,
    can,
}: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('customer_name', {
                    header: 'Customer',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('client_name', { header: 'Client' }),
                helper.accessor('address', {
                    header: 'Address',
                    cell: ({ row }) => (
                        <>
                            <span className="line-clamp-2">
                                {row.original.address}
                            </span>
                            <div className="text-muted-foreground text-xs">
                                {[row.original.city, row.original.country]
                                    .filter(Boolean)
                                    .join(', ')}
                            </div>
                        </>
                    ),
                }),
                helper.accessor('telephone', { header: 'Telephone' }),
                helper.accessor('email', { header: 'Email' }),
                helper.accessor('location_type', { header: 'Location' }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <DeliveryAddressFormDialog
                                    clients={clients}
                                    address={row.original}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${row.original.customer_name}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            )}

                            {can.delete && (
                                <ConfirmDelete
                                    url={DeliveryAddressController.destroy.url(
                                        row.original.id,
                                    )}
                                    label={
                                        row.original.customer_name ?? 'address'
                                    }
                                />
                            )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [clients, can.edit, can.delete],
    );

    const table = useAppTable({
        data: addresses,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Delivery addresses" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Delivery addresses"
                    description={`${addresses.length} address(es) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search delivery addresses…"
                    emptyMessage="No delivery addresses found."
                    toolbar={
                        can.create && (
                            <DeliveryAddressFormDialog
                                clients={clients}
                                trigger={
                                    <Button>
                                        <Plus /> Add address
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

DeliveryAddressesIndex.layout = {
    breadcrumbs: [{ title: 'Delivery addresses', href: index() }],
};
