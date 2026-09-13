import { Form } from '@inertiajs/react';
import { useState } from 'react';
import QuotationLineController from '@/actions/App/Http/Controllers/QuotationLineController';
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
import type { QuotationLine } from './types';

type Props = {
    quotationId: number;
    line?: QuotationLine;
    trigger: React.ReactNode;
};

/** The product lines the legacy line-item screen offers. */
const PRODUCTS = [
    { value: 'rtj', label: 'RTJ gaskets' },
    { value: 'spw', label: 'Spiral wound gasket' },
    { value: 'scg', label: 'Flat ring gasket' },
    { value: 'ins', label: 'Insulation gasket set' },
    { value: 'djg', label: 'Double jacketed gasket' },
    { value: 'cam', label: 'Cam profile' },
    { value: 'kz', label: 'Kroll & Ziller' },
    { value: 'sheets', label: 'Sheets' },
    { value: 'nstd', label: 'Non standard' },
];

const UNITS = ['Unit', 'Lot', 'Meter'];

export default function LineFormDialog({ quotationId, line, trigger }: Props) {
    const [open, setOpen] = useState(false);

    const action = line
        ? QuotationLineController.update.form([quotationId, line.id])
        : QuotationLineController.store.form(quotationId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {line ? `Edit item ${line.item}` : 'Add line item'}
                    </DialogTitle>
                    <DialogDescription>
                        The unit price is worked out from the cost: shipping,
                        then mark up, then import duty.
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
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="product">Product</Label>
                                    <Select
                                        name="product"
                                        defaultValue={
                                            line?.product ?? undefined
                                        }
                                    >
                                        <SelectTrigger id="product">
                                            <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRODUCTS.map((product) => (
                                                <SelectItem
                                                    key={product.value}
                                                    value={product.value}
                                                >
                                                    {product.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.product} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unit</Label>
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
                                    <InputError message={errors.unit} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    defaultValue={line?.description ?? ''}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="stockcode">
                                        Stock code
                                    </Label>
                                    <Input
                                        id="stockcode"
                                        name="stockcode"
                                        defaultValue={line?.stockcode ?? ''}
                                    />
                                    <InputError message={errors.stockcode} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="std_stockcode">
                                        Standard stock code
                                    </Label>
                                    <Input
                                        id="std_stockcode"
                                        name="std_stockcode"
                                        defaultValue={line?.std_stockcode ?? ''}
                                    />
                                    <InputError
                                        message={errors.std_stockcode}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pomaterialcode">
                                        PO material code
                                    </Label>
                                    <Input
                                        id="pomaterialcode"
                                        name="pomaterialcode"
                                        defaultValue={
                                            line?.pomaterialcode ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.pomaterialcode}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="qty">Quantity</Label>
                                    <Input
                                        id="qty"
                                        name="qty"
                                        inputMode="numeric"
                                        defaultValue={line?.qty ?? 1}
                                    />
                                    <InputError message={errors.qty} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        name="weight"
                                        inputMode="decimal"
                                        defaultValue={line?.weight ?? 0}
                                    />
                                    <InputError message={errors.weight} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="cost_price">
                                        Cost price
                                    </Label>
                                    <Input
                                        id="cost_price"
                                        name="cost_price"
                                        inputMode="decimal"
                                        defaultValue={
                                            line?.cost_price ?? '0.00'
                                        }
                                    />
                                    <InputError message={errors.cost_price} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="shipping_cost">
                                        Shipping %
                                    </Label>
                                    <Input
                                        id="shipping_cost"
                                        name="shipping_cost"
                                        inputMode="decimal"
                                        defaultValue={line?.shipping_cost ?? 0}
                                    />
                                    <InputError
                                        message={errors.shipping_cost}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mark_up">Mark up %</Label>
                                    <Input
                                        id="mark_up"
                                        name="mark_up"
                                        inputMode="decimal"
                                        defaultValue={line?.mark_up ?? 0}
                                    />
                                    <InputError message={errors.mark_up} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="import_duty">
                                        Import duty %
                                    </Label>
                                    <Input
                                        id="import_duty"
                                        name="import_duty"
                                        inputMode="decimal"
                                        defaultValue={line?.import_duty ?? 0}
                                    />
                                    <InputError message={errors.import_duty} />
                                </div>
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
