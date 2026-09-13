export type AdminUser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    department: string | null;
    position: string | null;
    mobile_phone: string | null;
    roles: string[];
};
