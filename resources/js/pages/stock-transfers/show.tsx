import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate, money } from '@/lib/format';
import { show as salesOrderShow } from '@/routes/sales-order';
import { index, show } from '@/routes/stock-transfer';
import { ArrowLeft } from 'lucide-react';
import type {
    StockTransfer,
    StockTransferLine,
    StockTransferTotals,
} from './types';

type Props = {
    transfer: StockTransfer;
    lines: StockTransferLine[];
    totals: StockTransferTotals;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function StockTransferShow({ transfer, lines, totals }: Props) {
    return (
        <>
            <Head title={`Stock transfer ${transfer.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Stock order transfer ${transfer.id}`}
                        description={transfer.client ?? 'No client on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="Client" value={transfer.client} />
                    <Field
                        label="Sales order"
                        value={
                            transfer.salesorder ? (
                                <Link
                                    href={salesOrderShow(transfer.salesorder)}
                                    className="hover:underline"
                                >
                                    {transfer.salesorder}
                                </Link>
                            ) : null
                        }
                    />
                    <Field
                        label="Customer order"
                        value={transfer.customer_order}
                    />
                    <Field label="Contact" value={transfer.contact_person} />
                    <Field label="Currency" value={transfer.currency} />
                    <Field label="AFE" value={transfer.afe} />
                    <Field
                        label="Goods ready"
                        value={formatDate(transfer.goods_ready_date)}
                    />
                    <Field
                        label="Despatched"
                        value={formatDate(transfer.despatch_date)}
                    />
                    <Field
                        label="Closed"
                        value={formatDate(transfer.closing_date)}
                    />
                    <Field label="Location" value={transfer.location} />
                    <Field
                        label="Mode of shipment"
                        value={transfer.mode_of_shipment}
                    />
                    <Field
                        label="Raised"
                        value={formatDate(transfer.created_at)}
                    />
                </dl>

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Stock code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                    Qty
                                </TableHead>
                                <TableHead className="text-right">
                                    Weight
                                </TableHead>
                                <TableHead className="text-right">
                                    Unit price
                                </TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No line items on this transfer.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.item}</TableCell>
                                    <TableCell className="font-medium">
                                        {line.stock_code}
                                        <div className="text-muted-foreground text-xs">
                                            {line.product}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                        {line.description}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {line.quantity} {line.unit}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(
                                            (line.quantity ?? 0) *
                                                (line.weight ?? 0),
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(line.unit_price ?? 0)}
                                    </TableCell>
                                    <TableCell>{line.batch}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(line.line_total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end">
                    <div className="w-full max-w-sm rounded-xl border p-4 text-sm">
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Total quantity
                            </span>
                            <span className="tabular-nums">
                                {totals.quantity}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Total weight (kg)
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.weight)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 border-t py-1 pt-2 font-semibold">
                            <span>
                                Grand total
                                {transfer.currency
                                    ? ` (${transfer.currency})`
                                    : ''}
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.grand_total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

StockTransferShow.layout = ({ transfer }: Props) => ({
    breadcrumbs: [
        { title: 'Stock order transfers', href: index() },
        { title: String(transfer.id), href: show(transfer.id) },
    ],
});
