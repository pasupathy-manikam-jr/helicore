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
import { index, show } from '@/routes/packing-list';
import { show as salesOrderShow } from '@/routes/sales-order';
import { ArrowLeft } from 'lucide-react';
import type { PackingList, PackingListLine, PackingListTotals } from './types';

type Props = {
    list: PackingList;
    lines: PackingListLine[];
    totals: PackingListTotals;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function PackingListShow({ list, lines, totals }: Props) {
    return (
        <>
            <Head title={`Packing list ${list.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Packing list ${list.id}`}
                        description={list.altcustomername ?? 'No customer name'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-4">
                    <Field label="Customer" value={list.altcustomername} />
                    <Field label="Reference" value={list.ref} />
                    <Field label="Packed" value={formatDate(list.created_at)} />
                    <Field
                        label="Sales orders"
                        value={
                            <span className="flex flex-wrap gap-2">
                                {list.sales_orders.map((id) => (
                                    <Link
                                        key={id}
                                        href={salesOrderShow(id)}
                                        className="hover:underline"
                                    >
                                        {id}
                                    </Link>
                                ))}
                            </span>
                        }
                    />
                </dl>

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Delivery order</TableHead>
                                <TableHead>Stock code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                    Qty
                                </TableHead>
                                <TableHead className="text-right">
                                    Weight
                                </TableHead>
                                <TableHead className="text-right">
                                    Value
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
                                        Nothing is packed on this list.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.item}</TableCell>
                                    <TableCell>
                                        {line.do_id ? (
                                            <Link
                                                href={deliveryOrderShow(
                                                    line.do_id,
                                                )}
                                                className="hover:underline"
                                            >
                                                {line.do_id}
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {line.stockcode ?? '—'}
                                    </TableCell>
                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                        {line.description}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {line.quantity}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(line.unit_weight ?? 0)}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(line.unit_value ?? 0)}
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
                                Items packed
                            </span>
                            <span className="tabular-nums">{totals.items}</span>
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
                            <span>Declared value</span>
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

PackingListShow.layout = ({ list }: Props) => ({
    breadcrumbs: [
        { title: 'Packing lists', href: index() },
        { title: String(list.id), href: show(list.id) },
    ],
});
