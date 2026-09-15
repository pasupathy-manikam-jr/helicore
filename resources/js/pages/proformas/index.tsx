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
import { create, index, show } from '@/routes/proforma';
import { Eye, Plus } from 'lucide-react';
import type { ProformaRow } from './types';

type Props = {
    proformas: ProformaRow[];
    can: { edit: boolean; create: boolean };
};

const helper = createAppColumnHelper<ProformaRow>();

export default function ProformasIndex({ proformas, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'Proforma no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Raised',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('client', { header: 'Client' }),
                helper.accessor('fsdno', { header: 'Sales order' }),
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
                helper.accessor('paymentdue', { header: 'Payment due' }),
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
                                aria-label={`View proforma ${row.original.id}`}
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
        data: proformas,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Proformas" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Proformas"
                    description={`${proformas.length.toLocaleString()} proforma(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search proforma no., client, sales order…"
                    emptyMessage="No proformas found."
                    toolbar={
                        can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus /> New proforma
                                </Link>
                            </Button>
                        )
                    }
                />
            </div>
        </>
    );
}

ProformasIndex.layout = {
    breadcrumbs: [{ title: 'Proformas', href: index() }],
};
