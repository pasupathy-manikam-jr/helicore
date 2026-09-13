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
import { attachment, edit, index, show } from '@/routes/quotation';
import { ArrowLeft, Paperclip, Pencil, Plus } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import QuotationLineController from '@/actions/App/Http/Controllers/QuotationLineController';
import LineFormDialog from './line-form-dialog';
import type { Quotation, QuotationLine, QuotationTotals } from './types';

type Props = {
    quotation: Quotation;
    lines: QuotationLine[];
    totals: QuotationTotals;
    can: { edit: boolean; addLine: boolean; deleteLine: boolean };
};

const money = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

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

export default function QuotationShow({
    quotation,
    lines,
    totals,
    can,
}: Props) {
    const charged = Boolean(quotation.sst);

    return (
        <>
            <Head title={`Quotation ${quotation.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Quotation ${quotation.id}${(quotation.revno ?? 0) > 0 ? ` rev ${quotation.revno}` : ''}`}
                        description={quotation.client?.cname ?? 'No client'}
                    />

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={index()}>
                                <ArrowLeft /> Back to list
                            </Link>
                        </Button>

                        {can.edit && (
                            <Button asChild>
                                <Link href={edit(quotation.id)}>
                                    <Pencil /> Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                        <Field label="Client" value={quotation.client?.cname} />
                        <Field label="Attention" value={quotation.attnto} />
                        <Field
                            label="Client email"
                            value={quotation.clientemail}
                        />
                        <Field label="Your ref." value={quotation.your_ref} />
                        <Field label="RFQ" value={quotation.rfq} />
                        <Field
                            label="Buyer"
                            value={quotation.client_buyer_name}
                        />
                        <Field
                            label="Address"
                            value={[
                                quotation.client?.address,
                                quotation.client?.city,
                                quotation.client?.state,
                                quotation.client?.country,
                            ]
                                .filter(Boolean)
                                .join(', ')}
                        />
                    </dl>

                    <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                        <Field label="Issued by" value={quotation.issuer} />
                        <Field
                            label="Salesperson"
                            value={quotation.salesperson}
                        />
                        <Field label="Currency" value={quotation.currency} />
                        <Field
                            label="SST"
                            value={charged ? 'Applicable' : 'N/A'}
                        />
                        <Field
                            label="Quote basis"
                            value={quotation.quote_basis}
                        />
                        <Field label="Delivery" value={quotation.delivery} />
                        <Field
                            label="Bid validity"
                            value={quotation.bid_valid}
                        />
                        <Field
                            label="Payment terms"
                            value={quotation.pay_terms}
                        />
                        <Field label="Terms" value={quotation.terms} />
                        <Field
                            label="Tender closes"
                            value={quotation.tender_close_date}
                        />
                        <Field label="Sales order" value={quotation.so_ref} />
                    </dl>
                </div>

                {quotation.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 rounded-xl border p-4">
                        {quotation.attachments.map((path, position) => (
                            <Button
                                key={path}
                                variant="outline"
                                size="sm"
                                asChild
                            >
                                <a
                                    href={attachment.url([
                                        quotation.id,
                                        position,
                                    ])}
                                >
                                    <Paperclip />
                                    {path.split('/').pop()}
                                </a>
                            </Button>
                        ))}
                    </div>
                )}

                {can.addLine && (
                    <div className="flex justify-end">
                        <LineFormDialog
                            quotationId={quotation.id}
                            trigger={
                                <Button>
                                    <Plus /> Add line item
                                </Button>
                            }
                        />
                    </div>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Stock code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="text-right">
                                    Qty
                                </TableHead>
                                <TableHead className="text-right">
                                    Weight
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
                                <TableHead />
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={charged ? 10 : 9}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No line items on this quotation.
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
                                    <TableCell>{line.unit}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {line.qty}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(line.line_weight)}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(Number(line.price ?? 0))}
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
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            {can.edit && (
                                                <LineFormDialog
                                                    quotationId={quotation.id}
                                                    line={line}
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Edit item ${line.item}`}
                                                        >
                                                            <Pencil />
                                                        </Button>
                                                    }
                                                />
                                            )}

                                            {can.deleteLine && (
                                                <ConfirmDelete
                                                    url={QuotationLineController.destroy.url(
                                                        [quotation.id, line.id],
                                                    )}
                                                    label={`item ${line.item}`}
                                                />
                                            )}
                                        </div>
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
                            label="Total weight (kg)"
                            value={money.format(totals.weight)}
                        />
                        <TotalRow
                            label="Subtotal"
                            value={money.format(totals.subtotal)}
                        />
                        <TotalRow
                            label={`Discount (${totals.discount_percent}%)`}
                            value={money.format(totals.discount)}
                        />
                        <TotalRow
                            label="Subtotal after discount"
                            value={money.format(totals.after_discount)}
                        />
                        <TotalRow
                            label="Packing"
                            value={money.format(totals.packing)}
                        />
                        <TotalRow
                            label="Customs"
                            value={money.format(totals.customs)}
                        />
                        <TotalRow
                            label={quotation.misc || 'Miscellaneous'}
                            value={money.format(totals.misc)}
                        />
                        <TotalRow
                            label="Freight"
                            value={money.format(totals.freight)}
                        />
                        <TotalRow
                            label="Sum of total"
                            value={money.format(totals.sum_of_total)}
                        />
                        {totals.gst_rate > 0 && (
                            <TotalRow
                                label={`GST (${totals.gst_rate * 100}%)`}
                                value={money.format(totals.gst)}
                            />
                        )}
                        <TotalRow
                            label={`Grand total${quotation.currency ? ` (${quotation.currency})` : ''}`}
                            value={money.format(totals.grand_total)}
                            strong
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

QuotationShow.layout = ({ quotation }: Props) => ({
    breadcrumbs: [
        { title: 'Quotations', href: index() },
        { title: String(quotation.id), href: show(quotation.id) },
    ],
});
