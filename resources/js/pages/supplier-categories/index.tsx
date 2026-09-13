import { Head } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useMemo } from 'react';
import SupplierCategoryController from '@/actions/App/Http/Controllers/SupplierCategoryController';
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
import { index } from '@/routes/supplier-category';
import CategoryFormDialog from './category-form-dialog';
import type { Category } from './types';

type Props = {
    categories: Category[];
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<Category>();

export default function SupplierCategoriesIndex({ categories, can }: Props) {
    const groups = useMemo(
        () =>
            [
                ...new Set(
                    categories
                        .map((category) => category.category)
                        .filter((group): group is string => Boolean(group)),
                ),
            ].sort(),
        [categories],
    );

    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('category', {
                    header: 'Group',
                    cell: ({ getValue }) => (
                        <MatChip group={getValue()}>{getValue()}</MatChip>
                    ),
                }),
                helper.accessor('subcategory', {
                    header: 'Subcategory',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('supplier_count', {
                    header: 'Suppliers',
                    cell: ({ getValue }) =>
                        getValue() > 0 ? (
                            <span className="text-foreground font-semibold">
                                {getValue()}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">
                                Unused
                            </span>
                        ),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <CategoryFormDialog
                                    category={row.original}
                                    groups={groups}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${row.original.subcategory}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            )}

                            {can.delete && (
                                <ConfirmDelete
                                    url={SupplierCategoryController.destroy.url(
                                        row.original.id,
                                    )}
                                    label={
                                        row.original.subcategory ?? 'category'
                                    }
                                    description="Categories already assigned to suppliers cannot be deleted."
                                />
                            )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [groups, can.edit, can.delete],
    );

    const table = useAppTable({
        data: categories,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="Supplier categories" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Supplier categories"
                    description={`${categories.length} subcategor${categories.length === 1 ? 'y' : 'ies'} across ${groups.length} group(s)`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search categories…"
                    emptyMessage="No categories found."
                    toolbar={
                        can.create && (
                            <CategoryFormDialog
                                groups={groups}
                                trigger={
                                    <Button>
                                        <Plus /> Add category
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

SupplierCategoriesIndex.layout = {
    breadcrumbs: [{ title: 'Supplier categories', href: index() }],
};
