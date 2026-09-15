export type DeliveryOrderRow = {
    id: number;
    type: string | null;
    salesorder: number | null;
    customer_order: string | null;
    total_fsd_items: number | null;
    delivered_fsd_items: number | null;
    status: string | null;
    created_at: string | null;
    client: string | null;
};

export type DeliveryOrderLine = {
    id: number;
    item: number | null;
    poitem: string | null;
    product: string | null;
    stockcode: string | null;
    std_stockcode: string | null;
    postock_code: string | null;
    description: string | null;
    quantity: number | null;
    actual_qty: number | null;
    unit_price: string | null;
    weight: number | null;
    sst: string | null;
    line_total: number;
};

export type DeliveryOrder = {
    id: number;
    type: string | null;
    salesorder: number | null;
    customer_order: string | null;
    total_fsd_items: number | null;
    delivered_fsd_items: number | null;
    status: string | null;
    created_at: string | null;
    complete: boolean;
    client: string | null;
    sales_order_id: number | null;
    packing_lists: number[];
};

export type DeliveryOrderTotals = {
    quantity: number;
    delivered: number;
    weight: number;
    value: number;
};
