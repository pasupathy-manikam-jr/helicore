import { Form } from '@inertiajs/react';
import { useState } from 'react';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { Manager, Supplier, SupplierCategory } from './types';

type Props = {
    categories: SupplierCategory[];
    managers: Manager[];
    supplier?: Supplier;
    trigger: React.ReactNode;
};

export default function SupplierFormDialog({
    categories,
    managers,
    supplier,
    trigger,
}: Props) {
    const [open, setOpen] = useState(false);

    const action = supplier
        ? SupplierController.update.form(supplier.id)
        : SupplierController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {supplier ? 'Edit supplier' : 'New supplier'}
                    </DialogTitle>
                    <DialogDescription>
                        Supplier details and the categories they are approved to
                        supply.
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
                            <div className="grid gap-2">
                                <Label htmlFor="supplier_name">Name</Label>
                                <Input
                                    id="supplier_name"
                                    name="supplier_name"
                                    defaultValue={supplier?.supplier_name ?? ''}
                                />
                                <InputError message={errors.supplier_name} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="regno">
                                        Registration no.
                                    </Label>
                                    <Input
                                        id="regno"
                                        name="regno"
                                        defaultValue={supplier?.regno ?? ''}
                                    />
                                    <InputError message={errors.regno} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="gst_regno">
                                        GST / SST no.
                                    </Label>
                                    <Input
                                        id="gst_regno"
                                        name="gst_regno"
                                        defaultValue={supplier?.gst_regno ?? ''}
                                    />
                                    <InputError message={errors.gst_regno} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    defaultValue={supplier?.address ?? ''}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="contactperson">
                                        Contact person
                                    </Label>
                                    <Input
                                        id="contactperson"
                                        name="contactperson"
                                        defaultValue={
                                            supplier?.contactperson ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.contactperson}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact">Contact no.</Label>
                                    <Input
                                        id="contact"
                                        name="contact"
                                        defaultValue={supplier?.contact ?? ''}
                                    />
                                    <InputError message={errors.contact} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="approver">Approver</Label>
                                    <Select
                                        name="approver"
                                        defaultValue={
                                            supplier?.approver
                                                ? String(supplier.approver)
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger id="approver">
                                            <SelectValue placeholder="Select a manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map((manager) => (
                                                <SelectItem
                                                    key={manager.id}
                                                    value={String(manager.id)}
                                                >
                                                    {manager.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.approver} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="approval">
                                        Approval reference
                                    </Label>
                                    <Input
                                        id="approval"
                                        name="approval"
                                        defaultValue={supplier?.approval ?? ''}
                                    />
                                    <InputError message={errors.approval} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Categories</Label>
                                <div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Checkbox
                                                name="supplier_category_id[]"
                                                value={String(category.id)}
                                                defaultChecked={supplier?.supplier_category_id.includes(
                                                    category.id,
                                                )}
                                            />
                                            <span>
                                                {category.subcategory}
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    · {category.category}
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <InputError
                                    message={errors.supplier_category_id}
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
                                <Button type="submit" disabled={processing}>
                                    {supplier ? 'Save changes' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
