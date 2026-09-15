import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DeliveryOrderController from '@/actions/App/Http/Controllers/DeliveryOrderController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { create, index } from '@/routes/delivery-order';
import { ArrowLeft } from 'lucide-react';
import type {
    DespatchableLine,
    SourceOption,
    SourceOrder,
    SourceOrderOption,
} from './types';

type Props = {
    sources: SourceOption[];
    type: string;
    month: string | null;
    orders: SourceOrderOption[];
    order: SourceOrder | null;
    lines: DespatchableLine[];
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function DeliveryOrderForm({
    sources,
    type,
    month,
    orders,
    order,
    lines,
}: Props) {
    const despatchable = lines.filter((line) => line.outstanding > 0);
    const [ticked, setTicked] = useState<number[]>([]);

    const go = (params: { type: string; month?: string; order?: number }) =>
        router.get(create({ query: params }), {}, { preserveState: false });

    const toggleAll = (checked: boolean) =>
        setTicked(checked ? despatchable.map((line) => line.id) : []);

    return (
        <>
            <Head title="New delivery order" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Delivery order — add"
                        description="Pick the month, then the order being despatched."
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                {/* One month and order picker per source, as in the legacy screen. */}
                <div className="grid gap-4 rounded-xl border p-4">
                    {sources.map((source) => (
                        <div
                            key={source.value}
                            className="grid gap-3 sm:grid-cols-[12rem_1fr] sm:items-center"
                        >
                            <Label className="text-sm font-semibold">
                                {source.label}
                            </Label>

                            <div className="flex flex-wrap items-center gap-2">
                                <Input
                                    type="month"
                                    className="w-44"
                                    aria-label={`${source.label} month`}
                                    value={
                                        type === source.value
                                            ? (month ?? '')
                                            : ''
                                    }
                                    onChange={(event) =>
                                        go({
                                            type: source.value,
                                            month: event.target.value,
                                        })
                                    }
                                />

                                <Select
                                    value={
                                        type === source.value && order
                                            ? String(order.id)
                                            : undefined
                                    }
                                    disabled={
                                        type !== source.value ||
                                        orders.length === 0
                                    }
                                    onValueChange={(value) =>
                                        go({
                                            type: source.value,
                                            month: month ?? undefined,
                                            order: Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        className="w-96"
                                        aria-label={`${source.label} number`}
                                    >
                                        <SelectValue
                                            placeholder={
                                                type === source.value &&
                                                month &&
                                                orders.length === 0
                                                    ? 'None raised that month'
                                                    : 'Choose an order'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orders.map((option) => (
                                            <SelectItem
                                                key={option.id}
                                                value={String(option.id)}
                                            >
                                                {option.id}
                                                {option.client
                                                    ? ` · ${option.client}`
                                                    : ''}
                                                {option.customer_order
                                                    ? ` · ${option.customer_order}`
                                                    : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>

                {order && (
                    <Form
                        {...DeliveryOrderController.store.form()}
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input type="hidden" name="type" value={type} />
                                <input
                                    type="hidden"
                                    name="order"
                                    value={order.id}
                                />
                                <input
                                    type="hidden"
                                    name="customer_order"
                                    value={order.customer_order ?? ''}
                                />

                                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-4">
                                    <Field
                                        label="To"
                                        value={order.client?.cname}
                                    />
                                    <Field
                                        label="Address"
                                        value={[
                                            order.client?.address,
                                            order.client?.state,
                                            order.client?.country,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    />
                                    <Field
                                        label="Attention"
                                        value={order.contact_person}
                                    />
                                    <Field
                                        label="Mode of conveyance"
                                        value={order.mode_of_shipment}
                                    />
                                    <Field
                                        label="Customer purchase order"
                                        value={order.customer_order}
                                    />
                                    <Field
                                        label="FSD order no."
                                        value={`FSD/MLY/${order.id}`}
                                    />
                                    <Field
                                        label="Tel"
                                        value={order.client?.phone}
                                    />
                                    <Field
                                        label="Fax"
                                        value={order.client?.fax}
                                    />
                                    <Field
                                        label="Date"
                                        value={formatDate(order.created_at)}
                                    />
                                    {order.remarks && (
                                        <Field
                                            label="Remarks"
                                            value={order.remarks}
                                        />
                                    )}
                                </dl>

                                <div className="overflow-x-auto rounded-xl border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No</TableHead>
                                                <TableHead className="text-right">
                                                    Qty
                                                </TableHead>
                                                <TableHead>
                                                    Description
                                                </TableHead>
                                                <TableHead>
                                                    Stock code
                                                </TableHead>
                                                <TableHead>DO</TableHead>
                                                <TableHead className="text-right">
                                                    DO qty
                                                </TableHead>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        aria-label="Select every line still outstanding"
                                                        checked={
                                                            despatchable.length >
                                                                0 &&
                                                            ticked.length ===
                                                                despatchable.length
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            toggleAll(!!checked)
                                                        }
                                                    />
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
                                                        This order has no line
                                                        items.
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {lines.map((line, position) => {
                                                const done =
                                                    line.outstanding <= 0;

                                                return (
                                                    <TableRow key={line.id}>
                                                        <TableCell>
                                                            {position + 1}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {line.quantity}
                                                        </TableCell>
                                                        <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                                            {line.description}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {line.stock_code}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {line.delivery_orders.join(
                                                                ', ',
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {line.already_sent ||
                                                                ''}
                                                            {done && (
                                                                <div className="text-destructive text-xs">
                                                                    All
                                                                    delivered
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Checkbox
                                                                name="lines[]"
                                                                value={String(
                                                                    line.id,
                                                                )}
                                                                disabled={done}
                                                                checked={ticked.includes(
                                                                    line.id,
                                                                )}
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    setTicked(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            checked
                                                                                ? [
                                                                                      ...current,
                                                                                      line.id,
                                                                                  ]
                                                                                : current.filter(
                                                                                      (
                                                                                          id,
                                                                                      ) =>
                                                                                          id !==
                                                                                          line.id,
                                                                                  ),
                                                                    )
                                                                }
                                                                aria-label={`Despatch item ${line.item}`}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                <InputError message={errors.lines} />

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href={index()}>Cancel</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing || ticked.length === 0
                                        }
                                    >
                                        Create delivery order
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

DeliveryOrderForm.layout = {
    breadcrumbs: [{ title: 'Delivery orders', href: index() }],
};
