import { Form, Head, Link, router } from '@inertiajs/react';
import PackingListController from '@/actions/App/Http/Controllers/PackingListController';
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
import { formatDate } from '@/lib/format';
import { create, index } from '@/routes/packing-list';
import { ArrowLeft } from 'lucide-react';
import type {
    DeliveryOrderForPacking,
    DeliveryOrderOption,
    PackableLine,
} from './types';

type Props = {
    month: string | null;
    deliveryOrders: DeliveryOrderOption[];
    deliveryOrder: DeliveryOrderForPacking | null;
    lines: PackableLine[];
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function PackingListForm({
    month,
    deliveryOrders,
    deliveryOrder,
    lines,
}: Props) {
    const go = (params: { month?: string; delivery_order?: number }) =>
        router.get(create({ query: params }), {}, { preserveState: false });

    return (
        <>
            <Head title="New packing list" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Packing list — add"
                        description="Pick the month, then the delivery order being packed."
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
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {deliveryOrder && (
                    <Form
                        {...PackingListController.store.form()}
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

                                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-4">
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
                                        label="Despatched"
                                        value={formatDate(
                                            deliveryOrder.created_at,
                                        )}
                                    />
                                </dl>

                                <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="ref">Reference</Label>
                                        <Input id="ref" name="ref" />
                                        <InputError message={errors.ref} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="altcustomername">
                                            Customer name on the list
                                        </Label>
                                        <Input
                                            id="altcustomername"
                                            name="altcustomername"
                                            defaultValue={
                                                deliveryOrder.client ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.altcustomername}
                                        />
                                    </div>
                                </section>

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
                                                    Delivered
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Unit weight
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {lines.length === 0 && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="text-muted-foreground py-8 text-center"
                                                    >
                                                        Nothing was despatched
                                                        on this note.
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {lines.map((line) => (
                                                <TableRow key={line.id}>
                                                    <TableCell>
                                                        {line.item}
                                                    </TableCell>
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
                                                        {line.weight}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <p className="text-muted-foreground text-xs">
                                    Every line above is packed onto the list.
                                </p>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing || lines.length === 0
                                        }
                                    >
                                        Create packing list
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </div>
        </>
    );
}

PackingListForm.layout = {
    breadcrumbs: [{ title: 'Packing lists', href: index() }],
};
