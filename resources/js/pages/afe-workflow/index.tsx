import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import AfeApprovalFlowController from '@/actions/App/Http/Controllers/AfeApprovalFlowController';
import ConfirmDelete from '@/components/confirm-delete';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    createAppColumnHelper,
    dataTableInitialState,
    useAppTable,
} from '@/lib/data-table';
import { money } from '@/lib/format';
import { index } from '@/routes/afe-workflow';
import { Pencil, Plus } from 'lucide-react';
import StageFormDialog from './stage-form-dialog';
import type { ApprovalStage, Manager } from './types';

type Props = {
    stages: ApprovalStage[];
    managers: Manager[];
    can: { create: boolean; edit: boolean; delete: boolean };
};

const helper = createAppColumnHelper<ApprovalStage>();

export default function AfeWorkflowIndex({ stages, managers, can }: Props) {
    const columns = useMemo(
        () =>
            helper.columns([
                helper.accessor('stage', {
                    header: 'Stage',
                    cell: ({ getValue }) => (
                        <span className="font-medium">{getValue()}</span>
                    ),
                }),
                helper.accessor('approver', { header: 'Approver' }),
                helper.accessor(
                    (row) =>
                        `${money.format(row.approving_limit_start ?? 0)} – ${money.format(row.approving_limit ?? 0)}`,
                    { id: 'limits', header: 'Approves between' },
                ),
                helper.accessor('forward_to', {
                    header: 'Forwards to',
                    cell: ({ getValue }) =>
                        getValue() ?? (
                            <span className="text-muted-foreground">
                                Nobody — stops here
                            </span>
                        ),
                }),
                helper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <div className="flex justify-end gap-1">
                            {can.edit && (
                                <StageFormDialog
                                    managers={managers}
                                    stage={row.original}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit stage ${row.original.stage}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />
                            )}

                            {can.delete && (
                                <ConfirmDelete
                                    url={AfeApprovalFlowController.destroy.url(
                                        row.original.id,
                                    )}
                                    label={`stage ${row.original.stage}`}
                                />
                            )}
                        </div>
                    ),
                }),
            ]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [managers, can.edit, can.delete],
    );

    const table = useAppTable({
        data: stages,
        columns,
        initialState: dataTableInitialState,
        getColumnCanGlobalFilter: (column) => column.id !== 'actions',
        globalFilterFn: 'includesString',
    });

    return (
        <>
            <Head title="AFE work flow" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="AFE work flow"
                    description="The approval ladder an AFE climbs, by value"
                />

                <DataTable
                    table={table}
                    searchPlaceholder="Search approvers…"
                    emptyMessage="No approval stages set up."
                    toolbar={
                        can.create && (
                            <StageFormDialog
                                managers={managers}
                                trigger={
                                    <Button>
                                        <Plus /> Add stage
                                    </Button>
                                }
                            />
                        )
                    }
                />
            </div>
        </>
    );
}

AfeWorkflowIndex.layout = {
    breadcrumbs: [{ title: 'AFE work flow', href: index() }],
};
