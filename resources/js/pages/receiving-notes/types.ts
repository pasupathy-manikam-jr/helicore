export type ReceivingNoteRow = {
    id: number;
    afe_id: number | null;
    supplierinvoice: string | null;
    deliverydate: string | null;
    awb: string | null;
    osc: string | null;
    user: string | null;
    preparedate: string | null;
    created_at: string | null;
    supplier: string | null;
    lines_count: number;
};

export type ReceivingNoteLine = {
    id: number;
    afe_descs_id: number | null;
    product: string | null;
    stock_code: string | null;
    description: string | null;
    qty_delivered: number | null;
    after_delivery_date: string | null;
    workorder_id: number | null;
    remarks: string | null;
};

export type ReceivingNote = {
    id: number;
    afe_id: number | null;
    supplierinvoice: string | null;
    deliverydate: string | null;
    awb: string | null;
    osc: string | null;
    user: string | null;
    preparedate: string | null;
    remarks: string | null;
    created_at: string | null;
    supplier: string | null;
};

export type AfeForReceiving = {
    id: number;
    potype: string | null;
    suppquoteno: string | null;
    salesorder: string | null;
    supplier: string | null;
};

export type ReceivableLine = {
    id: number;
    item: string | null;
    product: string | null;
    stock_code: string | null;
    description: string | null;
    qty: number | null;
    /** How much of this line earlier notes already recorded. */
    already_received: number;
};
