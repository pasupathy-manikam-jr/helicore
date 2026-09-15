import { Head, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
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
import { stockSold } from '@/routes/report';
import DespatchDialog from './despatch-dialog';
import type { ProductOption, StockSoldRow } from './types';

type Props = {
    product: string;
    products: ProductOption[];
    year: number | null;
    years: number[];
    /** Column name in the legacy table => label, in calendar order. */
    months: Record<string, string>;
    rows: StockSoldRow[];
};

const helper = createAppColumnHelper<StockSoldRow>();

export default function StockSoldReport({
    product,
    products,
    year,
    years,
    months,
    rows,
}: Props) {
    const reload = (params: { product?: string; year?: number }) =>
        router.get(
            stockSold({
                query: { product, year: year ?? undefined, ...params },
            }),
            {},
            { preserveState: false },
        );

    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('stockcode', {
                    header: 'Stock code',
                    cell: ({ row }) => (
                        <DespatchDialog
                            stockcode={row.original.stockcode}
                            despatches={row.original.despatches}
                        />
                    ),
                }),
                ...Object.entries(months).map(([column, label]) =>
                    helper.accessor((row) => Number(row[column] ?? 0), {
                        id: column,
                        header: label,
                        cell: ({ getValue }) => (
                            <span
                                className={
                                    getValue()
                                        ? 'tabular-nums'
                                        : 'text-muted-foreground tabular-nums'
                                }
                            >
                                {getValue()}
                            </span>
                        ),
                    }),
                ),
                helper.accessor('total', {
                    header: 'Total',
                    cell: ({ getValue }) => (
                        <span className="font-semibold tabular-nums">
                            {getValue()}
                        </span>
                    ),
                }),
            ]),
        [months],
    );

    const table = useAppTable({
        data: rows,
        columns,
        initialState: dataTableInitialState,
        globalFilterFn: 'includesString',
    });

    const soldThisYear = rows.reduce((total, row) => total + row.total, 0);

    return (
        <>
            <Head title="Stock sold" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Stock sold"
                    description={
                        year
                            ? `${rows.length} stock code(s), ${soldThisYear.toLocaleString()} sold in ${year}`
                            : 'No figures recorded for this product line'
                    }
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search stock codes…"
                    emptyMessage="No figures for this product and year."
                    toolbar={
                        <>
                            <Select
                                value={product}
                                onValueChange={(value) =>
                                    reload({ product: value, year: undefined })
                                }
                            >
                                <SelectTrigger
                                    className="w-48"
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

                            {years.length > 0 && (
                                <Select
                                    value={String(year ?? '')}
                                    onValueChange={(value) =>
                                        reload({ year: Number(value) })
                                    }
                                >
                                    <SelectTrigger
                                        className="w-28"
                                        aria-label="Year"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={String(option)}
                                            >
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </>
                    }
                />
            </div>
        </>
    );
}

StockSoldReport.layout = {
    breadcrumbs: [{ title: 'Stock sold', href: stockSold() }],
};
