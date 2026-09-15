export type StockTransferRow = {
    id: number;
    salesorder: number | null;
    customer_order: string | null;
    contact_person: string | null;
    despatch_date: string | null;
    closing_date: string | null;
    location: string | null;
    created_at: string | null;
    client: string | null;
    salesperson: string | null;
};

export type StockTransferLine = {
    id: number;
    item: number | null;
    linedate: string | null;
    product: string | null;
    stock_code: string | null;
    description: string | null;
    unit: string | null;
    quantity: number | null;
    weight: number | null;
    unit_price: number | null;
    batch: string | null;
    type_of_certification: string | null;
    fgmr: number | null;
    po: number | null;
    line_total: number;
};

export type StockTransfer = {
    id: number;
    salesorder: number | null;
    customer_order: string | null;
    contact_person: string | null;
    goods_ready_date: string | null;
    customer_reqdate: string | null;
    despatch_date: string | null;
    afe: number | null;
    miscellaneous: string | null;
    currency: string | null;
    closing_date: string | null;
    packorder_date: string | null;
    mode_of_shipment: string | null;
    packaging_type: string | null;
    location: string | null;
    remarks: string | null;
    email: string | null;
    sp_instruct1: string | null;
    sp_instruct2: string | null;
    sp_instruct3: string | null;
    created_at: string | null;
    client: string | null;
};

export type StockTransferTotals = {
    quantity: number;
    weight: number;
    subtotal: number;
    grand_total: number;
};
