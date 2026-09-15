export type PackingListRow = {
    id: number;
    ref: string | null;
    altcustomername: string | null;
    created_at: string | null;
    sales_orders: number[];
    line_count: number;
};

export type PackingListLine = {
    id: number;
    salesorder: number | null;
    do_id: number | null;
    item: number | null;
    unit_weight: number | null;
    unit_value: number | null;
    decuval: string | null;
    stockcode: string | null;
    description: string | null;
    quantity: number | null;
};

export type PackingList = {
    id: number;
    ref: string | null;
    altcustomername: string | null;
    created_at: string | null;
    sales_orders: number[];
};

export type PackingListTotals = {
    items: number;
    weight: number;
    value: number;
};

export type DeliveryOrderOption = {
    id: number;
    type: string | null;
    salesorder: number | null;
    customer_order: string | null;
};

export type DeliveryOrderForPacking = {
    id: number;
    type: string | null;
    salesorder: number | null;
    customer_order: string | null;
    created_at: string | null;
    client: string | null;
};

export type PackableLine = {
    id: number;
    item: number | null;
    product: string | null;
    stockcode: string | null;
    description: string | null;
    quantity: number | null;
    actual_qty: number | null;
    weight: number | null;
};
