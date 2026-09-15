import { Form } from '@inertiajs/react';
import { useState } from 'react';
import SalesOrderLineController from '@/actions/App/Http/Controllers/SalesOrderLineController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import type { SalesOrderLine } from './types';

type Props = {
    salesOrderId: number;
    line?: SalesOrderLine;
    trigger: React.ReactNode;
};

const UNITS = ['Unit', 'Lot', 'Meter'];

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

export default function LineFormDialog({ salesOrderId, line, trigger }: Props) {
    const [open, setOpen] = useState(false);

    const action = line
        ? SalesOrderLineController.update.form([salesOrderId, line.id])
        : SalesOrderLineController.store.form(salesOrderId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {line ? `Edit item ${line.item}` : 'Add line item'}
                    </DialogTitle>
                    <DialogDescription>
                        SST is worked out from the order: it is charged only
                        when the order says so.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Field
                                    label="Product"
                                    htmlFor="product"
                                    error={errors.product}
                                >
                                    <Input
                                        id="product"
                                        name="product"
                                        defaultValue={line?.product ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Stock code"
                                    htmlFor="stock_code"
                                    error={errors.stock_code}
                                >
                                    <Input
                                        id="stock_code"
                                        name="stock_code"
                                        defaultValue={line?.stock_code ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Standard stock code"
                                    htmlFor="std_stockcode"
                                    error={errors.std_stockcode}
                                >
                                    <Input
                                        id="std_stockcode"
                                        name="std_stockcode"
                                        defaultValue={line?.std_stockcode ?? ''}
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Description"
                                htmlFor="description"
                                error={errors.description}
                            >
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    defaultValue={line?.description ?? ''}
                                />
                            </Field>

                            <div className="grid gap-4 sm:grid-cols-4">
                                <Field
                                    label="Quantity"
                                    htmlFor="quantity"
                                    error={errors.quantity}
                                >
                                    <Input
                                        id="quantity"
                                        name="quantity"
                                        inputMode="numeric"
                                        defaultValue={line?.quantity ?? 1}
                                    />
                                </Field>

                                <Field
                                    label="Unit"
                                    htmlFor="unit"
                                    error={errors.unit}
                                >
                                    <Select
                                        name="unit"
                                        defaultValue={line?.unit ?? 'Unit'}
                                    >
                                        <SelectTrigger id="unit">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UNITS.map((unit) => (
                                                <SelectItem
                                                    key={unit}
                                                    value={unit}
                                                >
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field
                                    label="Unit price"
                                    htmlFor="unit_price"
                                    error={errors.unit_price}
                                >
                                    <Input
                                        id="unit_price"
                                        name="unit_price"
                                        inputMode="decimal"
                                        defaultValue={
                                            line?.unit_price ?? '0.00'
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Weight (kg)"
                                    htmlFor="weight"
                                    error={errors.weight}
                                >
                                    <Input
                                        id="weight"
                                        name="weight"
                                        inputMode="decimal"
                                        defaultValue={line?.weight ?? 0}
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <Field
                                    label="Customer PO stock code"
                                    htmlFor="postock_code"
                                    error={errors.postock_code}
                                >
                                    <Input
                                        id="postock_code"
                                        name="postock_code"
                                        defaultValue={line?.postock_code ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Customer PO line"
                                    htmlFor="polineitem"
                                    error={errors.polineitem}
                                >
                                    <Input
                                        id="polineitem"
                                        name="polineitem"
                                        defaultValue={line?.polineitem ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Line date"
                                    htmlFor="linedate"
                                    error={errors.linedate}
                                >
                                    <Input
                                        id="linedate"
                                        name="linedate"
                                        type="date"
                                        defaultValue={line?.linedate ?? ''}
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <Field
                                    label="Batch"
                                    htmlFor="batch"
                                    error={errors.batch}
                                >
                                    <Input
                                        id="batch"
                                        name="batch"
                                        defaultValue={line?.batch ?? ''}
                                    />
                                </Field>

                                <Field
                                    label="Certification"
                                    htmlFor="type_of_certification"
                                    error={errors.type_of_certification}
                                >
                                    <Input
                                        id="type_of_certification"
                                        name="type_of_certification"
                                        defaultValue={
                                            line?.type_of_certification ?? ''
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Operator"
                                    htmlFor="operator"
                                    error={errors.operator}
                                >
                                    <Input
                                        id="operator"
                                        name="operator"
                                        defaultValue={line?.operator ?? ''}
                                    />
                                </Field>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {line ? 'Save changes' : 'Add line'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
