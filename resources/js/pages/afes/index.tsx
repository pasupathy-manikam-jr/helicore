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
import { create, index, show } from '@/routes/afe';
import { create as receivingNoteCreate } from '@/routes/receiving-note';
import { Eye, PackagePlus, Plus } from 'lucide-react';
import type { AfeRow } from './types';

type Props = {
    afes: AfeRow[];
    can: {
        show: boolean;
        approve: boolean;
        create: boolean;
        receive: boolean;
    };
};

const helper = createAppColumnHelper<AfeRow>();

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

export default function AfesIndex({ afes, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'AFE no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('potype', { header: 'PO type' }),
                helper.accessor('supplier', { header: 'Supplier' }),
                helper.accessor('created_at', {
                    header: 'Raised',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('approved', {
                    header: 'Approval',
                    cell: ({ getValue }) => (
                        <span
                            className={
                                getValue()
                                    ? 'text-primary font-semibold'
                                    : 'text-muted-foreground'
                            }
                        >
                            {getValue() ? 'Approved' : 'Pending'}
                        </span>
                    ),
                }),
                helper.accessor('final_approval_date', {
                    header: 'Approved on',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('salesorder', { header: 'Sales order' }),
                helper.accessor('eta', { header: 'ETA' }),
                helper.accessor('actarrival', {
                    header: 'Arrived',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('delay', {
                    header: 'Delay',
                    cell: ({ getValue }) => {
                        const days = getValue();

                        if (days === null) {
                            return null;
                        }

                        return (
                            <span
                                className={
                                    days > 0 ? 'text-destructive' : undefined
                                }
                            >
                                {days} day{Math.abs(days) === 1 ? '' : 's'}
                            </span>
                        );
                    },
                }),
                helper.accessor('status', { header: 'Status' }),
                helper.accessor('reference', { header: 'Reference' }),
                // Legacy keeps these as two columns: view, then raise a
                // receiving note against the AFE.
                helper.display({
                    id: 'view',
                    header: 'View',
                    cell: ({ row }) =>
                        can.show && (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View AFE ${row.original.id}`}
                                asChild
                            >
                                <Link href={show(row.original.id)}>
                                    <Eye />
                                </Link>
                            </Button>
                        ),
                }),
                helper.display({
                    id: 'rn',
                    header: 'RN',
                    cell: ({ row }) =>
                        can.receive && (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Receive against AFE ${row.original.id}`}
                                asChild
                            >
                                <Link
                                    href={receivingNoteCreate(row.original.id)}
                                >
                                    <PackagePlus />
                                </Link>
                            </Button>
                        ),
                }),
            ]),
        [can.show, can.receive],
    );

    const table = useAppTable({
        data: afes,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) =>
            !['view', 'rn'].includes(column.id),
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="AFEs" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="AFEs"
                    description={`${afes.length.toLocaleString()} authority for expenditure record(s)`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search AFE no., supplier, reference…"
                    emptyMessage="No AFEs found."
                    toolbar={
                        can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus /> New AFE
                                </Link>
                            </Button>
                        )
                    }
                />
            </div>
        </>
    );
}

AfesIndex.layout = {
    breadcrumbs: [{ title: 'AFEs', href: index() }],
};
