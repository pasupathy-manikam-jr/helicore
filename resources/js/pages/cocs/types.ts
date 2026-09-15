export type CocRow = {
    id: number;
    indexno: number | null;
    fsdorder: number | null;
    quality_auth: string | null;
    remarks: string | null;
    created_at: string | null;
    client: string | null;
    line_count: number;
};

export type CocLine = {
    id: number;
    item: number | null;
    product: string | null;
    stockcode: string | null;
    std_stockcode: string | null;
    description: string | null;
    quantity: number | null;
    actual_qty: number | null;
};

export type Coc = {
    id: number;
    indexno: number | null;
    fsdorder: number | null;
    quality_auth: string | null;
    remarks: string | null;
    created_at: string | null;
    client: string | null;
};

export type DeliveryOrderOption = {
    id: number;
    type: string | null;
    salesorder: number | null;
    customer_order: string | null;
};

export type DeliveryOrderForCoc = {
    id: number;
    type: string | null;
    salesorder: number | null;
    customer_order: string | null;
    created_at: string | null;
    client: string | null;
    customer_no: number | null;
};

export type CertifiableLine = {
    id: number;
    item: number | null;
    product: string | null;
    stockcode: string | null;
    description: string | null;
    quantity: number | null;
    actual_qty: number | null;
};
