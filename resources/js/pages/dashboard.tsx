import { Head, Link } from '@inertiajs/react';
import { FileText, Truck } from 'lucide-react';
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
import { MATERIAL_TOKENS } from '@/lib/materials';
import { dashboard } from '@/routes';
import { show as quotationShow } from '@/routes/quotation';
import { index as supplierIndex } from '@/routes/supplier';

type Stat = {
    label: string;
    total: number;
    recent: number;
};

type Quotation = {
    id: number;
    client: string | null;
    your_ref: string | null;
    attnto: string | null;
    currency: string | null;
    value: number;
    created_at: string | null;
};

type Props = {
    stats: Stat[];
    pendingAfes: number;
    supplierCount: number;
    recentQuotations: Quotation[];
};

const number = new Intl.NumberFormat();

const money = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatDate(value: string | null) {
    if (!value) {
        return '—';
    }

    const parsed = new Date(value.replace(' ', 'T'));

    return Number.isNaN(parsed.getTime())
        ? '—'
        : parsed.toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          });
}

export default function Dashboard({
    stats,
    pendingAfes,
    supplierCount,
    recentQuotations,
}: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading
                        title="Dashboard"
                        description="Activity across quotations, orders and procurement"
                    />

                    <Button variant="outline" asChild>
                        <Link href={supplierIndex()}>
                            <Truck /> Suppliers
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            style={
                                {
                                    '--mat': `var(${MATERIAL_TOKENS[index % MATERIAL_TOKENS.length]})`,
                                } as React.CSSProperties
                            }
                            className="bg-card overflow-hidden rounded-md border shadow-xs"
                        >
                            <div className="mat-rule h-1.5" />
                            <div className="p-4">
                                <div className="text-muted-foreground text-sm">
                                    {stat.label}
                                </div>
                                <div
                                    className="mt-1 text-4xl font-bold tabular-nums"
                                    style={{ color: 'var(--mat)' }}
                                >
                                    {number.format(stat.total)}
                                </div>
                                <div className="text-muted-foreground mt-2 text-xs">
                                    {number.format(stat.recent)} in the last 30
                                    days
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div
                        style={
                            {
                                '--mat': pendingAfes
                                    ? 'var(--mat-304)'
                                    : 'var(--mat-316)',
                            } as React.CSSProperties
                        }
                        className="mat-chip flex items-center justify-between rounded-md border p-4"
                    >
                        <div>
                            <div className="text-sm opacity-80">
                                AFEs awaiting approval
                            </div>
                            <div className="mt-1 text-3xl font-bold tabular-nums">
                                {number.format(pendingAfes)}
                            </div>
                        </div>
                        <span className="text-sm font-semibold">
                            {pendingAfes > 0 ? 'Action needed' : 'All clear'}
                        </span>
                    </div>

                    <Link
                        href={supplierIndex()}
                        className="bg-card hover:border-primary flex items-center justify-between rounded-md border p-4 shadow-xs transition-colors"
                    >
                        <div>
                            <div className="text-muted-foreground text-sm">
                                Suppliers on record
                            </div>
                            <div className="text-primary mt-1 text-3xl font-bold tabular-nums">
                                {number.format(supplierCount)}
                            </div>
                        </div>
                        <Truck className="text-primary size-8" />
                    </Link>
                </div>

                <div className="bg-card overflow-hidden rounded-md border shadow-xs">
                    <div className="text-primary flex items-center gap-2 border-b p-4">
                        <FileText className="size-4" />
                        <h2 className="font-semibold">Latest quotations</h2>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quote no.</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Your ref.</TableHead>
                                <TableHead className="text-right">
                                    Value
                                </TableHead>
                                <TableHead className="text-right">
                                    Raised
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {recentQuotations.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No quotations yet.
                                    </TableCell>
                                </TableRow>
                            )}

                            {recentQuotations.map((quotation) => (
                                <TableRow key={quotation.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={quotationShow(quotation.id)}
                                            className="hover:underline"
                                        >
                                            {quotation.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {quotation.client ?? '—'}
                                        <div className="text-muted-foreground text-xs">
                                            {quotation.attnto}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {quotation.your_ref ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                                        {money.format(quotation.value)}
                                        <span className="text-muted-foreground ml-1 text-xs">
                                            {quotation.currency}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        {formatDate(quotation.created_at)}
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

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
