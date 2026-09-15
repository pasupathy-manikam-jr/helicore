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
import { confirmation, index, show } from '@/routes/sales-order';
import { ArrowLeft, FileText } from 'lucide-react';
import type { SalesOrder, SalesOrderLine, SalesOrderTotals } from './types';

type Props = {
    order: SalesOrder;
    lines: Pick<
        SalesOrderLine,
        | 'id'
        | 'item'
        | 'description'
        | 'unit'
        | 'quantity'
        | 'unit_price'
        | 'sst'
        | 'line_total'
    >[];
    totals: SalesOrderTotals;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[10rem_1fr] gap-2 py-1">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="text-sm">{value || '—'}</span>
        </div>
    );
}

export default function SalesOrderConfirmation({
    order,
    lines,
    totals,
}: Props) {
    const charged = Boolean(order.sst);

    const address = (
        parts: (string | null | undefined)[],
        name?: string | null,
    ) => (
        <>
            {name && <div className="font-medium">{name}</div>}
            {parts.filter(Boolean).join(', ')}
        </>
    );

    return (
        <>
            <Head title={`Order confirmation ${order.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Order confirmation"
                        description={`FSD/MLY/${order.id}`}
                    />

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={index()}>
                                <ArrowLeft /> Back to list
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={show(order.id)}>
                                <FileText /> Full sales order
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 rounded-xl border p-6 lg:grid-cols-2">
                    <div>
                        <Row
                            label="FSD order no."
                            value={`FSD/MLY/${order.id}`}
                        />
                        <Row
                            label="Our reference"
                            value={order.receiving_note}
                        />
                        <Row
                            label="Your reference"
                            value={order.customer_order}
                        />
                        <Row
                            label="Attention to"
                            value={order.contact_person}
                        />
                        <Row label="Email" value={order.email} />
                        <Row
                            label="Invoice to"
                            value={address(
                                [
                                    order.client?.address,
                                    order.client?.city,
                                    order.client?.state,
                                    order.client?.country,
                                ],
                                order.client?.cname,
                            )}
                        />
                    </div>

                    <div>
                        <Row
                            label="Date"
                            value={formatDate(order.created_at)}
                        />
                        <Row
                            label="Delivery date"
                            value={formatDate(order.required_datetime)}
                        />
                        <Row label="Issuer" value={order.issuer} />
                        <Row label="Salesperson" value={order.salesperson} />
                        <Row label="Bid validity" value={order.bid_validity} />
                        <Row label="Payment terms" value={order.pay_terms} />
                        <Row
                            label="Deliver to"
                            value={address(
                                [
                                    order.delivery_address?.address,
                                    order.delivery_address?.city,
                                    order.delivery_address?.state,
                                    order.delivery_address?.country,
                                ],
                                order.delivery_address?.customer_name,
                            )}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>UOM</TableHead>
                                <TableHead className="text-right">
                                    SO qty
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
                                        Nothing has been ordered yet.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.item}</TableCell>
                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                        {line.description}
                                    </TableCell>
                                    <TableCell>{line.unit}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {line.quantity}
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
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Freight
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.freight)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Packing
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.packing)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Customs
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.customs)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                {order.miscellaneous || 'Miscellaneous'}
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.misc)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Discount
                            </span>
                            <span className="tabular-nums">
                                - {money.format(totals.discount)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 border-t py-1 pt-2 font-semibold">
                            <span>
                                Grand total
                                {order.currency ? ` (${order.currency})` : ''}
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

SalesOrderConfirmation.layout = ({ order }: Props) => ({
    breadcrumbs: [
        { title: 'Sales orders', href: index() },
        { title: String(order.id), href: show(order.id) },
        { title: 'Order confirmation', href: confirmation(order.id) },
    ],
});
