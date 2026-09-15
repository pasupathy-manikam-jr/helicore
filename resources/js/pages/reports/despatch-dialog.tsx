import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Props = {
    stockcode: string | null;
    despatches: string[];
};

export default function DespatchDialog({ stockcode, despatches }: Props) {
    const [open, setOpen] = useState(false);

    if (despatches.length === 0) {
        return <span className="font-medium">{stockcode ?? '—'}</span>;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="h-auto p-0 font-medium">
                    {stockcode ?? '—'}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{stockcode}</DialogTitle>
                    <DialogDescription>
                        {despatches.length} despatch(es) of this stock code.
                    </DialogDescription>
                </DialogHeader>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">No</TableHead>
                            <TableHead>Invoice · DO · date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {despatches.map((despatch, position) => (
                            <TableRow key={`${despatch}-${position}`}>
                                <TableCell className="tabular-nums">
                                    {position + 1}
                                </TableCell>
                                <TableCell>{despatch}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
}
