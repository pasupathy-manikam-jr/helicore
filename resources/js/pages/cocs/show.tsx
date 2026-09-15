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
import { index, show } from '@/routes/coc';
import { show as salesOrderShow } from '@/routes/sales-order';
import { ArrowLeft } from 'lucide-react';
import type { Coc, CocLine } from './types';

type Props = {
    coc: Coc;
    lines: CocLine[];
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function CocShow({ coc, lines }: Props) {
    return (
        <>
            <Head title={`COC ${coc.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Certificate of conformity ${coc.id}`}
                        description={coc.client ?? 'No client on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft /> Back to list
                        </Link>
                    </Button>
                </div>

                <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 lg:grid-cols-5">
                    <Field label="Client" value={coc.client} />
                    <Field
                        label="Sales order"
                        value={
                            coc.fsdorder ? (
                                <Link
                                    href={salesOrderShow(coc.fsdorder)}
                                    className="hover:underline"
                                >
                                    {coc.fsdorder}
                                </Link>
                            ) : null
                        }
                    />
                    <Field label="Quality authority" value={coc.quality_auth} />
                    <Field label="Issued" value={formatDate(coc.created_at)} />
                    <Field label="Legacy index" value={coc.indexno} />
                </dl>

                {coc.remarks && (
                    <p className="rounded-xl border p-4 text-sm whitespace-pre-line">
                        {coc.remarks}
                    </p>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Stock code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                    Qty
                                </TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Certification</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        This certificate names no sales order
                                        lines, or the lines it names are gone.
                                    </TableCell>
                                </TableRow>
                            )}

                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.item}</TableCell>
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
                                        {line.quantity} {line.unit}
                                    </TableCell>
                                    <TableCell>{line.batch}</TableCell>
                                    <TableCell>
                                        {line.type_of_certification}
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

CocShow.layout = ({ coc }: Props) => ({
    breadcrumbs: [
        { title: 'COC', href: index() },
        { title: String(coc.id), href: show(coc.id) },
    ],
});
