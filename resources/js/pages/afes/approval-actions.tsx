import { Form } from '@inertiajs/react';
import AfeController from '@/actions/App/Http/Controllers/AfeController';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

type Props = {
    afeId: number;
    /** What this user has already said, if anything. */
    current: string | null;
};

const DECISIONS = [
    { status: 'yes', label: 'Approve', icon: Check },
    { status: 'no', label: 'Not approved', icon: X },
    { status: 'rej', label: 'Reject', icon: X },
] as const;

export default function ApprovalActions({ afeId, current }: Props) {
    return (
        <div className="grid gap-2 rounded-xl border p-4">
            <span className="text-muted-foreground text-xs">Your decision</span>

            <div className="flex flex-wrap gap-2">
                {DECISIONS.map((decision) => (
                    <Form
                        key={decision.status}
                        {...AfeController.approve.form(afeId)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="status"
                                    value={decision.status}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing}
                                    variant={
                                        current === decision.status
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    <decision.icon /> {decision.label}
                                </Button>
                            </>
                        )}
                    </Form>
                ))}
            </div>
        </div>
    );
}
