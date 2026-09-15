export type InvoiceRow = {
    id: number;
    acct_invoiceno: number | null;
    fsdno: number | null;
    indexno: string | null;
    subtotal: number | null;
    discount: number | null;
    paymentterms: string | null;
    sst: number | null;
    created_at: string | null;
    client: string | null;
};

export type InvoiceLine = {
    id: number;
    item: number | null;
    product: string | null;
    stockcode: string | null;
    description: string | null;
    quantity: number | null;
    actual_qty: number | null;
    unit_price: string | null;
    sst: string | null;
    line_total: number;
};

export type InvoiceTotals = {
    quantity: number;
    sst: number;
    subtotal: number;
    transportation: number;
    customs: number;
    packing: number;
    misc: number;
    tax: number;
    discount: number;
    grand_total: number;
};

export type Invoice = {
    id: number;
    acct_invoiceno: number | null;
    fsdno: number | null;
    indexno: string | null;
    paymentterms: string | null;
    sst: number | null;
    misc_title: string | null;
    totalmyr: number | null;
    created_at: string | null;
    client: string | null;
    currency: string | null;
    customer_order: string | null;
};
