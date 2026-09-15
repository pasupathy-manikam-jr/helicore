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
import { index, show } from '@/routes/receiving-note';
import { Eye } from 'lucide-react';
import type { ReceivingNoteRow } from './types';

type Props = {
    notes: ReceivingNoteRow[];
    can: { edit: boolean };
};

const helper = createAppColumnHelper<ReceivingNoteRow>();

export default function ReceivingNotesIndex({ notes }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'RN no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('deliverydate', {
                    header: 'Delivered',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('supplier', { header: 'Supplier' }),
                helper.accessor('afe_id', { header: 'AFE' }),
                helper.accessor('supplierinvoice', {
                    header: 'Supplier invoice',
                }),
                helper.accessor('awb', { header: 'AWB' }),
                helper.accessor('osc', { header: 'OSC' }),
                helper.accessor('user', { header: 'Received by' }),
                helper.accessor('preparedate', {
                    header: 'Prepared',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('lines_count', {
                    header: 'Items',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`View receiving note ${row.original.id}`}
                            asChild
                        >
                            <Link href={show(row.original.id)}>
                                <Eye />
                            </Link>
                        </Button>
                    ),
                }),
            ]),
        [],
    );

    const table = useAppTable({
        data: notes,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Receiving notes" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Receiving notes"
                    description={`${notes.length.toLocaleString()} receiving note(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search RN no., supplier, invoice…"
                    emptyMessage="No receiving notes found."
                />
            </div>
        </>
    );
}

ReceivingNotesIndex.layout = {
    breadcrumbs: [{ title: 'Receiving notes', href: index() }],
};
