import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { createAppColumnHelper, useAppTable } from '@/lib/data-table';
import { create, index, show } from '@/routes/quotation';
import { Eye, Plus } from 'lucide-react';
import type { QuotationFilters, QuotationRow } from './types';

type Props = {
    quotations: QuotationRow[];
    total: number;
    filters: QuotationFilters;
    can: { show: boolean; create: boolean };
};

const helper = createAppColumnHelper<QuotationRow>();

const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

export default function QuotationsIndex({
    quotations,
    total,
    filters,
    can,
}: Props) {
    const [search, setSearch] = useState(filters.q);

    /** Every change of page, sort or search is a fresh server query. */
    const reload = (params: Partial<QuotationFilters>) =>
        router.get(
            index({ query: { ...filters, page: 1, ...params } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );

    useEffect(() => {
        if (search === filters.q) {
            return;
        }

        const timer = setTimeout(() => reload({ q: search }), 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('id', {
                    header: 'Quote no.',
                    cell: ({ row }) => (
                        <>
                            <span className="font-medium">
                                {row.original.id}
                            </span>
                            {(row.original.revno ?? 0) > 0 && (
                                <span className="text-muted-foreground">
                                    {' '}
                                    rev {row.original.revno}
                                </span>
                            )}
                        </>
                    ),
                }),
                helper.accessor('created_at', {
                    header: 'Date',
                    cell: ({ getValue }) => {
                        const value = getValue();

                        return value
                            ? dateFormat.format(new Date(value))
                            : null;
                    },
                }),
                helper.accessor('client', { header: 'Client' }),
                helper.accessor('your_ref', { header: 'Your ref.' }),
                helper.accessor('rfq', { header: 'RFQ' }),
                helper.accessor('attnto', { header: 'Attention' }),
                helper.accessor('issuer', { header: 'Issued by' }),
                helper.accessor('currency', { header: 'Currency' }),
                helper.accessor('sst', {
                    header: 'SST',
                    enableSorting: false,
                    cell: ({ getValue }) => (getValue() ? 'Applicable' : 'N/A'),
                }),
                helper.accessor('so_ref', { header: 'Sales order' }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) =>
                        can.show && (
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`View quotation ${row.original.id}`}
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
        [can.show],
    );

    const table = useAppTable({
        data: quotations,
        columns,
        // The database owns paging, sorting and searching here.
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: total,
        state: {
            pagination: {
                pageIndex: filters.page - 1,
                pageSize: filters.per_page,
            },
            sorting: [{ id: filters.sort, desc: filters.dir === 'desc' }],
            globalFilter: search,
        },
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater({
                          pageIndex: filters.page - 1,
                          pageSize: filters.per_page,
                      })
                    : updater;

            reload({
                page: next.pageIndex + 1,
                per_page: next.pageSize,
            });
        },
        onSortingChange: (updater) => {
            const current = [
                { id: filters.sort, desc: filters.dir === 'desc' },
            ];
            const next =
                typeof updater === 'function' ? updater(current) : updater;
            const [first] = next;

            reload({
                sort: first?.id ?? 'id',
                dir: first?.desc ? 'desc' : 'asc',
            });
        },
        onGlobalFilterChange: (updater) => {
            setSearch(
                typeof updater === 'function'
                    ? updater(search)
                    : String(updater ?? ''),
            );
        },
    });

    return (
        <>
            <Head title="Quotations" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Quotations"
                    description={`${total.toLocaleString()} quotation(s) on record`}
                />

                <DataTable
                    table={table}
                    totalRows={total}
                    searchPlaceholder="Search quote no., client, ref…"
                    emptyMessage="No quotations found."
                    toolbar={
                        can.create && (
                            <Button asChild>
                                <Link href={create()}>
                                    <Plus /> New quotation
                                </Link>
                            </Button>
                        )
                    }
                />
            </div>
        </>
    );
}

QuotationsIndex.layout = {
    breadcrumbs: [{ title: 'Quotations', href: index() }],
};
