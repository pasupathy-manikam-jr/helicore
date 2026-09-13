import { Form, Head, Link, usePage } from '@inertiajs/react';
import QuotationController from '@/actions/App/Http/Controllers/QuotationController';
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
import { index, show } from '@/routes/quotation';
import { ArrowLeft } from 'lucide-react';
import type { QuotationFormValues, ReferenceOption } from './types';

type Props = {
    quotation: QuotationFormValues | null;
    clients: { id: number; cname: string | null }[];
    currencies: ReferenceOption[];
    terms: ReferenceOption[];
    salespeople: ReferenceOption[];
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

export default function QuotationForm({
    quotation,
    clients,
    currencies,
    terms,
    salespeople,
}: Props) {
    const { auth } = usePage().props;

    const action = quotation
        ? QuotationController.update.form(quotation.id)
        : QuotationController.store.form();

    return (
        <>
            <Head
                title={
                    quotation
                        ? `Edit quotation ${quotation.id}`
                        : 'New quotation'
                }
            />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={
                            quotation
                                ? `Edit quotation ${quotation.id}`
                                : 'New quotation'
                        }
                        description="Header details. Line items are added from the quotation once it exists."
                    />

                    <Button variant="outline" asChild>
                        <Link href={quotation ? show(quotation.id) : index()}>
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
                            <input
                                type="hidden"
                                name="user_email"
                                value={quotation?.user_email ?? auth.user.id}
                            />

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Client"
                                    htmlFor="company_details_id"
                                    error={errors.company_details_id}
                                >
                                    {/* Thousands of clients, so this is an id
                                        box backed by a datalist of names. */}
                                    <Input
                                        id="company_details_id"
                                        name="company_details_id"
                                        list="quotation-clients"
                                        defaultValue={
                                            quotation?.company_details_id ?? ''
                                        }
                                    />
                                    <datalist id="quotation-clients">
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
                                    label="Attention"
                                    htmlFor="attnto"
                                    error={errors.attnto}
                                >
                                    <Input
                                        id="attnto"
                                        name="attnto"
                                        defaultValue={quotation?.attnto ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Client email"
                                    htmlFor="clientemail"
                                    error={errors.clientemail}
                                >
                                    <Input
                                        id="clientemail"
                                        name="clientemail"
                                        inputMode="email"
                                        defaultValue={
                                            quotation?.clientemail ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Buyer"
                                    htmlFor="client_buyer_name"
                                    error={errors.client_buyer_name}
                                >
                                    <Input
                                        id="client_buyer_name"
                                        name="client_buyer_name"
                                        defaultValue={
                                            quotation?.client_buyer_name ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Your ref."
                                    htmlFor="your_ref"
                                    error={errors.your_ref}
                                >
                                    <Input
                                        id="your_ref"
                                        name="your_ref"
                                        defaultValue={quotation?.your_ref ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="RFQ"
                                    htmlFor="rfq"
                                    error={errors.rfq}
                                >
                                    <Input
                                        id="rfq"
                                        name="rfq"
                                        defaultValue={quotation?.rfq ?? ''}
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Issued by"
                                    htmlFor="issuermail"
                                    error={errors.issuermail}
                                >
                                    <Select
                                        name="issuermail"
                                        defaultValue={
                                            quotation?.issuermail
                                                ? String(quotation.issuermail)
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger id="issuermail">
                                            <SelectValue placeholder="Select a salesperson" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salespeople.map((person) => (
                                                <SelectItem
                                                    key={person.id}
                                                    value={String(person.id)}
                                                >
                                                    {person.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Currency"
                                    htmlFor="currency"
                                    error={errors.currency}
                                >
                                    <Select
                                        name="currency"
                                        defaultValue={
                                            quotation?.currency
                                                ? String(quotation.currency)
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
                                    label="Terms & conditions"
                                    htmlFor="tnc"
                                    error={errors.tnc}
                                >
                                    <Select
                                        name="tnc"
                                        defaultValue={
                                            quotation?.tnc
                                                ? String(quotation.tnc)
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger id="tnc">
                                            <SelectValue placeholder="Select terms" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {terms.map((term) => (
                                                <SelectItem
                                                    key={term.id}
                                                    value={String(term.id)}
                                                >
                                                    {term.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Revision"
                                    htmlFor="revno"
                                    error={errors.revno}
                                >
                                    <Input
                                        id="revno"
                                        name="revno"
                                        inputMode="numeric"
                                        defaultValue={quotation?.revno ?? 0}
                                    />
                                </Field>

                                <Field label="SST" error={errors.sst}>
                                    <Select
                                        name="sst"
                                        defaultValue={String(
                                            quotation?.sst ?? 0,
                                        )}
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

                                <Field
                                    label="Tender closes"
                                    htmlFor="tender_close_date"
                                    error={errors.tender_close_date}
                                >
                                    <Input
                                        id="tender_close_date"
                                        name="tender_close_date"
                                        type="date"
                                        defaultValue={
                                            quotation?.tender_close_date ?? ''
                                        }
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                                <Field
                                    label="Delivery terms"
                                    htmlFor="quote_basis"
                                    error={errors.quote_basis}
                                >
                                    <Input
                                        id="quote_basis"
                                        name="quote_basis"
                                        defaultValue={
                                            quotation?.quote_basis ?? ''
                                        }
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
                                        defaultValue={quotation?.delivery ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Bid validity"
                                    htmlFor="bid_valid"
                                    error={errors.bid_valid}
                                >
                                    <Input
                                        id="bid_valid"
                                        name="bid_valid"
                                        placeholder="30 Days"
                                        defaultValue={
                                            quotation?.bid_valid ?? ''
                                        }
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
                                        defaultValue={
                                            quotation?.pay_terms ?? ''
                                        }
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Packing"
                                    htmlFor="packcost"
                                    error={errors.packcost}
                                >
                                    <Input
                                        id="packcost"
                                        name="packcost"
                                        inputMode="decimal"
                                        defaultValue={
                                            quotation?.packcost ?? '0.00'
                                        }
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
                                        defaultValue={
                                            quotation?.custom ?? '0.00'
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Freight"
                                    htmlFor="freight"
                                    error={errors.freight}
                                >
                                    <Input
                                        id="freight"
                                        name="freight"
                                        inputMode="decimal"
                                        defaultValue={
                                            quotation?.freight ?? '0.00'
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Miscellaneous label"
                                    htmlFor="misc"
                                    error={errors.misc}
                                >
                                    <Input
                                        id="misc"
                                        name="misc"
                                        defaultValue={quotation?.misc ?? ''}
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
                                            quotation?.miscvalue ?? '0.00'
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Discount %"
                                    htmlFor="discount"
                                    error={errors.discount}
                                >
                                    <Input
                                        id="discount"
                                        name="discount"
                                        inputMode="decimal"
                                        defaultValue={
                                            quotation?.discount ?? '0.00'
                                        }
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4">
                                <Field
                                    label="Attachments"
                                    htmlFor="attachments"
                                    error={
                                        errors.attachments ??
                                        errors['attachments.0']
                                    }
                                >
                                    <Input
                                        id="attachments"
                                        name="attachments[]"
                                        type="file"
                                        multiple
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        {quotation?.attachments.length
                                            ? `${quotation.attachments.length} already attached; new files are added to them.`
                                            : 'PDF, image, Word or Excel, up to 10 MB each.'}
                                    </p>
                                </Field>
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={
                                            quotation
                                                ? show(quotation.id)
                                                : index()
                                        }
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {quotation
                                        ? 'Save changes'
                                        : 'Create quotation'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

QuotationForm.layout = ({ quotation }: Props) => ({
    breadcrumbs: [
        { title: 'Quotations', href: index() },
        ...(quotation
            ? [
                  {
                      title: String(quotation.id),
                      href: show(quotation.id),
                  },
              ]
            : []),
    ],
});
