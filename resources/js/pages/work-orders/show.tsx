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
import { index, show } from '@/routes/work-order';
import { ArrowLeft } from 'lucide-react';
import type { WorkOrder, WorkOrderLine, WorkOrderTotals } from './types';

type Props = {
    order: WorkOrder;
    lines: WorkOrderLine[];
    totals: WorkOrderTotals;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function WorkOrderShow({ order, lines, totals }: Props) {
    return (
        <>
            <Head title={`Work order ${order.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Work order ${order.id}`}
                        description={order.client ?? 'No client on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="Client" value={order.client} />
                    <Field
                        label="Sales order"
                        value={
                            order.salesorder ? (
                                <Link
                                    href={salesOrderShow(order.salesorder)}
                                    className="hover:underline"
                                >
                                    {order.salesorder}
                                </Link>
                            ) : null
                        }
                    />
                    <Field label="Contact" value={order.contact_person} />
                    <Field label="Processed by" value={order.processor} />
                    <Field
                        label="Goods ready"
                        value={formatDate(order.goods_ready_date)}
                    />
                    <Field
                        label="Closed"
                        value={formatDate(order.closing_date)}
                    />
                    <Field label="Location" value={order.location} />
                    <Field
                        label="Mode of shipment"
                        value={order.mode_of_shipment}
                    />
                    <Field label="Packaging" value={order.packaging_type} />
                    <Field
                        label="Raised"
                        value={formatDate(order.created_at)}
                    />
                </dl>

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
                                <TableHead>Operator</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No line items on this work order.
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
                                    <TableCell>{line.operator}</TableCell>
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
                        <div className="flex justify-between gap-8 border-t py-1 pt-2 font-semibold">
                            <span>Value</span>
                            <span className="tabular-nums">
                                {money.format(totals.value)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

WorkOrderShow.layout = ({ order }: Props) => ({
    breadcrumbs: [
        { title: 'Work orders', href: index() },
        { title: String(order.id), href: show(order.id) },
    ],
});
