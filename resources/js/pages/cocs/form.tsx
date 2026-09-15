import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CocController from '@/actions/App/Http/Controllers/CocController';
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
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import { create, index } from '@/routes/coc';
import { ArrowLeft } from 'lucide-react';
import type {
    CertifiableLine,
    DeliveryOrderForCoc,
    DeliveryOrderOption,
} from './types';

type Props = {
    month: string | null;
    deliveryOrders: DeliveryOrderOption[];
    deliveryOrder: DeliveryOrderForCoc | null;
    lines: CertifiableLine[];
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function CocForm({
    month,
    deliveryOrders,
    deliveryOrder,
    lines,
}: Props) {
    const [ticked, setTicked] = useState<number[]>([]);

    const go = (params: { month?: string; delivery_order?: number }) =>
        router.get(create({ query: params }), {}, { preserveState: false });

    return (
        <>
            <Head title="New certificate of conformity" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Certificate of conformity — add"
                        description="Pick the month, then the delivery order being certified."
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
                        {...CocController.store.form()}
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
                                        label="Despatched"
                                        value={formatDate(
                                            deliveryOrder.created_at,
                                        )}
                                    />
                                    <Field
                                        label="Delivery order"
                                        value={deliveryOrder.id}
                                    />
                                </dl>

                                <div className="overflow-x-auto rounded-xl border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead className="text-right">
                                                    Qty ordered
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Delivered
                                                </TableHead>
                                                <TableHead>
                                                    Stock code
                                                </TableHead>
                                                <TableHead>
                                                    Description
                                                </TableHead>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        aria-label="Select every line"
                                                        checked={
                                                            lines.length > 0 &&
                                                            ticked.length ===
                                                                lines.length
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setTicked(
                                                                checked
                                                                    ? lines.map(
                                                                          (l) =>
                                                                              l.id,
                                                                      )
                                                                    : [],
                                                            )
                                                        }
                                                    />
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
                                                    <TableCell className="text-right tabular-nums">
                                                        {line.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {line.actual_qty}
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
                                                    <TableCell>
                                                        <Checkbox
                                                            name="lines[]"
                                                            value={String(
                                                                line.id,
                                                            )}
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
                                                            aria-label={`Certify item ${line.item}`}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <InputError message={errors.lines} />

                                <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="quality_auth">
                                            Quality authority
                                        </Label>
                                        <Input
                                            id="quality_auth"
                                            name="quality_auth"
                                        />
                                        <InputError
                                            message={errors.quality_auth}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="remarks">Remarks</Label>
                                        <Textarea
                                            id="remarks"
                                            name="remarks"
                                            rows={4}
                                        />
                                        <InputError message={errors.remarks} />
                                    </div>
                                </section>

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
                                        Create new COC
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

CocForm.layout = {
    breadcrumbs: [{ title: 'COC', href: index() }],
};
