import { Head } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useMemo } from 'react';
import ConfirmDelete from '@/components/confirm-delete';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import type { ReferenceField, ReferenceMeta, ReferenceRow } from './types';
import ReferenceFormDialog from './reference-form-dialog';

type Props = {
    resource: ReferenceMeta;
    fields: ReferenceField[];
    rows: ReferenceRow[];
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<ReferenceRow>();

export default function ReferenceIndex({ resource, fields, rows, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                ...fields.map((field) =>
                    helper.accessor((row) => row[field.name], {
                        id: field.name,
                        header: field.label,
                        cell: ({ getValue }) => {
                            const value = getValue();

                            if (field.type === 'textarea') {
                                return (
                                    <span className="text-muted-foreground block max-w-[32rem] truncate text-xs">
                                        {String(value ?? '')}
                                    </span>
                                );
                            }

                            return (
                                <span
                                    className={
                                        field.type === 'number'
                                            ? 'tabular-nums'
                                            : 'font-medium'
                                    }
                                >
                                    {String(value ?? '')}
                                </span>
                            );
                        },
                    }),
                ),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <ReferenceFormDialog
                                    resource={resource}
                                    fields={fields}
                                    row={row.original}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Edit"
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            )}

                            {can.delete && (
                                <ConfirmDelete
                                    url={`${resource.basePath}/${row.original.id}`}
                                    label={String(
                                        row.original[fields[0].name] ??
                                            resource.singular,
                                    )}
                                />
                            )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fields, resource, can.edit, can.delete],
    );

    const table = useAppTable({
        data: rows,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title={resource.title} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title={resource.title}
                    description={resource.description}
                />

                <DataTable
                    table={table}
                    searchPlaceholder={`Search ${resource.title.toLowerCase()}…`}
                    emptyMessage={`No ${resource.title.toLowerCase()} yet.`}
                    toolbar={
                        can.create && (
                            <ReferenceFormDialog
                                resource={resource}
                                fields={fields}
                                trigger={
                                    <Button>
                                        <Plus /> Add{' '}
                                        {resource.singular.toLowerCase()}
                                    </Button>
                                }
                            />
                        )
                    }
                />
            </div>
        </>
    );
}
