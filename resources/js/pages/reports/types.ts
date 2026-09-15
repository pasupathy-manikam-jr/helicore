export type StockSoldRow = {
    id: number;
    stockcode: string | null;
    total: number;
    /** "Invoice | DO | date" for each despatch of this stock code. */
    despatches: string[];
} & Record<string, number | string | string[] | null>;

export type ProductOption = {
    value: string;
    label: string;
};
