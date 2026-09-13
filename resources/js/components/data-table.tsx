import type { ReactTable, RowData } from '@tanstack/react-table';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Settings2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { DataTableFeatures } from '@/lib/data-table';

type Props<TData extends RowData> = {
    table: ReactTable<DataTableFeatures, TData>;
    /** Placeholder for the global search box. */
    searchPlaceholder?: string;
    /** Extra controls rendered beside the search box, e.g. a create button. */
    toolbar?: ReactNode;
    emptyMessage?: string;
    /**
     * Row count to display. Pass it when the server owns filtering and
     * pagination, where the table only ever holds the current page.
     */
    totalRows?: number;
};

const PAGE_SIZES = [10, 25, 50, 100];

export function DataTable<TData extends RowData>({
    table,
    searchPlaceholder = 'Search…',
    toolbar,
    emptyMessage = 'No results.',
    totalRows,
}: Props<TData>) {
    const { globalFilter, pagination } = table.state;
    const rows = table.getRowModel().rows;
    const count = totalRows ?? table.getFilteredRowModel().rows.length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    value={String(globalFilter ?? '')}
                    onChange={(event) =>
                        table.setGlobalFilter(event.target.value)
                    }
                    placeholder={searchPlaceholder}
                    className="max-w-sm"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Settings2 /> Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                            .getAllLeafColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.id.replaceAll('_', ' ')}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="ml-auto flex items-center gap-2">{toolbar}</div>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => {
                                    const sorted = header.column.getCanSort()
                                        ? header.column.getIsSorted()
                                        : false;

                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <button
                                                    type="button"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="hover:text-foreground -ml-2 inline-flex items-center gap-1 rounded px-2 py-1"
                                                >
                                                    <table.FlexRender
                                                        header={header}
                                                    />
                                                    {sorted === 'asc' ? (
                                                        <ArrowUp className="size-3.5" />
                                                    ) : sorted === 'desc' ? (
                                                        <ArrowDown className="size-3.5" />
                                                    ) : (
                                                        <ArrowUpDown className="size-3.5 opacity-40" />
                                                    )}
                                                </button>
                                            ) : (
                                                <table.FlexRender
                                                    header={header}
                                                />
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllLeafColumns().length}
                                    className="text-muted-foreground py-8 text-center"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}

                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        <table.FlexRender cell={cell} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-muted-foreground text-sm">
                    {count} row{count === 1 ? '' : 's'}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                            Rows per page
                        </span>
                        <Select
                            value={String(pagination.pageSize)}
                            onValueChange={(value) =>
                                table.setPageSize(Number(value))
                            }
                        >
                            <SelectTrigger className="w-20" size="sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZES.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-muted-foreground text-sm">
                        Page {pagination.pageIndex + 1} of{' '}
                        {Math.max(table.getPageCount(), 1)}
                    </div>

                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Previous page"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Next page"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
