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
import { create, index, show } from '@/routes/coc';
import { Eye, Plus } from 'lucide-react';
import type { CocRow } from './types';

type Props = {
    cocs: CocRow[];
    can: { edit: boolean; create: boolean };
};

const helper = createAppColumnHelper<CocRow>();

export default function CocsIndex({ cocs, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'COC no.',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Issued',
                    cell: ({ getValue }) => formatDate(getValue()),
                }),
                helper.accessor('client', { header: 'Client' }),
                helper.accessor('fsdorder', { header: 'Sales order' }),
                helper.accessor('quality_auth', {
                    header: 'Quality authority',
                }),
                helper.accessor('line_count', {
                    header: 'Items certified',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.accessor('remarks', { header: 'Remarks' }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View COC ${row.original.id}`}
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
        data: cocs,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Certificates of conformity" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Certificates of conformity"
                    description={`${cocs.length.toLocaleString()} certificate(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search COC no., client, sales order…"
                    emptyMessage="No certificates found."
                    toolbar={
                        can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus /> New COC
                                </Link>
                            </Button>
                        )
                    }
                />
            </div>
        </>
    );
}

CocsIndex.layout = {
    breadcrumbs: [{ title: 'COC', href: index() }],
};
