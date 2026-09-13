export type QuotationRow = {
    id: number;
    your_ref: string | null;
    rfq: string | null;
    attnto: string | null;
    revno: number | null;
    sst: number | null;
    currency: string | null;
    so_ref: string | null;
    created_at: string | null;
    client: string | null;
    issuer: string | null;
};

export type QuotationFilters = {
    q: string;
    sort: string;
    dir: 'asc' | 'desc';
    page: number;
    per_page: number;
};

export type QuotationLine = {
    id: number;
    item: number | null;
    product: string | null;
    stockcode: string | null;
    std_stockcode: string | null;
    description: string | null;
    unit: string | null;
    qty: number | null;
    weight: number | null;
    cost_price: string | null;
    shipping_cost: string | null;
    mark_up: string | null;
    import_duty: string | null;
    pomaterialcode: string | null;
    price: string | null;
    total: string | null;
    sst: string | null;
    /** Derived server-side; the stored total is unreliable on older rows. */
    line_total: number;
    line_weight: number;
};

export type QuotationTotals = {
    quantity: number;
    weight: number;
    sst: number;
    subtotal: number;
    discount_percent: number;
    discount: number;
    after_discount: number;
    packing: number;
    customs: number;
    misc: number;
    freight: number;
    sum_of_total: number;
    gst_rate: number;
    gst: number;
    grand_total: number;
};

export type Quotation = {
    id: number;
    your_ref: string | null;
    rfq: string | null;
    attnto: string | null;
    clientemail: string | null;
    revno: number | null;
    sst: number | null;
    quote_basis: string | null;
    delivery: string | null;
    bid_valid: string | null;
    pay_terms: string | null;
    misc: string | null;
    tender_close_date: string | null;
    client_buyer_name: string | null;
    so_ref: string | null;
    created_at: string | null;
    client: {
        id: number;
        cname: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        phone: string | null;
        fax: string | null;
    } | null;
    currency: string | null;
    terms: string | null;
    salesperson: string | null;
    issuer: string | null;
    attachments: string[];
};

export type ReferenceOption = {
    id: number;
    name: string | null;
};

export type QuotationFormValues = {
    id: number;
    company_details_id: number | null;
    attnto: string | null;
    clientemail: string | null;
    client_buyer_name: string | null;
    your_ref: string | null;
    rfq: string | null;
    revno: number | null;
    sst: number | null;
    issuermail: string | null;
    user_email: string | null;
    currency: string | null;
    tnc: number | null;
    quote_basis: string | null;
    delivery: string | null;
    bid_valid: string | null;
    pay_terms: string | null;
    tender_close_date: string | null;
    packcost: string | null;
    custom: string | null;
    misc: string | null;
    miscvalue: string | null;
    freight: string | null;
    discount: string | null;
    attachments: string[];
};
