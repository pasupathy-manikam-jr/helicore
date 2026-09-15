import { Form, Head, Link } from '@inertiajs/react';
import ReceivingNoteController from '@/actions/App/Http/Controllers/ReceivingNoteController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { show as afeShow } from '@/routes/afe';
import { index } from '@/routes/receiving-note';
import { ArrowLeft } from 'lucide-react';
import type { AfeForReceiving, ReceivableLine } from './types';

type Props = {
    afe: AfeForReceiving;
    lines: ReceivableLine[];
};

export default function ReceivingNoteForm({ afe, lines }: Props) {
    return (
        <>
            <Head title={`Receive against AFE ${afe.id}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={`Receive against AFE ${afe.id}`}
                        description={afe.supplier ?? 'No supplier on record'}
                    />

                    <Button variant="outline" asChild>
                        <Link href={afeShow(afe.id)}>
                            <ArrowLeft /> Back to AFE
                        </Link>
                    </Button>
                </div>

                <Form
                    {...ReceivingNoteController.store.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="afe_id" value={afe.id} />

                            <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="supplierinvoice">
                                        Supplier invoice
                                    </Label>
                                    <Input
                                        id="supplierinvoice"
                                        name="supplierinvoice"
                                    />
                                    <InputError
                                        message={errors.supplierinvoice}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="deliverydate">
                                        Delivery date
                                    </Label>
                                    <Input
                                        id="deliverydate"
                                        name="deliverydate"
                                        type="date"
                                    />
                                    <InputError message={errors.deliverydate} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="awb">AWB</Label>
                                    <Input id="awb" name="awb" />
                                    <InputError message={errors.awb} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="osc">OSC</Label>
                                    <Input id="osc" name="osc" />
                                    <InputError message={errors.osc} />
                                </div>
                            </section>

                            <div className="overflow-x-auto rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Stock code</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">
                                                Ordered
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Already received
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Receiving now
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {lines.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-muted-foreground py-8 text-center"
                                                >
                                                    This AFE has no line items
                                                    to receive against.
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {lines.map((line) => {
                                            const outstanding =
                                                (line.qty ?? 0) -
                                                line.already_received;

                                            return (
                                                <TableRow key={line.id}>
                                                    <TableCell>
                                                        {line.item}
                                                    </TableCell>
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
                                                        {line.already_received}
                                                        {outstanding > 0 && (
                                                            <div className="text-muted-foreground text-xs">
                                                                {outstanding}{' '}
                                                                outstanding
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Input
                                                            name={`quantities[${line.id}]`}
                                                            inputMode="decimal"
                                                            className="ml-auto w-24 text-right"
                                                            aria-label={`Quantity received for item ${line.item}`}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `quantities.${line.id}`
                                                                ]
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <InputError message={errors.quantities} />

                            <section className="grid gap-4 rounded-xl border p-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        name="remarks"
                                        rows={3}
                                    />
                                    <InputError message={errors.remarks} />
                                </div>
                            </section>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={index()}>Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || lines.length === 0}
                                >
                                    Create receiving note
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ReceivingNoteForm.layout = ({ afe }: Props) => ({
    breadcrumbs: [
        { title: 'Receiving notes', href: index() },
        { title: `AFE ${afe.id}`, href: afeShow(afe.id) },
    ],
});
