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

type Props = {
    salesOrderId: number;
    trigger: React.ReactNode;
};

export default function CopyQuotationDialog({ salesOrderId, trigger }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Copy lines from a quotation</DialogTitle>
                    <DialogDescription>
                        Every line on the quotation is added to this order,
                        numbered on from what is already here. Prices are
                        recalculated against this order&apos;s currency and SST.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...SalesOrderLineController.copy.form(salesOrderId)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="quotation_id">
                                    Quotation number
                                </Label>
                                <Input
                                    id="quotation_id"
                                    name="quotation_id"
                                    inputMode="numeric"
                                    autoFocus
                                />
                                <InputError message={errors.quotation_id} />
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
                                    Copy lines
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
