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
import { confirmation, edit, index, show } from '@/routes/sales-order';
import { ArrowLeft, ClipboardCopy, FileText, Pencil, Plus } from 'lucide-react';
import SalesOrderLineController from '@/actions/App/Http/Controllers/SalesOrderLineController';
import ConfirmDelete from '@/components/confirm-delete';
import CopyQuotationDialog from './copy-quotation-dialog';
import LineFormDialog from './line-form-dialog';
import type { SalesOrder, SalesOrderLine, SalesOrderTotals } from './types';

type Props = {
    order: SalesOrder;
    lines: SalesOrderLine[];
    totals: SalesOrderTotals;
    can: { edit: boolean; deleteLine: boolean };
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

export default function SalesOrderShow({ order, lines, totals, can }: Props) {
    const charged = Boolean(order.sst);

    return (
        <>
            <Head title={`Sales order ${order.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Sales order ${order.id}`}
                        description={order.client?.cname ?? 'No client'}
                    />

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={index()}>
                                <ArrowLeft /> Back to list
                            </Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={confirmation(order.id)}>
                                <FileText /> Order confirmation
                            </Link>
                        </Button>

                        {can.edit && (
                            <Button asChild>
                                <Link href={edit(order.id)}>
                                    <Pencil /> Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                        <Field label="Client" value={order.client?.cname} />
                        <Field label="Contact" value={order.contact_person} />
                        <Field
                            label="Customer order"
                            value={order.customer_order}
                        />
                        <Field label="Email" value={order.email} />
                        <Field
                            label="Deliver to"
                            value={[
                                order.delivery_address?.customer_name,
                                order.delivery_address?.city,
                                order.delivery_address?.country,
                            ]
                                .filter(Boolean)
                                .join(', ')}
                        />
                        <Field label="AFE" value={order.afe} />
                    </dl>

                    <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                        <Field label="Salesperson" value={order.salesperson} />
                        <Field label="Reviewed by" value={order.reviewer} />
                        <Field label="Processed by" value={order.processor} />
                        <Field label="Currency" value={order.currency} />
                        <Field
                            label="SST"
                            value={charged ? 'Applicable' : 'N/A'}
                        />
                        <Field
                            label="COD"
                            value={order.is_cod ? 'Yes' : 'No'}
                        />
                        <Field label="Work order" value={order.workorder} />
                        <Field label="Invoice" value={order.invoice} />
                    </dl>

                    <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                        <Field
                            label="Customer required"
                            value={order.customer_reqdate}
                        />
                        <Field
                            label="Goods ready"
                            value={order.goods_ready_date}
                        />
                        <Field label="Despatched" value={order.despatch_date} />
                        <Field label="Closed" value={order.closing_date} />
                        <Field
                            label="Mode of shipment"
                            value={order.mode_of_shipment}
                        />
                        <Field label="Packaging" value={order.packaging_type} />
                        <Field
                            label="Certification"
                            value={order.certification}
                        />
                        <Field label="Payment terms" value={order.pay_terms} />
                    </dl>
                </div>

                {(order.remarks ||
                    order.sp_instruct1 ||
                    order.sp_instruct2 ||
                    order.sp_instruct3) && (
                    <div className="grid gap-2 rounded-xl border p-4 text-sm">
                        <span className="text-muted-foreground text-xs">
                            Instructions and remarks
                        </span>
                        {[
                            order.sp_instruct1,
                            order.sp_instruct2,
                            order.sp_instruct3,
                            order.remarks,
                        ]
                            .filter(Boolean)
                            .map((note, position) => (
                                <p
                                    key={position}
                                    className="whitespace-pre-line"
                                >
                                    {note}
                                </p>
                            ))}
                    </div>
                )}

                {can.edit && (
                    <div className="flex flex-wrap justify-end gap-2">
                        <CopyQuotationDialog
                            salesOrderId={order.id}
                            trigger={
                                <Button variant="outline">
                                    <ClipboardCopy /> Copy from quotation
                                </Button>
                            }
                        />

                        <LineFormDialog
                            salesOrderId={order.id}
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
                                        No line items on this sales order.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.item}</TableCell>
                                    <TableCell className="font-medium">
                                        {line.stock_code}
                                        <div className="text-muted-foreground text-xs">
                                            {[line.product, line.batch]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                        {line.description}
                                    </TableCell>
                                    <TableCell>{line.unit}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {line.quantity}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(line.line_weight)}
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
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            {can.edit && (
                                                <LineFormDialog
                                                    salesOrderId={order.id}
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
                                                    url={SalesOrderLineController.destroy.url(
                                                        [order.id, line.id],
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
                            label="Freight"
                            value={money.format(totals.freight)}
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
                            label={order.miscellaneous || 'Miscellaneous'}
                            value={money.format(totals.misc)}
                        />
                        <TotalRow
                            label="Discount"
                            value={`- ${money.format(totals.discount)}`}
                        />
                        <TotalRow
                            label={`Grand total${order.currency ? ` (${order.currency})` : ''}`}
                            value={money.format(totals.grand_total)}
                            strong
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

SalesOrderShow.layout = ({ order }: Props) => ({
    breadcrumbs: [
        { title: 'Sales orders', href: index() },
        { title: String(order.id), href: show(order.id) },
    ],
});
