export type ApprovalStage = {
    id: number;
    approver_id: number | null;
    approving_limit_start: number | null;
    approving_limit: number | null;
    stage: number | null;
    forwardStatus: number | null;
    approver: string | null;
    forward_to: string | null;
};

export type Manager = {
    id: number;
    name: string | null;
};
