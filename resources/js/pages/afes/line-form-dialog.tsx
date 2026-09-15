import { Form } from '@inertiajs/react';
import { useState } from 'react';
import AfeLineController from '@/actions/App/Http/Controllers/AfeLineController';
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
import { Textarea } from '@/components/ui/textarea';
import type { AfeLine } from './types';

type Props = {
    afeId: number;
    line?: AfeLine;
    trigger: React.ReactNode;
};

export default function LineFormDialog({ afeId, line, trigger }: Props) {
    const [open, setOpen] = useState(false);

    const action = line
        ? AfeLineController.update.form([afeId, line.id])
        : AfeLineController.store.form(afeId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {line ? `Edit item ${line.item}` : 'Add line item'}
                    </DialogTitle>
                    <DialogDescription>
                        The line total and its MYR equivalent are worked out
                        from the quantity, the unit value and the AFE currency.
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
                                    <Input
                                        id="product"
                                        name="product"
                                        defaultValue={line?.product ?? ''}
                                    />
                                    <InputError message={errors.product} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="stock_code">
                                        Stock code
                                    </Label>
                                    <Input
                                        id="stock_code"
                                        name="stock_code"
                                        defaultValue={line?.stock_code ?? ''}
                                    />
                                    <InputError message={errors.stock_code} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    defaultValue={line?.description ?? ''}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
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
                                    <Label htmlFor="unitvalue">
                                        Unit value
                                    </Label>
                                    <Input
                                        id="unitvalue"
                                        name="unitvalue"
                                        inputMode="decimal"
                                        defaultValue={line?.unitvalue ?? '0.00'}
                                    />
                                    <InputError message={errors.unitvalue} />
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
