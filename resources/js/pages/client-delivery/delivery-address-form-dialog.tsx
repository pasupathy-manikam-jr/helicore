import { Form } from '@inertiajs/react';
import { useState } from 'react';
import DeliveryAddressController from '@/actions/App/Http/Controllers/DeliveryAddressController';
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
import type { ClientOption, DeliveryAddress } from './types';

type Props = {
    clients: ClientOption[];
    address?: DeliveryAddress;
    trigger: React.ReactNode;
};

export default function DeliveryAddressFormDialog({
    clients,
    address,
    trigger,
}: Props) {
    const [open, setOpen] = useState(false);

    const action = address
        ? DeliveryAddressController.update.form(address.id)
        : DeliveryAddressController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {address
                            ? 'Edit delivery address'
                            : 'New delivery address'}
                    </DialogTitle>
                    <DialogDescription>
                        Where goods are shipped for a client. Sales orders pick
                        from these.
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
                                <Label htmlFor="company_detail_id">
                                    Client
                                </Label>
                                {/* Thousands of clients, so a native list-backed
                                    input beats a scrolling select. */}
                                <Input
                                    id="company_detail_id"
                                    name="company_detail_id"
                                    list="client-options"
                                    defaultValue={
                                        address?.company_detail_id ?? ''
                                    }
                                />
                                <datalist id="client-options">
                                    {clients.map((client) => (
                                        <option
                                            key={client.id}
                                            value={client.id}
                                            label={client.cname ?? ''}
                                        />
                                    ))}
                                </datalist>
                                <InputError
                                    message={errors.company_detail_id}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="customer_name">
                                        Customer name
                                    </Label>
                                    <Input
                                        id="customer_name"
                                        name="customer_name"
                                        defaultValue={
                                            address?.customer_name ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.customer_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="text"
                                        inputMode="email"
                                        defaultValue={address?.email ?? ''}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    defaultValue={address?.address ?? ''}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        defaultValue={address?.city ?? ''}
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        defaultValue={address?.state ?? ''}
                                    />
                                    <InputError message={errors.state} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        defaultValue={address?.country ?? ''}
                                    />
                                    <InputError message={errors.country} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="telephone">Telephone</Label>
                                    <Input
                                        id="telephone"
                                        name="telephone"
                                        defaultValue={address?.telephone ?? ''}
                                    />
                                    <InputError message={errors.telephone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="fax">Fax</Label>
                                    <Input
                                        id="fax"
                                        name="fax"
                                        defaultValue={address?.fax ?? ''}
                                    />
                                    <InputError message={errors.fax} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="location_type">
                                        Location type
                                    </Label>
                                    {/* Legacy free text: CL for local, CINTL
                                        for international, with variants. */}
                                    <Input
                                        id="location_type"
                                        name="location_type"
                                        list="location-type-options"
                                        defaultValue={
                                            address?.location_type ?? ''
                                        }
                                    />
                                    <datalist id="location-type-options">
                                        <option value="CL" />
                                        <option value="CINTL" />
                                    </datalist>
                                    <InputError
                                        message={errors.location_type}
                                    />
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
                                    {address ? 'Save changes' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
