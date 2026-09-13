export type FieldType = 'text' | 'number' | 'textarea';

export type ReferenceField = {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    unique?: boolean;
    help?: string;
};

export type ReferenceRow = {
    id: number;
    [column: string]: string | number | null;
};

export type ReferenceMeta = {
    title: string;
    description: string;
    singular: string;
    /** Resource root, e.g. `/currency`. Store posts here; update and delete append the id. */
    basePath: string;
};
