import { Form } from '@inertiajs/react';
import { useState } from 'react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
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
import type { Client, Salesperson } from './types';

type Props = {
    salespeople: Salesperson[];
    client?: Client;
    trigger: React.ReactNode;
};

export default function ClientFormDialog({
    salespeople,
    client,
    trigger,
}: Props) {
    const [open, setOpen] = useState(false);

    const action = client
        ? ClientController.update.form(client.id)
        : ClientController.store.form();

    // Legacy rows keep a username here, which no longer matches an option.
    const salesperson = salespeople.find(
        (person) => String(person.id) === client?.user_email,
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {client ? 'Edit client' : 'New client'}
                    </DialogTitle>
                    <DialogDescription>
                        Company details used on quotations, orders and invoices.
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
                                <Label htmlFor="cname">Name</Label>
                                <Input
                                    id="cname"
                                    name="cname"
                                    defaultValue={client?.cname ?? ''}
                                />
                                <InputError message={errors.cname} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="regno">
                                        Registration no.
                                    </Label>
                                    <Input
                                        id="regno"
                                        name="regno"
                                        defaultValue={client?.regno ?? ''}
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
                                        defaultValue={client?.gst_regno ?? ''}
                                    />
                                    <InputError message={errors.gst_regno} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    defaultValue={client?.address ?? ''}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        defaultValue={client?.city ?? ''}
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        defaultValue={client?.state ?? ''}
                                    />
                                    <InputError message={errors.state} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        defaultValue={client?.country ?? ''}
                                    />
                                    <InputError message={errors.country} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={client?.phone ?? ''}
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="fax">Fax</Label>
                                    <Input
                                        id="fax"
                                        name="fax"
                                        defaultValue={client?.fax ?? ''}
                                    />
                                    <InputError message={errors.fax} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="attn">Attention</Label>
                                    <Input
                                        id="attn"
                                        name="attn"
                                        defaultValue={client?.attn ?? ''}
                                    />
                                    <InputError message={errors.attn} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="client_email">
                                        Client email
                                    </Label>
                                    <Input
                                        id="client_email"
                                        name="client_email"
                                        type="text"
                                        inputMode="email"
                                        defaultValue={
                                            client?.client_email ?? ''
                                        }
                                    />
                                    <InputError message={errors.client_email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="payment_terms">
                                        Payment terms
                                    </Label>
                                    <Input
                                        id="payment_terms"
                                        name="payment_terms"
                                        defaultValue={
                                            client?.payment_terms ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.payment_terms}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="user_email">
                                        Salesperson
                                    </Label>
                                    <Select
                                        name="user_email"
                                        defaultValue={
                                            salesperson
                                                ? String(salesperson.id)
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger id="user_email">
                                            <SelectValue placeholder="Select a salesperson" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salespeople.map((person) => (
                                                <SelectItem
                                                    key={person.id}
                                                    value={String(person.id)}
                                                >
                                                    {person.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.user_email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="cstatus">
                                        Company type
                                    </Label>
                                    <Select
                                        name="cstatus"
                                        defaultValue={
                                            client?.cstatus === 'PLC' ||
                                            client?.cstatus === 'NON-PLC'
                                                ? client.cstatus
                                                : undefined
                                        }
                                    >
                                        <SelectTrigger id="cstatus">
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLC">
                                                PLC
                                            </SelectItem>
                                            <SelectItem value="NON-PLC">
                                                NON-PLC
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.cstatus} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        name="status"
                                        defaultValue={
                                            client?.status === 'Obsolete'
                                                ? 'Obsolete'
                                                : 'Active'
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="Obsolete">
                                                Obsolete
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
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
                                    {client ? 'Save changes' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
