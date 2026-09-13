import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import ConfirmDelete from '@/components/confirm-delete';
import { MatChip } from '@/components/mat-chip';
import { Button } from '@/components/ui/button';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { index } from '@/routes/supplier';
import { Pencil, Plus } from 'lucide-react';
import SupplierFormDialog from './supplier-form-dialog';
import type { Manager, Supplier, SupplierCategory } from './types';

type Props = {
    suppliers: Supplier[];
    categories: SupplierCategory[];
    managers: Manager[];
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<Supplier>();

export default function SuppliersIndex({
    suppliers,
    categories,
    managers,
    can,
}: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('supplier_name', {
                    header: 'Name',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('approval', {
                    header: 'Approved',
                    cell: ({ getValue }) => {
                        const approved =
                            String(getValue() ?? '').toUpperCase() === 'YES';

                        return (
                            <span
                                className={
                                    approved
                                        ? 'text-primary font-semibold'
                                        : 'text-destructive font-semibold'
                                }
                            >
                                {approved ? 'Yes' : 'No'}
                            </span>
                        );
                    },
                }),
                helper.accessor(
                    (row) =>
                        row.subcategories
                            .map((subcategory) => subcategory.label)
                            .join(', '),
                    {
                        id: 'categories',
                        header: 'Categories',
                        cell: ({ row }) => (
                            <div className="flex flex-wrap gap-1">
                                {row.original.subcategories.map(
                                    (subcategory) => (
                                        <MatChip
                                            key={subcategory.label}
                                            group={subcategory.group}
                                        >
                                            {subcategory.label}
                                        </MatChip>
                                    ),
                                )}
                            </div>
                        ),
                    },
                ),
                helper.accessor('regno', { header: 'Reg. no.' }),
                helper.accessor('contactperson', {
                    header: 'Contact',
                    cell: ({ row }) => (
                        <>
                            {row.original.contactperson}
                            <div className="text-muted-foreground text-xs">
                                {row.original.contact}
                            </div>
                        </>
                    ),
                }),
                helper.accessor('approver_name', { header: 'Approver' }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <SupplierFormDialog
                                    categories={categories}
                                    managers={managers}
                                    supplier={row.original}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${row.original.supplier_name}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            )}

                            {can.delete && (
                                <ConfirmDelete
                                    url={SupplierController.destroy.url(
                                        row.original.id,
                                    )}
                                    label={row.original.supplier_name}
                                />
                            )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [categories, managers, can.edit, can.delete],
    );

    const table = useAppTable({
        data: suppliers,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Suppliers" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Suppliers"
                    description={`${suppliers.length} supplier(s) on record`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search suppliers…"
                    emptyMessage="No suppliers found."
                    toolbar={
                        can.create && (
                            <SupplierFormDialog
                                categories={categories}
                                managers={managers}
                                trigger={
                                    <Button>
                                        <Plus /> Add supplier
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

SuppliersIndex.layout = {
    breadcrumbs: [{ title: 'Suppliers', href: index() }],
};
