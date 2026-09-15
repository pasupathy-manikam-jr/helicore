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
import { formatDate, money } from '@/lib/format';
import { index, show } from '@/routes/invoice';
import { Eye } from 'lucide-react';
import type { InvoiceRow } from './types';

type Props = {
    invoices: InvoiceRow[];
    can: { edit: boolean };
};

const helper = createAppColumnHelper<InvoiceRow>();

export default function InvoicesIndex({ invoices }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'Invoice no.',
                    cell: ({ row }) => (
                        <>
                            <span className="font-medium">
                                {row.original.id}
                            </span>
                            <div className="text-muted-foreground text-xs">
                                Acct {row.original.acct_invoiceno}
                            </div>
                        </>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Raised',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('client', { header: 'Client' }),
                helper.accessor('fsdno', { header: 'Sales order' }),
                helper.accessor('indexno', { header: 'Delivery order' }),
                helper.accessor('subtotal', {
                    header: 'Subtotal',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">
                            {getValue() === null
                                ? '—'
                                : money.format(Number(getValue()))}
                        </span>
                    ),
                }),
                helper.accessor('paymentterms', { header: 'Payment terms' }),
                helper.accessor('sst', {
                    header: 'SST',
                    cell: ({ getValue }) => (getValue() ? 'Applicable' : 'N/A'),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View invoice ${row.original.id}`}
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
        data: invoices,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Invoices" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Invoices"
                    description={`${invoices.length.toLocaleString()} invoice(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search invoice no., client, sales order…"
                    emptyMessage="No invoices found."
                />
            </div>
        </>
    );
}

InvoicesIndex.layout = {
    breadcrumbs: [{ title: 'Invoices', href: index() }],
};
