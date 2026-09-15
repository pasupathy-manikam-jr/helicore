import { router } from '@inertiajs/react';
import { useState } from 'react';
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
import { create } from '@/routes/delivery-order';

type Props = {
    trigger: React.ReactNode;
};

/** A despatch always belongs to a sales order, so that is asked for first. */
export default function PickSalesOrderDialog({ trigger }: Props) {
    const [open, setOpen] = useState(false);
    const [salesOrder, setSalesOrder] = useState('');

    const go = () => {
        if (!/^\d+$/.test(salesOrder.trim())) {
            return;
        }

        router.get(create(Number(salesOrder.trim())));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New delivery order</DialogTitle>
                    <DialogDescription>
                        Which sales order is being despatched? The next screen
                        lists its lines and what is still outstanding.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2">
                    <Label htmlFor="sales-order">Sales order number</Label>
                    <Input
                        id="sales-order"
                        inputMode="numeric"
                        autoFocus
                        value={salesOrder}
                        onChange={(event) => setSalesOrder(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && go()}
                    />
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={go}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
