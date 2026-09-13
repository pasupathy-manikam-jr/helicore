export type StockItem = {
    id: number;
    stock_code: string | null;
    main_code: string | null;
    // rtj keeps these as text (R23, OVAL), the other lines as numbers.
    size: string | number | null;
    rating: string | number | null;
    description: string | null;
    weight: string | null;
    price: string | null;
    stock_take: number | null;
    stock_out: number | null;
    balance: number | null;
};

export type ProductOption = {
    value: string;
    label: string;
};
