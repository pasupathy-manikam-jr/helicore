import { Form, Head, Link, router } from '@inertiajs/react';
import InvoiceController from '@/actions/App/Http/Controllers/InvoiceController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate, money } from '@/lib/format';
import { create, index } from '@/routes/invoice';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import type {
    BillableLine,
    DeliveryOrderForInvoice,
    DeliveryOrderOption,
} from './types';

type Props = {
    month: string | null;
    deliveryOrders: DeliveryOrderOption[];
    deliveryOrder: DeliveryOrderForInvoice | null;
    lines: BillableLine[];
    subtotal: number;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function InvoiceForm({
    month,
    deliveryOrders,
    deliveryOrder,
    lines,
    subtotal,
}: Props) {
    const go = (params: { month?: string; delivery_order?: number }) =>
        router.get(create({ query: params }), {}, { preserveState: false });

    return (
        <>
            <Head title="New invoice" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Invoice — add"
                        description="Pick the month, then the delivery order being billed."
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border p-4">
                    <Label className="w-32 text-sm font-semibold">
                        Delivery order
                    </Label>

                    <Input
                        type="month"
                        className="w-44"
                        aria-label="Month"
                        value={month ?? ''}
                        onChange={(event) => go({ month: event.target.value })}
                    />

                    <Select
                        value={
                            deliveryOrder ? String(deliveryOrder.id) : undefined
                        }
                        disabled={deliveryOrders.length === 0}
                        onValueChange={(value) =>
                            go({
                                month: month ?? undefined,
                                delivery_order: Number(value),
                            })
                        }
                    >
                        <SelectTrigger
                            className="w-96"
                            aria-label="Delivery order number"
                        >
                            <SelectValue
                                placeholder={
                                    month && deliveryOrders.length === 0
                                        ? 'None raised that month'
                                        : 'Choose a delivery order'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {deliveryOrders.map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={String(option.id)}
                                >
                                    {option.id} · {option.type} ·{' '}
                                    {option.salesorder}
                                    {option.status === 'invoiced'
                                        ? ' · invoiced'
                                        : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {deliveryOrder && (
                    <Form
                        {...InvoiceController.store.form()}
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="delivery_order"
                                    value={deliveryOrder.id}
                                />

                                {deliveryOrder.already_invoiced && (
                                    <p className="border-destructive/40 text-destructive flex items-center gap-2 rounded-xl border p-3 text-sm">
                                        <TriangleAlert className="size-4" />
                                        This delivery order has already been
                                        invoiced.
                                    </p>
                                )}

                                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-5">
                                    <Field
                                        label="Client"
                                        value={deliveryOrder.client}
                                    />
                                    <Field
                                        label="Against"
                                        value={`${deliveryOrder.type} ${deliveryOrder.salesorder ?? ''}`}
                                    />
                                    <Field
                                        label="Customer order"
                                        value={deliveryOrder.customer_order}
                                    />
                                    <Field
                                        label="Currency"
                                        value={deliveryOrder.currency}
                                    />
                                    <Field
                                        label="SST"
                                        value={
                                            deliveryOrder.sst
                                                ? 'Applicable'
                                                : 'N/A'
                                        }
                                    />
                                    <Field
                                        label="Despatched"
                                        value={formatDate(
                                            deliveryOrder.created_at,
                                        )}
                                    />
                                </dl>

                                <div className="overflow-x-auto rounded-xl border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead>
                                                    Stock code
                                                </TableHead>
                                                <TableHead>
                                                    Description
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Billed qty
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
                                            {lines.map((line) => (
                                                <TableRow key={line.id}>
                                                    <TableCell>
                                                        {line.item}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {line.stockcode}
                                                    </TableCell>
                                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                                        {line.description}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {line.actual_qty}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {money.format(
                                                            Number(
                                                                line.unit_price ??
                                                                    0,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {money.format(
                                                            line.line_total,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="paymentterms">
                                            Payment terms
                                        </Label>
                                        <Input
                                            id="paymentterms"
                                            name="paymentterms"
                                            defaultValue={
                                                deliveryOrder.pay_terms ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.paymentterms}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="transportation">
                                            Transportation
                                        </Label>
                                        <Input
                                            id="transportation"
                                            name="transportation"
                                            inputMode="decimal"
                                            defaultValue="0.00"
                                        />
                                        <InputError
                                            message={errors.transportation}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="custom">Customs</Label>
                                        <Input
                                            id="custom"
                                            name="custom"
                                            inputMode="decimal"
                                            defaultValue="0.00"
                                        />
                                        <InputError message={errors.custom} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="packing_charge">
                                            Packing
                                        </Label>
                                        <Input
                                            id="packing_charge"
                                            name="packing_charge"
                                            inputMode="decimal"
                                            defaultValue="0.00"
                                        />
                                        <InputError
                                            message={errors.packing_charge}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="misc_title">
                                            Miscellaneous label
                                        </Label>
                                        <Input
                                            id="misc_title"
                                            name="misc_title"
                                        />
                                        <InputError
                                            message={errors.misc_title}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="misc">
                                            Miscellaneous value
                                        </Label>
                                        <Input
                                            id="misc"
                                            name="misc"
                                            inputMode="decimal"
                                            defaultValue="0.00"
                                        />
                                        <InputError message={errors.misc} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="discount">
                                            Discount
                                        </Label>
                                        <Input
                                            id="discount"
                                            name="discount"
                                            inputMode="decimal"
                                            defaultValue="0.00"
                                        />
                                        <InputError message={errors.discount} />
                                    </div>
                                </section>

                                <div className="flex items-center justify-end gap-6">
                                    <span className="text-sm">
                                        Subtotal{' '}
                                        <span className="font-semibold tabular-nums">
                                            {money.format(subtotal)}
                                        </span>
                                        {deliveryOrder.currency
                                            ? ` ${deliveryOrder.currency}`
                                            : ''}
                                    </span>

                                    <div className="flex gap-2">
                                        <Button variant="outline" asChild>
                                            <Link href={index()}>Cancel</Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing || lines.length === 0
                                            }
                                        >
                                            Create invoice
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </div>
        </>
    );
}

InvoiceForm.layout = {
    breadcrumbs: [{ title: 'Invoices', href: index() }],
};
