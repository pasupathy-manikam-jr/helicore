import { Head, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { index } from '@/routes/stock-code';
import { Pencil } from 'lucide-react';
import StockItemFormDialog from './stock-item-form-dialog';
import type { ProductOption, StockItem } from './types';

type Props = {
    product: string;
    products: ProductOption[];
    items: StockItem[];
    can: { edit: boolean };
};

const helper = createAppColumnHelper<StockItem>();

export default function StockCodesIndex({
    product,
    products,
    items,
    can,
}: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('stock_code', {
                    header: 'Stock code',
                    cell: ({ row }) => (
                        <>
                            <span className="font-medium">
                                {row.original.stock_code}
                            </span>
                            <div className="text-muted-foreground text-xs">
                                {row.original.main_code}
                            </div>
                        </>
                    ),
                }),
                helper.accessor(
                    (row) => [row.size, row.rating].filter(Boolean).join(' · '),
                    { id: 'size', header: 'Size / rating' },
                ),
                helper.accessor('description', {
                    header: 'Description',
                    cell: ({ getValue }) => (
                        <span className="line-clamp-2 max-w-prose">
                            {getValue()}
                        </span>
                    ),
                }),
                helper.accessor('weight', {
                    header: 'Weight',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.accessor('price', {
                    header: 'Price',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.accessor('stock_take', {
                    header: 'In',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.accessor('stock_out', {
                    header: 'Out',
                    cell: ({ getValue }) => (
                        <span className="tabular-nums">{getValue()}</span>
                    ),
                }),
                helper.accessor('balance', {
                    header: 'Balance',
                    cell: ({ getValue }) => {
                        const balance = getValue() ?? 0;

                        return (
                            <span
                                className={`tabular-nums ${balance > 0 ? 'font-semibold' : 'text-muted-foreground'}`}
                            >
                                {balance}
                            </span>
                        );
                    },
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) =>
                        can.edit && (
                            <div className="flex justify-end">
                                <StockItemFormDialog
                                    product={product}
                                    item={row.original}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${row.original.stock_code}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            </div>
                        ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [product, can.edit],
    );

    const table = useAppTable({
        data: items,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    const label = products.find((option) => option.value === product)?.label;

    return (
        <>
            <Head title="Stock codes" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Stock codes"
                    description={`${items.length} ${label?.toLowerCase()} stock code(s)`}
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search stock codes…"
                    emptyMessage="No stock codes found."
                    toolbar={
                        <Select
                            value={product}
                            onValueChange={(value) =>
                                router.get(
                                    index({ query: { product: value } }),
                                    {},
                                    { preserveState: false },
                                )
                            }
                        >
                            <SelectTrigger
                                className="w-56"
                                aria-label="Product line"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                />
            </div>
        </>
    );
}

StockCodesIndex.layout = {
    breadcrumbs: [{ title: 'Stock codes', href: index() }],
};
