import {
    Building2,
    ClipboardList,
    FileText,
    LayoutGrid,
    Package,
    ReceiptText,
    Settings2,
    ShieldCheck,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as clientIndex } from '@/routes/client';
import {
    create as quotationCreate,
    index as quotationIndex,
} from '@/routes/quotation';
import { index as clientDeliveryIndex } from '@/routes/client-delivery';
import { index as cocIndex } from '@/routes/coc';
import { index as deliveryOrderIndex } from '@/routes/delivery-order';
import { index as packingListIndex } from '@/routes/packing-list';
import { index as invoiceIndex } from '@/routes/invoice';
import { index as proformaIndex } from '@/routes/proforma';
import {
    create as salesOrderCreate,
    index as salesOrderIndex,
} from '@/routes/sales-order';
import { index as stockTransferIndex } from '@/routes/stock-transfer';
import { index as workOrderIndex } from '@/routes/work-order';
import { create as afeCreate, index as afeIndex } from '@/routes/afe';
import { index as afeWorkflowIndex } from '@/routes/afe-workflow';
import { index as receivingNoteIndex } from '@/routes/receiving-note';
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
import type { NavEntry, NavGroup, NavItem, NavSection } from '@/types';

/** True when the entry is a labelled section rather than a link. */
export function isNavSection(entry: NavEntry): entry is NavSection {
    return 'items' in entry;
}

/** Every link in a group, whatever nesting it sits at. */
export function navGroupLinks(group: NavGroup): NavItem[] {
    return group.items.flatMap((entry) =>
        isNavSection(entry) ? entry.items : [entry],
    );
}

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
        title: 'Administration',
        icon: ShieldCheck,
        items: [
            {
                title: 'User management',
                items: [
                    { title: 'Permissions', href: permissionIndex() },
                    { title: 'Roles', href: roleIndex() },
                    { title: 'Users', href: adminUserIndex() },
                ],
            },
        ],
    },
    {
        title: 'Product',
        icon: Package,
        items: [{ title: 'Stock codes', href: stockCodeIndex() }],
    },
    {
        title: 'Clients',
        icon: Building2,
        items: [
            { title: 'Clients', href: clientIndex() },
            { title: 'Delivery addresses', href: clientDeliveryIndex() },
        ],
    },
    {
        title: 'Quotation',
        icon: FileText,
        items: [
            { title: 'Create quotation', href: quotationCreate() },
            { title: 'View / edit quotations', href: quotationIndex() },
        ],
    },
    {
        // The two columns of the legacy mega menu: what is ordered, then what
        // ships and is billed.
        title: 'Sales Order',
        icon: ClipboardList,
        items: [
            {
                title: 'Orders',
                items: [
                    {
                        title: 'Create sales / work orders',
                        href: salesOrderCreate(),
                    },
                    { title: 'Sales orders', href: salesOrderIndex() },
                    { title: 'Work orders', href: workOrderIndex() },
                    {
                        title: 'Stock order transfers',
                        href: stockTransferIndex(),
                    },
                ],
            },
            {
                title: 'Despatch & billing',
                items: [
                    { title: 'Delivery orders', href: deliveryOrderIndex() },
                    { title: 'COC', href: cocIndex() },
                    { title: 'Packing lists', href: packingListIndex() },
                    { title: 'Invoices', href: invoiceIndex() },
                    { title: 'Proformas', href: proformaIndex() },
                ],
            },
        ],
    },
    {
        // Suppliers hang off the AFE menu in the legacy app, so they sit here
        // as a section rather than a group of their own.
        title: 'AFE',
        icon: ReceiptText,
        items: [
            { title: 'AFEs', href: afeIndex() },
            { title: 'Create AFE', href: afeCreate() },
            { title: 'AFE work flow', href: afeWorkflowIndex() },
            { title: 'Receiving notes', href: receivingNoteIndex() },
            {
                title: 'Supplier',
                items: [
                    { title: 'Supplier listing', href: supplierIndex() },
                    {
                        title: 'Supplier categories',
                        href: supplierCategoryIndex(),
                    },
                ],
            },
        ],
    },
    {
        title: 'Utilities',
        icon: Settings2,
        items: [
            { title: 'Currency', href: currencyIndex() },
            { title: 'Tariff', href: tariffIndex() },
            { title: 'Mode of shipment', href: modeOfShipmentIndex() },
            { title: 'Terms & conditions', href: termsIndex() },
            { title: 'SST / GST', href: taxIndex() },
        ],
    },
];
