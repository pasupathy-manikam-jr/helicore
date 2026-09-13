import { Form } from '@inertiajs/react';
import { useState } from 'react';
import StockCodeController from '@/actions/App/Http/Controllers/StockCodeController';
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
import type { StockItem } from './types';

type Props = {
    product: string;
    item: StockItem;
    trigger: React.ReactNode;
};

export default function StockItemFormDialog({ product, item, trigger }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{item.stock_code}</DialogTitle>
                    <DialogDescription>
                        Description, weight and price. Stock levels come from
                        stock and delivery orders.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...StockCodeController.update.form([product, item.id])}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    defaultValue={item.description ?? ''}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        name="weight"
                                        type="text"
                                        inputMode="decimal"
                                        defaultValue={item.weight ?? '0.00'}
                                    />
                                    <InputError message={errors.weight} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="text"
                                        inputMode="decimal"
                                        defaultValue={item.price ?? '0.00'}
                                    />
                                    <InputError message={errors.price} />
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
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
