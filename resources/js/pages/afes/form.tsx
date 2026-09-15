import { Form, Head, Link } from '@inertiajs/react';
import AfeController from '@/actions/App/Http/Controllers/AfeController';
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
import { index, show } from '@/routes/afe';
import { ArrowLeft } from 'lucide-react';
import type { AfeFormValues } from './types';

type Props = {
    afe: AfeFormValues | null;
    suppliers: { id: number; supplier_name: string | null }[];
    categories: {
        id: number;
        category: string | null;
        subcategory: string | null;
    }[];
    currencies: { id: number; name: string | null }[];
};

/** The purchase order types the legacy screen offers. */
const PO_TYPES = ['LPO', 'IPO'];

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

export default function AfeForm({
    afe,
    suppliers,
    categories,
    currencies,
}: Props) {
    const action = afe
        ? AfeController.update.form(afe.id)
        : AfeController.store.form();

    return (
        <>
            <Head title={afe ? `Edit AFE ${afe.id}` : 'New AFE'} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={afe ? `Edit AFE ${afe.id}` : 'New AFE'}
                        description="What is being bought, from whom, and who raised it. Line items are added once the AFE exists."
                    />

                    <Button variant="outline" asChild>
                        <Link href={afe ? show(afe.id) : index()}>
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
                                    label="PO type"
                                    htmlFor="potype"
                                    error={errors.potype}
                                >
                                    <Select
                                        name="potype"
                                        defaultValue={afe?.potype ?? undefined}
                                    >
                                        <SelectTrigger id="potype">
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PO_TYPES.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Supplier"
                                    htmlFor="supplier_id"
                                    error={errors.supplier_id}
                                >
                                    <Input
                                        id="supplier_id"
                                        name="supplier_id"
                                        list="afe-suppliers"
                                        defaultValue={afe?.supplier_id ?? ''}
                                    />
                                    <datalist id="afe-suppliers">
                                        {suppliers.map((supplier) => (
                                            <option
                                                key={supplier.id}
                                                value={supplier.id}
                                                label={
                                                    supplier.supplier_name ?? ''
                                                }
                                            />
                                        ))}
                                    </datalist>
                                </Field>

                                <Field
                                    label="Category"
                                    htmlFor="supplier_category_id"
                                    error={errors.supplier_category_id}
                                >
                                    <Select
                                        name="supplier_category_id"
                                        defaultValue={
                                            afe?.supplier_category_id ??
                                            undefined
                                        }
                                    >
                                        <SelectTrigger id="supplier_category_id">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.subcategory} ·{' '}
                                                    {category.category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Supplier quote no."
                                    htmlFor="suppquoteno"
                                    error={errors.suppquoteno}
                                >
                                    <Input
                                        id="suppquoteno"
                                        name="suppquoteno"
                                        defaultValue={afe?.suppquoteno ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Currency"
                                    htmlFor="currency_id"
                                    error={errors.currency_id}
                                >
                                    <Select
                                        name="currency_id"
                                        defaultValue={
                                            afe?.currency_id
                                                ? String(afe.currency_id)
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger id="currency_id">
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
                                    label="Originator"
                                    htmlFor="originator"
                                    error={errors.originator}
                                >
                                    <Input
                                        id="originator"
                                        name="originator"
                                        defaultValue={afe?.originator ?? ''}
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Sales order"
                                    htmlFor="salesorder"
                                    error={errors.salesorder}
                                >
                                    <Input
                                        id="salesorder"
                                        name="salesorder"
                                        defaultValue={afe?.salesorder ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Buying from"
                                    htmlFor="buyingfrom"
                                    error={errors.buyingfrom}
                                >
                                    <Input
                                        id="buyingfrom"
                                        name="buyingfrom"
                                        defaultValue={afe?.buyingfrom ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="ETA"
                                    htmlFor="eta"
                                    error={errors.eta}
                                >
                                    <Input
                                        id="eta"
                                        name="eta"
                                        defaultValue={afe?.eta ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Payment terms"
                                    htmlFor="payment_terms"
                                    error={errors.payment_terms}
                                >
                                    <Input
                                        id="payment_terms"
                                        name="payment_terms"
                                        defaultValue={afe?.payment_terms ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Terms"
                                    htmlFor="terms"
                                    error={errors.terms}
                                >
                                    <Input
                                        id="terms"
                                        name="terms"
                                        defaultValue={afe?.terms ?? ''}
                                    />
                                </Field>
                            </section>

                            <section className="grid gap-4 rounded-xl border p-4">
                                <Field
                                    label="Comments"
                                    htmlFor="comments"
                                    error={errors.comments}
                                >
                                    <Textarea
                                        id="comments"
                                        name="comments"
                                        rows={4}
                                        defaultValue={afe?.comments ?? ''}
                                    />
                                </Field>

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
                                        {afe?.attachments.length
                                            ? `${afe.attachments.length} already attached; new files are added to them.`
                                            : 'PDF, image, Word or Excel, up to 10 MB each.'}
                                    </p>
                                </Field>
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={afe ? show(afe.id) : index()}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {afe ? 'Save changes' : 'Create AFE'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AfeForm.layout = ({ afe }: Props) => ({
    breadcrumbs: [
        { title: 'AFEs', href: index() },
        ...(afe ? [{ title: String(afe.id), href: show(afe.id) }] : []),
    ],
});
