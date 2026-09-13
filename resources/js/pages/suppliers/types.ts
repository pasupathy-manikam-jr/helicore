export type Supplier = {
    id: number;
    supplier_name: string;
    approval: string | null;
    supplier_category_id: number[];
    subcategories: { label: string; group: string | null }[];
    // Legacy column is a varchar, so ids arrive as strings on older rows.
    approver: number | string | null;
    approver_name: string | null;
    regno: string | null;
    gst_regno: string | null;
    address: string | null;
    contact: string | null;
    contactperson: string | null;
};

export type SupplierCategory = {
    id: number;
    category: string | null;
    subcategory: string | null;
};

export type Manager = {
    id: number;
    name: string;
};
