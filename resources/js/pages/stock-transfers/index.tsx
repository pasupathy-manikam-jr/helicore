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
import { index, show } from '@/routes/stock-transfer';
import { Eye } from 'lucide-react';
import type { StockTransferRow } from './types';

type Props = {
    transfers: StockTransferRow[];
    can: { edit: boolean };
};

const helper = createAppColumnHelper<StockTransferRow>();

export default function StockTransfersIndex({ transfers }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'Transfer no.',
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
                helper.accessor('customer_order', { header: 'Customer order' }),
                helper.accessor('salesperson', { header: 'Salesperson' }),
                helper.accessor('despatch_date', {
                    header: 'Despatched',
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
                                aria-label={`View stock transfer ${row.original.id}`}
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
        data: transfers,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Stock order transfers" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Stock order transfers"
                    description={`${transfers.length.toLocaleString()} transfer(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search transfer no., client, sales order…"
                    emptyMessage="No stock order transfers found."
                />
            </div>
        </>
    );
}

StockTransfersIndex.layout = {
    breadcrumbs: [{ title: 'Stock order transfers', href: index() }],
};
