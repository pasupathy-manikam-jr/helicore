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
import { index, show } from '@/routes/proforma';
import { show as salesOrderShow } from '@/routes/sales-order';
import { ArrowLeft } from 'lucide-react';
import type { Proforma, ProformaLine, ProformaTotals } from './types';

type Props = {
    proforma: Proforma;
    lines: ProformaLine[];
    totals: ProformaTotals;
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

export default function ProformaShow({ proforma, lines, totals }: Props) {
    const charged = Boolean(proforma.sst);

    return (
        <>
            <Head title={`Proforma ${proforma.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Proforma ${proforma.id}`}
                        description={proforma.client ?? 'No client on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="Client" value={proforma.client} />
                    <Field
                        label="Sales order"
                        value={
                            proforma.fsdno ? (
                                <Link
                                    href={salesOrderShow(proforma.fsdno)}
                                    className="hover:underline"
                                >
                                    {proforma.fsdno}
                                </Link>
                            ) : null
                        }
                    />
                    <Field
                        label="Customer order"
                        value={proforma.customer_order}
                    />
                    <Field label="Payment due" value={proforma.paymentdue} />
                    <Field label="Currency" value={proforma.currency} />
                    <Field label="SST" value={charged ? 'Applicable' : 'N/A'} />
                    <Field
                        label="Raised"
                        value={formatDate(proforma.created_at)}
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
                                        The sales order this proforma quotes has
                                        no lines on record.
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
                            label="Total quantity"
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
                            label={proforma.misc_title || 'Miscellaneous'}
                            value={money.format(totals.misc)}
                        />
                        <TotalRow
                            label="Discount"
                            value={`- ${money.format(totals.discount)}`}
                        />
                        <TotalRow
                            label={`Grand total${proforma.currency ? ` (${proforma.currency})` : ''}`}
                            value={money.format(totals.grand_total)}
                            strong
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

ProformaShow.layout = ({ proforma }: Props) => ({
    breadcrumbs: [
        { title: 'Proformas', href: index() },
        { title: String(proforma.id), href: show(proforma.id) },
    ],
});
