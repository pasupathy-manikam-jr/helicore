import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

/** A labelled set of links nested inside a menu group. */
export type NavSection = {
    title: string;
    items: NavItem[];
};

export type NavEntry = NavItem | NavSection;

export type NavGroup = {
    title: string;
    icon?: LucideIcon | null;
    items: NavEntry[];
};
