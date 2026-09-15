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
    stock_code: string | null;
    description: string | null;
    quantity: number | null;
    unit: string | null;
    batch: string | null;
    type_of_certification: string | null;
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
