import { Form, Head, Link, router } from '@inertiajs/react';
import ProformaController from '@/actions/App/Http/Controllers/ProformaController';
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
import { create, index } from '@/routes/proforma';
import { ArrowLeft } from 'lucide-react';
import type {
    QuotableLine,
    SalesOrderForProforma,
    SalesOrderOption,
    SalesOrderTotals,
} from './types';

type Props = {
    month: string | null;
    salesOrders: SalesOrderOption[];
    salesOrder: SalesOrderForProforma | null;
    lines: QuotableLine[];
    totals: SalesOrderTotals | null;
};

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

export default function ProformaForm({
    month,
    salesOrders,
    salesOrder,
    lines,
    totals,
}: Props) {
    const go = (params: { month?: string; sales_order?: number }) =>
        router.get(create({ query: params }), {}, { preserveState: false });

    return (
        <>
            <Head title="New proforma" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Proforma — add"
                        description="Pick the month, then an open sales order to quote."
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border p-4">
                    <Label className="w-32 text-sm font-semibold">
                        Sales order
                    </Label>

                    <Input
                        type="month"
                        className="w-44"
                        aria-label="Month"
                        value={month ?? ''}
                        onChange={(event) => go({ month: event.target.value })}
                    />

                    <Select
                        value={salesOrder ? String(salesOrder.id) : undefined}
                        disabled={salesOrders.length === 0}
                        onValueChange={(value) =>
                            go({
                                month: month ?? undefined,
                                sales_order: Number(value),
                            })
                        }
                    >
                        <SelectTrigger
                            className="w-96"
                            aria-label="Sales order number"
                        >
                            <SelectValue
                                placeholder={
                                    month && salesOrders.length === 0
                                        ? 'None still open that month'
                                        : 'Choose a sales order'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {salesOrders.map((option) => (
                                <SelectItem
                                    key={option.id}
                                    value={String(option.id)}
                                >
                                    {option.id}
                                    {option.client ? ` · ${option.client}` : ''}
                                    {option.customer_order
                                        ? ` · ${option.customer_order}`
                                        : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {salesOrder && totals && (
                    <Form
                        {...ProformaController.store.form()}
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="sales_order"
                                    value={salesOrder.id}
                                />

                                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-5">
                                    <Field
                                        label="Client"
                                        value={salesOrder.client}
                                    />
                                    <Field
                                        label="Customer order"
                                        value={salesOrder.customer_order}
                                    />
                                    <Field
                                        label="Currency"
                                        value={salesOrder.currency}
                                    />
                                    <Field
                                        label="SST"
                                        value={
                                            salesOrder.sst
                                                ? 'Applicable'
                                                : 'N/A'
                                        }
                                    />
                                    <Field
                                        label="Raised"
                                        value={formatDate(
                                            salesOrder.created_at,
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
                                                    Qty
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
                                                        {line.stock_code}
                                                    </TableCell>
                                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                                        {line.description}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {line.quantity}{' '}
                                                        {line.unit}
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

                                <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="paymentdue">
                                            Payment due
                                        </Label>
                                        <Input
                                            id="paymentdue"
                                            name="paymentdue"
                                            defaultValue={
                                                salesOrder.pay_terms ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.paymentdue}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="misc_title">
                                            Miscellaneous label
                                        </Label>
                                        <Input
                                            id="misc_title"
                                            name="misc_title"
                                            defaultValue={
                                                salesOrder.miscellaneous ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.misc_title}
                                        />
                                    </div>
                                </section>

                                <div className="flex justify-end">
                                    <div className="w-full max-w-sm rounded-xl border p-4 text-sm">
                                        <TotalRow
                                            label="Subtotal"
                                            value={money.format(
                                                totals.subtotal,
                                            )}
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
                                            label={
                                                salesOrder.miscellaneous ||
                                                'Miscellaneous'
                                            }
                                            value={money.format(totals.misc)}
                                        />
                                        <TotalRow
                                            label="Discount"
                                            value={`- ${money.format(totals.discount)}`}
                                        />
                                        <TotalRow
                                            label={`Grand total${salesOrder.currency ? ` (${salesOrder.currency})` : ''}`}
                                            value={money.format(
                                                totals.grand_total,
                                            )}
                                            strong
                                        />
                                    </div>
                                </div>

                                <p className="text-muted-foreground text-xs">
                                    The charges are taken from the sales order.
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
                                        Create proforma
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

ProformaForm.layout = {
    breadcrumbs: [{ title: 'Proformas', href: index() }],
};
