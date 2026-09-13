import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';

/**
 * Delete button and its confirmation. Deleting is the one destructive action
 * in these listings, so it gets a real dialog rather than the browser's.
 */
export default function ConfirmDelete({
    url,
    label,
    description = 'This cannot be undone.',
}: {
    /** Endpoint the DELETE is sent to. */
    url: string;
    /** What is being deleted, shown in the heading. */
    label: string;
    description?: string;
}) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${label}`}
                >
                    <Trash2 className="text-destructive" />
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={processing}
                        onClick={(event) => {
                            // Keep the dialog up until the request settles, so
                            // a failure is not hidden behind a closed dialog.
                            event.preventDefault();
                            setProcessing(true);

                            router.delete(url, {
                                preserveScroll: true,
                                onSuccess: () => setOpen(false),
                                onFinish: () => setProcessing(false),
                            });
                        }}
                    >
                        {processing ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
