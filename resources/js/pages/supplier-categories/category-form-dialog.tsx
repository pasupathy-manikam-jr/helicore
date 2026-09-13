import { Form } from '@inertiajs/react';
import { useState } from 'react';
import SupplierCategoryController from '@/actions/App/Http/Controllers/SupplierCategoryController';
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
import type { Category } from './types';

type Props = {
    category?: Category;
    /** Existing top-level categories, offered as datalist suggestions. */
    groups: string[];
    trigger: React.ReactNode;
};

export default function CategoryFormDialog({
    category,
    groups,
    trigger,
}: Props) {
    const [open, setOpen] = useState(false);

    const action = category
        ? SupplierCategoryController.update.form(category.id)
        : SupplierCategoryController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Edit category' : 'New category'}
                    </DialogTitle>
                    <DialogDescription>
                        Subcategories are what suppliers are tagged with, and
                        each one must be unique.
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
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    list="supplier-category-groups"
                                    defaultValue={category?.category ?? ''}
                                />
                                <datalist id="supplier-category-groups">
                                    {groups.map((group) => (
                                        <option key={group} value={group} />
                                    ))}
                                </datalist>
                                <InputError message={errors.category} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subcategory">Subcategory</Label>
                                <Input
                                    id="subcategory"
                                    name="subcategory"
                                    defaultValue={category?.subcategory ?? ''}
                                />
                                <InputError message={errors.subcategory} />
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
                                    {category ? 'Save changes' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
