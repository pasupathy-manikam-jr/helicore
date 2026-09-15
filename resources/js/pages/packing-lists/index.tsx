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
import { create, index, show } from '@/routes/packing-list';
import { Eye, Plus } from 'lucide-react';
import type { PackingListRow } from './types';

type Props = {
    lists: PackingListRow[];
    can: { edit: boolean; create: boolean };
};

const helper = createAppColumnHelper<PackingListRow>();

export default function PackingListsIndex({ lists, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'PL no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Packed',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('altcustomername', { header: 'Customer' }),
                helper.accessor('ref', { header: 'Reference' }),
                helper.accessor((row) => row.sales_orders.join(', '), {
                    id: 'sales_orders',
                    header: 'Sales orders',
                }),
                helper.accessor('line_count', {
                    header: 'Items',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View packing list ${row.original.id}`}
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
        data: lists,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Packing lists" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Packing lists"
                    description={`${lists.length.toLocaleString()} packing list(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search PL no., customer, reference…"
                    emptyMessage="No packing lists found."
                    toolbar={
                        can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus /> New packing list
                                </Link>
                            </Button>
                        )
                    }
                />
            </div>
        </>
    );
}

PackingListsIndex.layout = {
    breadcrumbs: [{ title: 'Packing lists', href: index() }],
};
