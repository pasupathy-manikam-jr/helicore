export type ProformaRow = {
    id: number;
    fsdno: number | null;
    subtotal: number | null;
    totalmyr: number | null;
    discount: number | null;
    paymentdue: string | null;
    sst: number | null;
    created_at: string | null;
    client: string | null;
};

export type ProformaLine = {
    id: number;
    item: number | null;
    product: string | null;
    stock_code: string | null;
    description: string | null;
    unit: string | null;
    quantity: number | null;
    weight: number | null;
    unit_price: string | null;
    sst: string | null;
    line_total: number;
};

export type ProformaTotals = {
    quantity: number;
    sst: number;
    subtotal: number;
    transportation: number;
    customs: number;
    packing: number;
    misc: number;
    discount: number;
    grand_total: number;
};

export type Proforma = {
    id: number;
    fsdno: number | null;
    paymentdue: string | null;
    sst: number | null;
    misc_title: string | null;
    totalmyr: number | null;
    created_at: string | null;
    client: string | null;
    currency: string | null;
    customer_order: string | null;
};
