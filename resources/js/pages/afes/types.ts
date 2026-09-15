export type AfeRow = {
    id: number;
    potype: string | null;
    supplier: string | null;
    currency: string | null;
    approvalstatus: string | null;
    status: string | null;
    salesorder: string | null;
    reference: string | null;
    eta: string | null;
    actarrival: string | null;
    final_approval_date: string | null;
    created_at: string | null;
    approved: boolean;
    /** Days between the estimated and the actual arrival. */
    delay: number | null;
};

export type AfeLine = {
    id: number;
    item: string | null;
    product: string | null;
    stock_code: string | null;
    description: string | null;
    qty: number | null;
    unitvalue: string | null;
    total: string | null;
    totalmyr: string | null;
    gst: string | null;
};

export type AfeApproval = {
    id: number;
    name: string | null;
    status: string;
    date: string | null;
};

export type Afe = {
    id: number;
    potype: string | null;
    originator: string | null;
    approvalstatus: string | null;
    status: string | null;
    comments: string | null;
    reference: string | null;
    suppquoteno: string | null;
    terms: string | null;
    payment_terms: string | null;
    eta: string | null;
    actarrival: string | null;
    salesorder: string | null;
    buyingfrom: string | null;
    suppliersubcat: string | null;
    final_approval_date: string | null;
    created_at: string | null;
    supplier: {
        id: number;
        supplier_name: string | null;
        address: string | null;
        contact: string | null;
        contactperson: string | null;
    } | null;
    currency: string | null;
    approved: boolean;
    approvals: AfeApproval[];
    attachments: string[];
};

export type AfeTotals = {
    quantity: number;
    subtotal: number;
    myr: number;
};

export type AfeFormValues = {
    id: number;
    potype: string | null;
    supplier_id: number | null;
    supplier_category_id: string | null;
    suppquoteno: string | null;
    currency_id: number | null;
    originator: string | null;
    salesorder: string | null;
    buyingfrom: string | null;
    eta: string | null;
    payment_terms: string | null;
    terms: string | null;
    comments: string | null;
    attachments: string[];
};
