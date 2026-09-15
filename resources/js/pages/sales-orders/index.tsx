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
import { confirmation, create, edit, index, show } from '@/routes/sales-order';
import { Eye, FileText, Pencil, Plus } from 'lucide-react';
import type { SalesOrderRow } from './types';

type Props = {
    orders: SalesOrderRow[];
    can: { edit: boolean; create: boolean };
};

const helper = createAppColumnHelper<SalesOrderRow>();

/**
 * The three free text columns share one width and wrap, so a long client name
 * cannot widen the whole row.
 */
const wrappingCell = 'block w-56 whitespace-normal';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

function formatDate(value: string | null) {
    if (!value) {
        return null;
    }

    const parsed = new Date(value.replace(' ', 'T'));

    return Number.isNaN(parsed.getTime()) ? value : dateFormat.format(parsed);
}

export default function SalesOrdersIndex({ orders, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'SO no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Raised',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('client', {
                    header: 'Client',
                    cell: ({ getValue }) => (
                        <span className={wrappingCell}>{getValue()}</span>
                    ),
                }),
                helper.accessor('contact_person', {
                    header: 'Contact',
                    cell: ({ getValue }) => (
                        <span className={wrappingCell}>{getValue()}</span>
                    ),
                }),
                helper.accessor('customer_order', {
                    header: 'Customer order',
                    cell: ({ getValue }) => (
                        <span className={wrappingCell}>{getValue()}</span>
                    ),
                }),
                helper.accessor('salesperson', { header: 'Salesperson' }),
                helper.accessor('workorder', { header: 'Work order' }),
                helper.accessor('invoice', { header: 'Invoice' }),
                helper.accessor('closing_date', {
                    header: 'Closed',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('sst', {
                    header: 'SST',
                    cell: ({ getValue }) => (getValue() ? 'Applicable' : 'N/A'),
                }),
                // Legacy keeps these as three separate columns.
                helper.display({
                    id: 'oc',
                    header: 'OC',
                    cell: ({ row }) => (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Order confirmation for ${row.original.id}`}
                            asChild
                        >
                            <Link href={confirmation(row.original.id)}>
                                <FileText />
                            </Link>
                        </Button>
                    ),
                }),
                helper.display({
                    id: 'view',
                    header: 'View',
                    cell: ({ row }) => (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`View sales order ${row.original.id}`}
                            asChild
                        >
                            <Link href={show(row.original.id)}>
                                <Eye />
                            </Link>
                        </Button>
                    ),
                }),
                helper.display({
                    id: 'edit',
                    header: 'Edit',
                    cell: ({ row }) =>
                        can.edit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit sales order ${row.original.id}`}
                                asChild
                            >
                                <Link href={edit(row.original.id)}>
                                    <Pencil />
                                </Link>
                            </Button>
                        ),
                }),
            ]),
        [can.edit],
    );

    const table = useAppTable({
        data: orders,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) =>
            !['oc', 'view', 'edit'].includes(column.id),
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Sales orders" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Sales orders"
                    description={`${orders.length.toLocaleString()} sales order(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search SO no., client, customer order…"
                    emptyMessage="No sales orders found."
                    toolbar={
                        can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus /> New sales order
                                </Link>
                            </Button>
                        )
                    }
                />
            </div>
        </>
    );
}

SalesOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Sales orders', href: index() }],
};
