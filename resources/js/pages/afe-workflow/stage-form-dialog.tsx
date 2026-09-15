import { Form } from '@inertiajs/react';
import { useState } from 'react';
import AfeApprovalFlowController from '@/actions/App/Http/Controllers/AfeApprovalFlowController';
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
import type { ApprovalStage, Manager } from './types';

type Props = {
    managers: Manager[];
    stage?: ApprovalStage;
    trigger: React.ReactNode;
};

const NOBODY = '0';

export default function StageFormDialog({ managers, stage, trigger }: Props) {
    const [open, setOpen] = useState(false);

    const action = stage
        ? AfeApprovalFlowController.update.form(stage.id)
        : AfeApprovalFlowController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {stage ? 'Edit approval stage' : 'New approval stage'}
                    </DialogTitle>
                    <DialogDescription>
                        Who signs an AFE of this value, and who it moves to
                        afterwards.
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
                                <Label htmlFor="approver_id">Approver</Label>
                                <Select
                                    name="approver_id"
                                    defaultValue={
                                        stage?.approver_id
                                            ? String(stage.approver_id)
                                            : undefined
                                    }
                                >
                                    <SelectTrigger id="approver_id">
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
                                <InputError message={errors.approver_id} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="approving_limit_start">
                                        Approves from
                                    </Label>
                                    <Input
                                        id="approving_limit_start"
                                        name="approving_limit_start"
                                        inputMode="decimal"
                                        defaultValue={
                                            stage?.approving_limit_start ?? 0
                                        }
                                    />
                                    <InputError
                                        message={errors.approving_limit_start}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="approving_limit">
                                        Approves up to
                                    </Label>
                                    <Input
                                        id="approving_limit"
                                        name="approving_limit"
                                        inputMode="decimal"
                                        defaultValue={
                                            stage?.approving_limit ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.approving_limit}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="stage">Stage</Label>
                                    <Input
                                        id="stage"
                                        name="stage"
                                        inputMode="numeric"
                                        defaultValue={stage?.stage ?? 1}
                                    />
                                    <InputError message={errors.stage} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="forwardStatus">
                                        Forwards to
                                    </Label>
                                    <Select
                                        name="forwardStatus"
                                        defaultValue={String(
                                            stage?.forwardStatus ?? 0,
                                        )}
                                    >
                                        <SelectTrigger id="forwardStatus">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NOBODY}>
                                                Nobody — stops here
                                            </SelectItem>
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
                                    <InputError
                                        message={errors.forwardStatus}
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
                                    {stage ? 'Save changes' : 'Add stage'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
