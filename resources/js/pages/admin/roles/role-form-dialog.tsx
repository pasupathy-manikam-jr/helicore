import { Form } from '@inertiajs/react';
import { useState } from 'react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
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
import { MatChip } from '@/components/mat-chip';
import type { AdminRole, PermissionModules } from './types';

type Props = {
    modules: PermissionModules;
    role?: AdminRole;
    trigger: React.ReactNode;
};

export default function RoleFormDialog({ modules, role, trigger }: Props) {
    const [open, setOpen] = useState(false);

    const action = role
        ? RoleController.update.form(role.id)
        : RoleController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {role ? `Edit ${role.name}` : 'New role'}
                    </DialogTitle>
                    <DialogDescription>
                        Everyone holding this role gains exactly the permissions
                        ticked here.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid max-w-sm gap-2">
                                <Label htmlFor="name">Role name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={role?.name ?? ''}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-4">
                                <Label>Permissions</Label>

                                {Object.entries(modules).map(
                                    ([module, permissions]) => (
                                        <div
                                            key={module}
                                            className="rounded-md border p-3"
                                        >
                                            <MatChip group={module}>
                                                {module}
                                            </MatChip>

                                            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                {permissions.map(
                                                    (permission) => (
                                                        <label
                                                            key={permission}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <Checkbox
                                                                name="permissions[]"
                                                                value={
                                                                    permission
                                                                }
                                                                defaultChecked={role?.permissions.includes(
                                                                    permission,
                                                                )}
                                                            />
                                                            <span>
                                                                {permission}
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}

                                <InputError message={errors.permissions} />
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
                                    {role ? 'Save changes' : 'Create role'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
