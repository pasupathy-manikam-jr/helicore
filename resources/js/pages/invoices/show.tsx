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
import { show as deliveryOrderShow } from '@/routes/delivery-order';
import { index, show } from '@/routes/invoice';
import { show as salesOrderShow } from '@/routes/sales-order';
import { ArrowLeft } from 'lucide-react';
import type { Invoice, InvoiceLine, InvoiceTotals } from './types';

type Props = {
    invoice: Invoice;
    lines: InvoiceLine[];
    totals: InvoiceTotals;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

function TotalRow({
    label,
    value,
    strong,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex justify-between gap-8 py-1 ${strong ? 'border-t pt-2 font-semibold' : ''}`}
        >
            <span className={strong ? '' : 'text-muted-foreground'}>
                {label}
            </span>
            <span className="tabular-nums">{value}</span>
        </div>
    );
}

export default function InvoiceShow({ invoice, lines, totals }: Props) {
    const charged = Boolean(invoice.sst);

    return (
        <>
            <Head title={`Invoice ${invoice.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Invoice ${invoice.id}`}
                        description={invoice.client ?? 'No client on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="Client" value={invoice.client} />
                    <Field
                        label="Accounts no."
                        value={invoice.acct_invoiceno}
                    />
                    <Field
                        label="Sales order"
                        value={
                            invoice.fsdno ? (
                                <Link
                                    href={salesOrderShow(invoice.fsdno)}
                                    className="hover:underline"
                                >
                                    {invoice.fsdno}
                                </Link>
                            ) : null
                        }
                    />
                    <Field
                        label="Delivery order"
                        value={
                            invoice.indexno ? (
                                <Link
                                    href={deliveryOrderShow(
                                        Number(invoice.indexno),
                                    )}
                                    className="hover:underline"
                                >
                                    {invoice.indexno}
                                </Link>
                            ) : null
                        }
                    />
                    <Field
                        label="Customer order"
                        value={invoice.customer_order}
                    />
                    <Field label="Payment terms" value={invoice.paymentterms} />
                    <Field label="Currency" value={invoice.currency} />
                    <Field label="SST" value={charged ? 'Applicable' : 'N/A'} />
                    <Field
                        label="Raised"
                        value={formatDate(invoice.created_at)}
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
                                    Billed qty
                                </TableHead>
                                <TableHead className="text-right">
                                    Unit price
                                </TableHead>
                                {charged && (
                                    <TableHead className="text-right">
                                        SST
                                    </TableHead>
                                )}
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={charged ? 7 : 6}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        The despatch this invoice bills has no
                                        lines on record.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.item}</TableCell>
                                    <TableCell className="font-medium">
                                        {line.stockcode}
                                        <div className="text-muted-foreground text-xs">
                                            {line.product}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                        {line.description}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {line.actual_qty}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(
                                            Number(line.unit_price ?? 0),
                                        )}
                                    </TableCell>
                                    {charged && (
                                        <TableCell className="text-right tabular-nums">
                                            {money.format(
                                                Number(line.sst ?? 0),
                                            )}
                                        </TableCell>
                                    )}
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
                        <TotalRow
                            label="Quantity billed"
                            value={String(totals.quantity)}
                        />
                        <TotalRow
                            label="Subtotal"
                            value={money.format(totals.subtotal)}
                        />
                        <TotalRow
                            label="Transportation"
                            value={money.format(totals.transportation)}
                        />
                        <TotalRow
                            label="Customs"
                            value={money.format(totals.customs)}
                        />
                        <TotalRow
                            label="Packing"
                            value={money.format(totals.packing)}
                        />
                        <TotalRow
                            label={invoice.misc_title || 'Miscellaneous'}
                            value={money.format(totals.misc)}
                        />
                        {totals.tax > 0 && (
                            <TotalRow
                                label="Tax & duties"
                                value={money.format(totals.tax)}
                            />
                        )}
                        <TotalRow
                            label="Discount"
                            value={`- ${money.format(totals.discount)}`}
                        />
                        <TotalRow
                            label={`Grand total${invoice.currency ? ` (${invoice.currency})` : ''}`}
                            value={money.format(totals.grand_total)}
                            strong
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

InvoiceShow.layout = ({ invoice }: Props) => ({
    breadcrumbs: [
        { title: 'Invoices', href: index() },
        { title: String(invoice.id), href: show(invoice.id) },
    ],
});
