import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { show as afeShow } from '@/routes/afe';
import { index, show } from '@/routes/receiving-note';
import { ArrowLeft } from 'lucide-react';
import type { ReceivingNote, ReceivingNoteLine } from './types';

type Props = {
    note: ReceivingNote;
    lines: ReceivingNoteLine[];
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function ReceivingNoteShow({ note, lines }: Props) {
    return (
        <>
            <Head title={`Receiving note ${note.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Receiving note ${note.id}`}
                        description={note.supplier ?? 'No supplier on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="Supplier" value={note.supplier} />
                    <Field
                        label="AFE"
                        value={
                            note.afe_id ? (
                                <Link
                                    href={afeShow(note.afe_id)}
                                    className="hover:underline"
                                >
                                    {note.afe_id}
                                </Link>
                            ) : null
                        }
                    />
                    <Field
                        label="Supplier invoice"
                        value={note.supplierinvoice}
                    />
                    <Field label="AWB" value={note.awb} />
                    <Field label="OSC" value={note.osc} />
                    <Field
                        label="Delivered"
                        value={formatDate(note.deliverydate)}
                    />
                    <Field label="Received by" value={note.user} />
                    <Field
                        label="Prepared"
                        value={formatDate(note.preparedate)}
                    />
                </dl>

                {note.remarks && (
                    <p className="rounded-xl border p-4 text-sm whitespace-pre-line">
                        {note.remarks}
                    </p>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Stock code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                    Qty delivered
                                </TableHead>
                                <TableHead>Work order</TableHead>
                                <TableHead>Further delivery</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        Nothing was recorded against this note.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell className="font-medium">
                                        {line.stock_code}
                                        <div className="text-muted-foreground text-xs">
                                            {line.product}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-prose text-xs whitespace-pre-line">
                                        {line.description}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {line.qty_delivered}
                                    </TableCell>
                                    <TableCell>{line.workorder_id}</TableCell>
                                    <TableCell>
                                        {formatDate(line.after_delivery_date)}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {line.remarks}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

ReceivingNoteShow.layout = ({ note }: Props) => ({
    breadcrumbs: [
        { title: 'Receiving notes', href: index() },
        { title: String(note.id), href: show(note.id) },
    ],
});
