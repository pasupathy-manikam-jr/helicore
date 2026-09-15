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
import { edit, index, show } from '@/routes/afe';
import { ArrowLeft, Check, Clock, Pencil, Plus } from 'lucide-react';
import AfeLineController from '@/actions/App/Http/Controllers/AfeLineController';
import ConfirmDelete from '@/components/confirm-delete';
import ApprovalActions from './approval-actions';
import LineFormDialog from './line-form-dialog';
import type { Afe, AfeLine, AfeTotals } from './types';

type Props = {
    afe: Afe;
    lines: AfeLine[];
    totals: AfeTotals;
    can: { edit: boolean; deleteLine: boolean; approve: boolean };
    myApproval: string | null;
};

const money = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-sm">{value || '—'}</dd>
        </div>
    );
}

export default function AfeShow({
    afe,
    lines,
    totals,
    can,
    myApproval,
}: Props) {
    return (
        <>
            <Head title={`AFE ${afe.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`AFE ${afe.id}`}
                        description={
                            afe.supplier?.supplier_name ?? 'No supplier'
                        }
                    />

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={index()}>
                                <ArrowLeft /> Back to list
                            </Link>
                        </Button>

                        {can.edit && (
                            <Button asChild>
                                <Link href={edit(afe.id)}>
                                    <Pencil /> Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                        <Field
                            label="Supplier"
                            value={afe.supplier?.supplier_name}
                        />
                        <Field
                            label="Contact"
                            value={afe.supplier?.contactperson}
                        />
                        <Field label="Buying from" value={afe.buyingfrom} />
                        <Field label="Category" value={afe.suppliersubcat} />
                        <Field
                            label="Supplier quote no."
                            value={afe.suppquoteno}
                        />
                        <Field label="PO type" value={afe.potype} />
                    </dl>

                    <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                        <Field label="Originator" value={afe.originator} />
                        <Field label="Currency" value={afe.currency} />
                        <Field label="Sales order" value={afe.salesorder} />
                        <Field label="Reference" value={afe.reference} />
                        <Field label="Status" value={afe.status} />
                        <Field
                            label="Payment terms"
                            value={afe.payment_terms}
                        />
                        <Field label="ETA" value={afe.eta} />
                        <Field label="Arrived" value={afe.actarrival} />
                    </dl>

                    <div className="rounded-xl border p-4">
                        <div className="flex items-center gap-2">
                            {afe.approved ? (
                                <Check className="text-primary size-4" />
                            ) : (
                                <Clock className="text-muted-foreground size-4" />
                            )}
                            <span className="font-semibold">
                                {afe.approved ? 'Approved' : 'Pending approval'}
                            </span>
                        </div>

                        <div className="mt-3 grid gap-2">
                            {afe.approvals.length === 0 && (
                                <p className="text-muted-foreground text-sm">
                                    Nobody has been asked to approve this yet.
                                </p>
                            )}

                            {afe.approvals.map((approval) => (
                                <div
                                    key={approval.id}
                                    className="flex items-center justify-between gap-4 text-sm"
                                >
                                    <span>
                                        {approval.name ?? `User ${approval.id}`}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {approval.status === 'yes'
                                            ? 'Approved'
                                            : approval.status || 'Pending'}
                                        {approval.date
                                            ? ` · ${approval.date}`
                                            : ''}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {afe.comments && (
                            <p className="text-muted-foreground mt-3 text-xs whitespace-pre-line">
                                {afe.comments}
                            </p>
                        )}
                    </div>
                </div>

                {can.approve && (
                    <ApprovalActions afeId={afe.id} current={myApproval} />
                )}

                {can.edit && (
                    <div className="flex justify-end">
                        <LineFormDialog
                            afeId={afe.id}
                            trigger={
                                <Button>
                                    <Plus /> Add line item
                                </Button>
                            }
                        />
                    </div>
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
                                <TableHead className="text-right">
                                    Unit value
                                </TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead className="text-right">
                                    Total (MYR)
                                </TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {lines.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No line items on this AFE.
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
                                        {line.qty}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(
                                            Number(line.unitvalue ?? 0),
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(Number(line.total ?? 0))}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {money.format(
                                            Number(line.totalmyr ?? 0),
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            {can.edit && (
                                                <LineFormDialog
                                                    afeId={afe.id}
                                                    line={line}
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Edit item ${line.item}`}
                                                        >
                                                            <Pencil />
                                                        </Button>
                                                    }
                                                />
                                            )}

                                            {can.deleteLine && (
                                                <ConfirmDelete
                                                    url={AfeLineController.destroy.url(
                                                        [afe.id, line.id],
                                                    )}
                                                    label={`item ${line.item}`}
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end">
                    <div className="w-full max-w-sm rounded-xl border p-4 text-sm">
                        <div className="flex justify-between gap-8 py-1">
                            <span className="text-muted-foreground">
                                Total quantity
                            </span>
                            <span className="tabular-nums">
                                {totals.quantity}
                            </span>
                        </div>
                        <div className="flex justify-between gap-8 border-t py-1 pt-2 font-semibold">
                            <span>
                                Total{afe.currency ? ` (${afe.currency})` : ''}
                            </span>
                            <span className="tabular-nums">
                                {money.format(totals.subtotal)}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex justify-between gap-8 py-1 text-xs">
                            <span>Equivalent in MYR</span>
                            <span className="tabular-nums">
                                {money.format(totals.myr)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

AfeShow.layout = ({ afe }: Props) => ({
    breadcrumbs: [
        { title: 'AFEs', href: index() },
        { title: String(afe.id), href: show(afe.id) },
    ],
});
