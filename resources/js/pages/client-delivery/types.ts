export type DeliveryAddress = {
    id: number;
    company_detail_id: number | null;
    customer_name: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    location_type: string | null;
    fax: string | null;
    telephone: string | null;
    client_name: string | null;
};

export type ClientOption = {
    id: number;
    cname: string | null;
};
