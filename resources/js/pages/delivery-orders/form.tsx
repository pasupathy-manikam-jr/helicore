import { Form, Head, Link } from '@inertiajs/react';
import DeliveryOrderController from '@/actions/App/Http/Controllers/DeliveryOrderController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/delivery-order';
import { show as salesOrderShow } from '@/routes/sales-order';
import { ArrowLeft } from 'lucide-react';
import type { DespatchableLine, SalesOrderForDespatch } from './types';

type Props = {
    order: SalesOrderForDespatch;
    lines: DespatchableLine[];
};

export default function DeliveryOrderForm({ order, lines }: Props) {
    const outstanding = (line: DespatchableLine) =>
        (line.quantity ?? 0) - line.already_sent;

    return (
        <>
            <Head title={`Despatch against sales order ${order.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Despatch against sales order ${order.id}`}
                        description={order.client ?? 'No client on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={salesOrderShow(order.id)}>
                            <ArrowLeft /> Back to sales order
                        </Link>
                    </Button>
                </div>

                <Form
                    {...DeliveryOrderController.store.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="salesorder"
                                value={order.id}
                            />

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="customer_order">
                                        Customer order
                                    </Label>
                                    <Input
                                        id="customer_order"
                                        name="customer_order"
                                        defaultValue={
                                            order.customer_order ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.customer_order}
                                    />
                                </div>
                            </section>

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
                                                Already sent
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Sending now
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {lines.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-muted-foreground py-8 text-center"
                                                >
                                                    This sales order has no line
                                                    items to despatch.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {lines.map((line) => (
                                            <TableRow key={line.id}>
                                                <TableCell>
                                                    {line.item}
                                                </TableCell>
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
                                                    {line.already_sent}
                                                    {outstanding(line) > 0 && (
                                                        <div className="text-muted-foreground text-xs">
                                                            {outstanding(line)}{' '}
                                                            outstanding
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        name={`quantities[${line.id}]`}
                                                        inputMode="numeric"
                                                        defaultValue={
                                                            outstanding(line) >
                                                            0
                                                                ? outstanding(
                                                                      line,
                                                                  )
                                                                : ''
                                                        }
                                                        className="ml-auto w-24 text-right"
                                                        aria-label={`Quantity to despatch for item ${line.item}`}
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `quantities.${line.id}`
                                                            ]
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <InputError message={errors.quantities} />

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={index()}>Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || lines.length === 0}
                                >
                                    Create delivery order
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

DeliveryOrderForm.layout = ({ order }: Props) => ({
    breadcrumbs: [
        { title: 'Delivery orders', href: index() },
        { title: `Sales order ${order.id}`, href: salesOrderShow(order.id) },
    ],
});
