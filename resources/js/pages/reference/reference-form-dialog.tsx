import { Form } from '@inertiajs/react';
import { useState } from 'react';
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
import type { ReferenceField, ReferenceMeta, ReferenceRow } from './types';

type Props = {
    resource: ReferenceMeta;
    fields: ReferenceField[];
    row?: ReferenceRow;
    trigger: React.ReactNode;
};

export default function ReferenceFormDialog({
    resource,
    fields,
    row,
    trigger,
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {row
                            ? `Edit ${resource.singular.toLowerCase()}`
                            : `New ${resource.singular.toLowerCase()}`}
                    </DialogTitle>
                    <DialogDescription>
                        {resource.description}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    action={
                        row
                            ? `${resource.basePath}/${row.id}`
                            : resource.basePath
                    }
                    method={row ? 'put' : 'post'}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {fields.map((field) => (
                                <div key={field.name} className="grid gap-2">
                                    <Label htmlFor={field.name}>
                                        {field.label}
                                    </Label>

                                    {field.type === 'textarea' ? (
                                        <Textarea
                                            id={field.name}
                                            name={field.name}
                                            rows={6}
                                            defaultValue={
                                                (row?.[field.name] as string) ??
                                                ''
                                            }
                                        />
                                    ) : (
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            inputMode={
                                                field.type === 'number'
                                                    ? 'decimal'
                                                    : undefined
                                            }
                                            defaultValue={
                                                (row?.[field.name] as string) ??
                                                ''
                                            }
                                        />
                                    )}

                                    {field.help && (
                                        <p className="text-muted-foreground text-xs">
                                            {field.help}
                                        </p>
                                    )}

                                    <InputError message={errors[field.name]} />
                                </div>
                            ))}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {row ? 'Save changes' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
