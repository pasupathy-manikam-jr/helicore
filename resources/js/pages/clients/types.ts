export type Client = {
    id: number;
    cname: string | null;
    regno: string | null;
    gst_regno: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    phone: string | null;
    fax: string | null;
    attn: string | null;
    client_email: string | null;
    // Holds a user id on rows this app wrote, a username on legacy rows.
    user_email: string | null;
    cstatus: string | null;
    payment_terms: string | null;
    status: string | null;
    delivery_addresses_count: number;
    salesperson: string | null;
};

export type Salesperson = {
    id: number;
    name: string;
};
