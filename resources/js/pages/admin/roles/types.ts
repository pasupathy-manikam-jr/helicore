export type AdminRole = {
    id: number;
    name: string;
    users_count: number;
    permissions: string[];
    /** Roles the application depends on; delete is refused server-side. */
    protected: boolean;
};

/** Permission names grouped by their module column. */
export type PermissionModules = Record<string, string[]>;
