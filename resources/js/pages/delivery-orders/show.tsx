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
import { index, show } from '@/routes/delivery-order';
import { show as packingListShow } from '@/routes/packing-list';
import { show as salesOrderShow } from '@/routes/sales-order';
import { ArrowLeft } from 'lucide-react';
import type {
    DeliveryOrder,
    DeliveryOrderLine,
    DeliveryOrderTotals,
} from './types';

type Props = {
    order: DeliveryOrder;
    lines: DeliveryOrderLine[];
    totals: DeliveryOrderTotals;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function DeliveryOrderShow({ order, lines, totals }: Props) {
    return (
        <>
            <Head title={`Delivery order ${order.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Delivery order ${order.id}`}
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
                        label="Against"
                        value={
                            order.sales_order_id ? (
                                <Link
                                    href={salesOrderShow(order.sales_order_id)}
                                    className="hover:underline"
                                >
                                    Sales order {order.sales_order_id}
                                </Link>
                            ) : (
                                `${order.type} ${order.salesorder ?? ''}`
                            )
                        }
                    />
                    <Field
                        label="Customer order"
                        value={order.customer_order}
                    />
                    <Field
                        label="Items out"
                        value={
                            <span
                                className={
                                    order.complete
                                        ? 'text-primary font-semibold'
                                        : undefined
                                }
                            >
                                {order.delivered_fsd_items ?? 0} /{' '}
                                {order.total_fsd_items ?? 0}
                            </span>
                        }
                    />
                    <Field label="Status" value={order.status} />
                    <Field
                        label="Despatched"
                        value={formatDate(order.created_at)}
                    />
                    {order.packing_lists.length > 0 && (
                        <Field
                            label="Packing lists"
                            value={
                                <span className="flex flex-wrap gap-2">
                                    {order.packing_lists.map((id) => (
                                        <Link
                                            key={id}
                                            href={packingListShow(id)}
                                            className="hover:underline"
                                        >
                                            {id}
                                        </Link>
                                    ))}
                                </span>
                            }
                        />
                    )}
                </dl>

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Stock code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                    Ordered
                                </TableHead>
                                <TableHead className="text-right">
                                    Delivered
                                </TableHead>
                                <TableHead className="text-right">
                                    Unit price
                                </TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        Nothing was despatched on this note.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => {
                                const short =
                                    (line.actual_qty ?? 0) <
                                    (line.quantity ?? 0);

                                return (
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
                                            {line.quantity}
                                        </TableCell>
                                        <TableCell
                                            className={`text-right tabular-nums ${short ? 'text-destructive' : ''}`}
                                        >
                                            {line.actual_qty}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {money.format(
                                                Number(line.unit_price ?? 0),
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {money.format(line.line_total)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end">
                    <div className="w-full max-w-sm rounded-xl border p-4 text-sm">
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Quantity ordered
                            </span>
                            <span className="tabular-nums">
                                {totals.quantity}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Quantity delivered
                            </span>
                            <span className="tabular-nums">
                                {totals.delivered}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Weight delivered (kg)
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.weight)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 border-t py-1 pt-2 font-semibold">
                            <span>Value delivered</span>
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

DeliveryOrderShow.layout = ({ order }: Props) => ({
    breadcrumbs: [
        { title: 'Delivery orders', href: index() },
        { title: String(order.id), href: show(order.id) },
    ],
});
