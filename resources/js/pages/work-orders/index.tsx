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
import { index, show } from '@/routes/work-order';
import { Eye } from 'lucide-react';
import type { WorkOrderRow } from './types';

type Props = {
    orders: WorkOrderRow[];
    can: { edit: boolean };
};

const helper = createAppColumnHelper<WorkOrderRow>();

export default function WorkOrdersIndex({ orders }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'WO no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Raised',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('client', { header: 'Client' }),
                helper.accessor('salesorder', { header: 'Sales order' }),
                helper.accessor('contact_person', { header: 'Contact' }),
                helper.accessor('processor', { header: 'Processed by' }),
                helper.accessor('goods_ready_date', {
                    header: 'Goods ready',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('closing_date', {
                    header: 'Closed',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('location', { header: 'Location' }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View work order ${row.original.id}`}
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
            <Head title="Work orders" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Work orders"
                    description={`${orders.length.toLocaleString()} work order(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search WO no., client, sales order…"
                    emptyMessage="No work orders found."
                />
            </div>
        </>
    );
}

WorkOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Work orders', href: index() }],
};
