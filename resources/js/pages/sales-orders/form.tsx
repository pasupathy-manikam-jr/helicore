import { Form, Head, Link } from '@inertiajs/react';
import SalesOrderController from '@/actions/App/Http/Controllers/SalesOrderController';
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
import { Textarea } from '@/components/ui/textarea';
import { index, show } from '@/routes/sales-order';
import { ArrowLeft } from 'lucide-react';
import type { ReferenceOption, SalesOrderFormValues } from './types';

type Props = {
    order: SalesOrderFormValues | null;
    clients: { id: number; cname: string | null }[];
    deliveryAddresses: {
        id: number;
        customer_name: string | null;
        company_detail_id: number | null;
        city: string | null;
    }[];
    currencies: ReferenceOption[];
    modesOfShipment: { id: number; mode: string | null }[];
    salespeople: ReferenceOption[];
    staff: ReferenceOption[];
};

function Field({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function PersonSelect({
    name,
    people,
    value,
    placeholder,
}: {
    name: string;
    people: ReferenceOption[];
    value: number | null | undefined;
    placeholder: string;
}) {
    return (
        <Select name={name} defaultValue={value ? String(value) : undefined}>
            <SelectTrigger id={name}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {people.map((person) => (
                    <SelectItem key={person.id} value={String(person.id)}>
                        {person.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default function SalesOrderForm({
    order,
    clients,
    deliveryAddresses,
    currencies,
    modesOfShipment,
    salespeople,
    staff,
}: Props) {
    const action = order
        ? SalesOrderController.update.form(order.id)
        : SalesOrderController.store.form();

    return (
        <>
            <Head
                title={
                    order ? `Edit sales order ${order.id}` : 'New sales order'
                }
            />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={
                            order
                                ? `Edit sales order ${order.id}`
                                : 'New sales order'
                        }
                        description="Header details. Line items come from the quotation the order is raised against."
                    />

                    <Button variant="outline" asChild>
                        <Link href={order ? show(order.id) : index()}>
                            <ArrowLeft /> Cancel
                        </Link>
                    </Button>
                </div>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Client"
                                    htmlFor="customer_no"
                                    error={errors.customer_no}
                                >
                                    {/* Thousands of clients, so this is an id
                                        box backed by a datalist of names. */}
                                    <Input
                                        id="customer_no"
                                        name="customer_no"
                                        list="so-clients"
                                        defaultValue={order?.customer_no ?? ''}
                                    />
                                    <datalist id="so-clients">
                                        {clients.map((client) => (
                                            <option
                                                key={client.id}
                                                value={client.id}
                                                label={client.cname ?? ''}
                                            />
                                        ))}
                                    </datalist>
                                </Field>

                                <Field
                                    label="Deliver to"
                                    htmlFor="delivery_address"
                                    error={errors.delivery_address}
                                >
                                    <Input
                                        id="delivery_address"
                                        name="delivery_address"
                                        list="so-delivery-addresses"
                                        defaultValue={
                                            order?.delivery_address ?? ''
                                        }
                                    />
                                    <datalist id="so-delivery-addresses">
                                        {deliveryAddresses.map((address) => (
                                            <option
                                                key={address.id}
                                                value={address.id}
                                                label={[
                                                    address.customer_name,
                                                    address.city,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            />
                                        ))}
                                    </datalist>
                                </Field>

                                <Field
                                    label="Contact"
                                    htmlFor="contact_person"
                                    error={errors.contact_person}
                                >
                                    <Input
                                        id="contact_person"
                                        name="contact_person"
                                        defaultValue={
                                            order?.contact_person ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Email"
                                    htmlFor="email"
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        name="email"
                                        inputMode="email"
                                        defaultValue={order?.email ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Customer order"
                                    htmlFor="customer_order"
                                    error={errors.customer_order}
                                >
                                    <Input
                                        id="customer_order"
                                        name="customer_order"
                                        defaultValue={
                                            order?.customer_order ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Receiving note"
                                    htmlFor="receiving_note"
                                    error={errors.receiving_note}
                                >
                                    <Input
                                        id="receiving_note"
                                        name="receiving_note"
                                        defaultValue={
                                            order?.receiving_note ?? ''
                                        }
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Salesperson"
                                    htmlFor="sales_person"
                                    error={errors.sales_person}
                                >
                                    <PersonSelect
                                        name="sales_person"
                                        people={salespeople}
                                        value={order?.sales_person}
                                        placeholder="Select a salesperson"
                                    />
                                </Field>

                                <Field
                                    label="Contract reviewed by"
                                    htmlFor="contract_reviewed_by"
                                    error={errors.contract_reviewed_by}
                                >
                                    <PersonSelect
                                        name="contract_reviewed_by"
                                        people={staff}
                                        value={order?.contract_reviewed_by}
                                        placeholder="Select a reviewer"
                                    />
                                </Field>

                                <Field
                                    label="Order processed by"
                                    htmlFor="order_process_by"
                                    error={errors.order_process_by}
                                >
                                    <PersonSelect
                                        name="order_process_by"
                                        people={staff}
                                        value={order?.order_process_by}
                                        placeholder="Select who processes it"
                                    />
                                </Field>

                                <Field
                                    label="Currency"
                                    htmlFor="currency"
                                    error={errors.currency}
                                >
                                    <Select
                                        name="currency"
                                        defaultValue={
                                            order?.currency
                                                ? String(order.currency)
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger id="currency">
                                            <SelectValue placeholder="Select a currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem
                                                    key={currency.id}
                                                    value={String(currency.id)}
                                                >
                                                    {currency.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Mode of shipment"
                                    htmlFor="mode_of_shipment"
                                    error={errors.mode_of_shipment}
                                >
                                    <Select
                                        name="mode_of_shipment"
                                        defaultValue={
                                            order?.mode_of_shipment ?? undefined
                                        }
                                    >
                                        <SelectTrigger id="mode_of_shipment">
                                            <SelectValue placeholder="Select a mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modesOfShipment.map((mode) => (
                                                <SelectItem
                                                    key={mode.id}
                                                    value={mode.mode ?? ''}
                                                >
                                                    {mode.mode}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Packaging"
                                    htmlFor="packaging_type"
                                    error={errors.packaging_type}
                                >
                                    <Input
                                        id="packaging_type"
                                        name="packaging_type"
                                        defaultValue={
                                            order?.packaging_type ?? ''
                                        }
                                    />
                                </Field>

                                <Field label="SST" error={errors.sst}>
                                    <Select
                                        name="sst"
                                        defaultValue={String(order?.sst ?? 0)}
                                    >
                                        <SelectTrigger id="sst">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">
                                                Applicable
                                            </SelectItem>
                                            <SelectItem value="0">
                                                N/A
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field label="COD" error={errors.is_cod}>
                                    <Select
                                        name="is_cod"
                                        defaultValue={String(
                                            order?.is_cod ?? 0,
                                        )}
                                    >
                                        <SelectTrigger id="is_cod">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">
                                                Yes
                                            </SelectItem>
                                            <SelectItem value="0">
                                                No
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Certification"
                                    htmlFor="certification"
                                    error={errors.certification}
                                >
                                    <Input
                                        id="certification"
                                        name="certification"
                                        defaultValue={
                                            order?.certification ?? ''
                                        }
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Customer required (as written)"
                                    htmlFor="customer_reqdate"
                                    error={errors.customer_reqdate}
                                >
                                    <Input
                                        id="customer_reqdate"
                                        name="customer_reqdate"
                                        defaultValue={
                                            order?.customer_reqdate ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Required by"
                                    htmlFor="required_datetime"
                                    error={errors.required_datetime}
                                >
                                    <Input
                                        id="required_datetime"
                                        name="required_datetime"
                                        type="date"
                                        defaultValue={
                                            order?.required_datetime ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Goods ready"
                                    htmlFor="goods_ready_date"
                                    error={errors.goods_ready_date}
                                >
                                    <Input
                                        id="goods_ready_date"
                                        name="goods_ready_date"
                                        type="date"
                                        defaultValue={
                                            order?.goods_ready_date ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Despatch"
                                    htmlFor="despatch_date"
                                    error={errors.despatch_date}
                                >
                                    <Input
                                        id="despatch_date"
                                        name="despatch_date"
                                        type="date"
                                        defaultValue={
                                            order?.despatch_date ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Pack order"
                                    htmlFor="packorder_date"
                                    error={errors.packorder_date}
                                >
                                    <Input
                                        id="packorder_date"
                                        name="packorder_date"
                                        type="date"
                                        defaultValue={
                                            order?.packorder_date ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Closing"
                                    htmlFor="closing_date"
                                    error={errors.closing_date}
                                >
                                    <Input
                                        id="closing_date"
                                        name="closing_date"
                                        type="date"
                                        defaultValue={order?.closing_date ?? ''}
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Delivery terms"
                                    htmlFor="quote_basis"
                                    error={errors.quote_basis}
                                >
                                    <Input
                                        id="quote_basis"
                                        name="quote_basis"
                                        defaultValue={order?.quote_basis ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Delivery lead time"
                                    htmlFor="delivery"
                                    error={errors.delivery}
                                >
                                    <Input
                                        id="delivery"
                                        name="delivery"
                                        defaultValue={order?.delivery ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Bid validity"
                                    htmlFor="bid_validity"
                                    error={errors.bid_validity}
                                >
                                    <Input
                                        id="bid_validity"
                                        name="bid_validity"
                                        defaultValue={order?.bid_validity ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Payment terms"
                                    htmlFor="pay_terms"
                                    error={errors.pay_terms}
                                >
                                    <Input
                                        id="pay_terms"
                                        name="pay_terms"
                                        defaultValue={order?.pay_terms ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="AFE"
                                    htmlFor="afe"
                                    error={errors.afe}
                                >
                                    <Input
                                        id="afe"
                                        name="afe"
                                        defaultValue={order?.afe ?? ''}
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Freight"
                                    htmlFor="freightcharge"
                                    error={errors.freightcharge}
                                >
                                    <Input
                                        id="freightcharge"
                                        name="freightcharge"
                                        inputMode="decimal"
                                        defaultValue={
                                            order?.freightcharge ?? '0.00'
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Packing"
                                    htmlFor="packcost"
                                    error={errors.packcost}
                                >
                                    <Input
                                        id="packcost"
                                        name="packcost"
                                        inputMode="decimal"
                                        defaultValue={order?.packcost ?? '0.00'}
                                    />
                                </Field>

                                <Field
                                    label="Customs"
                                    htmlFor="custom"
                                    error={errors.custom}
                                >
                                    <Input
                                        id="custom"
                                        name="custom"
                                        inputMode="decimal"
                                        defaultValue={order?.custom ?? '0.00'}
                                    />
                                </Field>

                                <Field
                                    label="Miscellaneous label"
                                    htmlFor="miscellaneous"
                                    error={errors.miscellaneous}
                                >
                                    <Input
                                        id="miscellaneous"
                                        name="miscellaneous"
                                        defaultValue={
                                            order?.miscellaneous ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Miscellaneous value"
                                    htmlFor="miscvalue"
                                    error={errors.miscvalue}
                                >
                                    <Input
                                        id="miscvalue"
                                        name="miscvalue"
                                        inputMode="decimal"
                                        defaultValue={
                                            order?.miscvalue ?? '0.00'
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Discount amount"
                                    htmlFor="discount"
                                    error={errors.discount}
                                >
                                    <Input
                                        id="discount"
                                        name="discount"
                                        inputMode="decimal"
                                        defaultValue={order?.discount ?? '0.00'}
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4">
                                <Field
                                    label="Special instruction 1"
                                    htmlFor="sp_instruct1"
                                    error={errors.sp_instruct1}
                                >
                                    <Input
                                        id="sp_instruct1"
                                        name="sp_instruct1"
                                        defaultValue={order?.sp_instruct1 ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Special instruction 2"
                                    htmlFor="sp_instruct2"
                                    error={errors.sp_instruct2}
                                >
                                    <Input
                                        id="sp_instruct2"
                                        name="sp_instruct2"
                                        defaultValue={order?.sp_instruct2 ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Special instruction 3"
                                    htmlFor="sp_instruct3"
                                    error={errors.sp_instruct3}
                                >
                                    <Input
                                        id="sp_instruct3"
                                        name="sp_instruct3"
                                        defaultValue={order?.sp_instruct3 ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Remarks"
                                    htmlFor="remarks"
                                    error={errors.remarks}
                                >
                                    <Textarea
                                        id="remarks"
                                        name="remarks"
                                        rows={4}
                                        defaultValue={order?.remarks ?? ''}
                                    />
                                </Field>
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={order ? show(order.id) : index()}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {order
                                        ? 'Save changes'
                                        : 'Create sales order'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SalesOrderForm.layout = ({ order }: Props) => ({
    breadcrumbs: [
        { title: 'Sales orders', href: index() },
        ...(order
            ? [{ title: String(order.id), href: show(order.id) }]
            : [{ title: 'New', href: index() }]),
    ],
});
