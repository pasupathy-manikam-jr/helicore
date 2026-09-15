import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { formatDate } from '@/lib/format';
import { index, show } from '@/routes/delivery-order';
import { Eye } from 'lucide-react';
import type { DeliveryOrderRow } from './types';

type Props = {
    orders: DeliveryOrderRow[];
    can: { edit: boolean };
};

const helper = createAppColumnHelper<DeliveryOrderRow>();

const SOURCE_LABELS: Record<string, string> = {
    salesorder: 'Sales order',
    workorder: 'Work order',
    stockordertransfer: 'Stock transfer',
};

export default function DeliveryOrdersIndex({ orders }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'DO no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Despatched',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('client', { header: 'Client' }),
                helper.accessor('type', {
                    header: 'Against',
                    cell: ({ row }) => (
                        <>
                            {SOURCE_LABELS[row.original.type ?? ''] ??
                                row.original.type}
                            <div className="text-muted-foreground text-xs">
                                {row.original.salesorder}
                            </div>
                        </>
                    ),
                }),
                helper.accessor('customer_order', {
                    header: 'Customer order',
                }),
                helper.accessor(
                    (row) =>
                        `${row.delivered_fsd_items ?? 0} / ${row.total_fsd_items ?? 0}`,
                    {
                        id: 'items',
                        header: 'Items out',
                        cell: ({ row }) => {
                            const done =
                                (row.original.delivered_fsd_items ?? 0) >=
                                (row.original.total_fsd_items ?? 0);

                            return (
                                <span
                                    className={
                                        done
                                            ? 'text-primary font-semibold'
                                            : undefined
                                    }
                                >
                                    {row.original.delivered_fsd_items ?? 0} /{' '}
                                    {row.original.total_fsd_items ?? 0}
                                </span>
                            );
                        },
                    },
                ),
                helper.accessor('status', { header: 'Status' }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View delivery order ${row.original.id}`}
                                asChild
                            >
                                <Link href={show(row.original.id)}>
                                    <Eye />
                                </Link>
                            </Button>
                        </div>
                    ),
                }),
            ]),
        [],
    );

    const table = useAppTable({
        data: orders,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Delivery orders" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Delivery orders"
                    description={`${orders.length.toLocaleString()} despatch(es) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search DO no., client, customer order…"
                    emptyMessage="No delivery orders found."
                />
            </div>
        </>
    );
}

DeliveryOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Delivery orders', href: index() }],
};
