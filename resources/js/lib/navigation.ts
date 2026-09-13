import {
    Building2,
    LayoutGrid,
    Package,
    Settings2,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as clientIndex } from '@/routes/client';
import { index as quotationIndex } from '@/routes/quotation';
import { index as clientDeliveryIndex } from '@/routes/client-delivery';
import { index as stockCodeIndex } from '@/routes/stock-code';
import { index as supplierIndex } from '@/routes/supplier';
import { index as supplierCategoryIndex } from '@/routes/supplier-category';
import { index as roleIndex } from '@/routes/admin/role';
import { index as adminUserIndex } from '@/routes/admin/user';
import { index as permissionIndex } from '@/routes/admin/permission';
import { index as currencyIndex } from '@/routes/currency';
import { index as modeOfShipmentIndex } from '@/routes/mode-of-shipment';
import { index as tariffIndex } from '@/routes/tariff';
import { index as taxIndex } from '@/routes/tax';
import { index as termsIndex } from '@/routes/terms';
import type { NavGroup, NavItem } from '@/types';

/**
 * Single source for the application navigation, shared by the header and the
 * sidebar layouts. Mirrors the legacy top navigation; groups gain entries as
 * each module is ported, so every link here points at a route that exists.
 */
export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

export const navGroups: NavGroup[] = [
    {
        title: 'Sales',
        icon: Building2,
        items: [
            { title: 'Quotations', href: quotationIndex() },
            { title: 'Clients', href: clientIndex() },
            { title: 'Delivery addresses', href: clientDeliveryIndex() },
        ],
    },
    {
        title: 'Products',
        icon: Package,
        items: [{ title: 'Stock codes', href: stockCodeIndex() }],
    },
    {
        title: 'Procurement',
        icon: Truck,
        items: [
            {
                title: 'Suppliers',
                href: supplierIndex(),
            },
            {
                title: 'Supplier categories',
                href: supplierCategoryIndex(),
            },
        ],
    },
    {
        title: 'Administration',
        icon: ShieldCheck,
        items: [
            { title: 'Users', href: adminUserIndex() },
            { title: 'Roles', href: roleIndex() },
            { title: 'Permissions', href: permissionIndex() },
        ],
    },
    {
        title: 'Utilities',
        icon: Settings2,
        items: [
            { title: 'Currencies', href: currencyIndex() },
            { title: 'Tariff codes', href: tariffIndex() },
            { title: 'Modes of shipment', href: modeOfShipmentIndex() },
            { title: 'Tax rates', href: taxIndex() },
            { title: 'Terms & conditions', href: termsIndex() },
        ],
    },
];
