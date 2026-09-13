import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    createTableHook,
    filterFn_includesString,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_text,
    tableFeatures,
} from '@tanstack/react-table';

/**
 * Shared table infrastructure: sorting, a global search box, client-side
 * pagination and column visibility. Register features once here so every
 * listing behaves the same way.
 *
 * ponytail: client-side processing, so the whole result set is sent to the
 * browser. Fine for the hundreds of rows the ported modules hold; switch the
 * relevant table to manualPagination/manualFiltering when a module (quotations
 * has ~16k rows) outgrows it.
 */
export const dataTableFeatures = tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: { includesString: filterFn_includesString },
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
    columnVisibilityFeature,
});

export const { createAppColumnHelper, useAppTable } = createTableHook({
    features: dataTableFeatures,
});

export const dataTableInitialState = {
    pagination: { pageIndex: 0, pageSize: 25 },
};

export type DataTableFeatures = typeof dataTableFeatures;
