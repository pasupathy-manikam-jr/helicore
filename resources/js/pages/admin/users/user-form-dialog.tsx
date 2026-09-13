import { Form } from '@inertiajs/react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
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
import type { AdminUser } from './types';

type Props = {
    roles: string[];
    user?: AdminUser;
    /** Editing yourself: roles are read-only, to stop self-escalation. */
    isSelf?: boolean;
    trigger: React.ReactNode;
};

export default function UserFormDialog({
    roles,
    user,
    isSelf = false,
    trigger,
}: Props) {
    const [open, setOpen] = useState(false);

    const action = user
        ? UserController.update.form(user.id)
        : UserController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit user' : 'New user'}</DialogTitle>
                    <DialogDescription>
                        {user
                            ? 'Leave the password blank to keep the current one.'
                            : 'The password must be set now; the user can change it once signed in.'}
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
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={user?.name ?? ''}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="text"
                                        inputMode="email"
                                        autoComplete="off"
                                        defaultValue={user?.email ?? ''}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="department">
                                        Department
                                    </Label>
                                    <Input
                                        id="department"
                                        name="department"
                                        defaultValue={user?.department ?? ''}
                                    />
                                    <InputError message={errors.department} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        name="position"
                                        defaultValue={user?.position ?? ''}
                                    />
                                    <InputError message={errors.position} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mobile_phone">Mobile</Label>
                                    <Input
                                        id="mobile_phone"
                                        name="mobile_phone"
                                        defaultValue={user?.mobile_phone ?? ''}
                                    />
                                    <InputError message={errors.mobile_phone} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Roles</Label>

                                {isSelf ? (
                                    <p className="text-muted-foreground rounded-md border p-3 text-sm">
                                        Your own roles are{' '}
                                        {user?.roles.join(', ') || 'not set'}.
                                        Another administrator has to change
                                        them.
                                    </p>
                                ) : (
                                    <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                                        {roles.map((role) => (
                                            <label
                                                key={role}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    name="roles[]"
                                                    value={role}
                                                    defaultChecked={user?.roles.includes(
                                                        role,
                                                    )}
                                                />
                                                <span>{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <InputError message={errors.roles} />
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
                                    {user ? 'Save changes' : 'Create user'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
