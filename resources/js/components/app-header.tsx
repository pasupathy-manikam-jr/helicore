import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import {
    isNavSection,
    mainNavItems,
    navGroupLinks,
    navGroups,
} from '@/lib/navigation';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const activeItemStyles = 'bg-accent text-accent-foreground';

function MenuLink({ item }: { item: NavItem }) {
    const { whenCurrentUrl } = useCurrentUrl();

    return (
        <NavigationMenuLink asChild>
            <Link
                href={item.href}
                className={cn(
                    'block rounded-md px-2 py-1.5 text-sm',
                    whenCurrentUrl(
                        item.href,
                        'bg-accent text-accent-foreground font-medium',
                    ),
                )}
            >
                {item.title}
            </Link>
        </NavigationMenuLink>
    );
}

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    return (
        <>
            <div className="theme-header dark bg-background text-foreground border-border border-b">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="bg-sidebar flex h-full w-72 flex-col items-stretch"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>

                                <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 text-sm">
                                    <div className="flex flex-col gap-3">
                                        {mainNavItems.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="flex items-center gap-2 font-medium"
                                            >
                                                {item.icon && (
                                                    <item.icon className="h-5 w-5" />
                                                )}
                                                <span>{item.title}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    {navGroups.map((group) => (
                                        <div
                                            key={group.title}
                                            className="flex flex-col gap-3"
                                        >
                                            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                                                {group.icon && (
                                                    <group.icon className="h-4 w-4" />
                                                )}
                                                {group.title}
                                            </div>

                                            {group.items.map((entry) =>
                                                isNavSection(entry) ? (
                                                    <div
                                                        key={entry.title}
                                                        className="flex flex-col gap-3"
                                                    >
                                                        <div className="text-muted-foreground pl-6 text-xs font-medium">
                                                            {entry.title}
                                                        </div>
                                                        {entry.items.map(
                                                            (item) => (
                                                                <Link
                                                                    key={
                                                                        item.title
                                                                    }
                                                                    href={
                                                                        item.href
                                                                    }
                                                                    className={cn(
                                                                        'pl-10 font-medium',
                                                                        whenCurrentUrl(
                                                                            item.href,
                                                                            'text-primary',
                                                                        ),
                                                                    )}
                                                                >
                                                                    {item.title}
                                                                </Link>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Link
                                                        key={entry.title}
                                                        href={entry.href}
                                                        className={cn(
                                                            'pl-6 font-medium',
                                                            whenCurrentUrl(
                                                                entry.href,
                                                                'text-primary',
                                                            ),
                                                        )}
                                                    >
                                                        {entry.title}
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    <div className="ml-auto flex items-center space-x-2">
                        {/* Dashboard sits beside the profile menu, as it does
                            in the application this replaces. */}
                        <nav className="hidden items-center gap-1 lg:flex">
                            {mainNavItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        'h-9 cursor-pointer bg-transparent px-3',
                                        whenCurrentUrl(
                                            item.href,
                                            activeItemStyles,
                                        ),
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            ))}
                        </nav>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* The menu sits in its own bar under the header, as it does in
                the application this replaces. */}
            <div className="border-border relative z-40 hidden border-b lg:block">
                <div className="mx-auto flex h-12 items-stretch px-4 md:max-w-7xl">
                    <NavigationMenu
                        viewport={false}
                        className="flex h-full items-stretch"
                    >
                        <NavigationMenuList className="flex h-full items-stretch space-x-1">
                            {navGroups.map((group) => {
                                const hasActiveChild = navGroupLinks(
                                    group,
                                ).some((item) => isCurrentUrl(item.href));

                                return (
                                    <NavigationMenuItem
                                        key={group.title}
                                        className="relative flex h-full items-center"
                                    >
                                        <NavigationMenuTrigger
                                            className={cn(
                                                'h-9 cursor-pointer px-3',
                                                hasActiveChild &&
                                                    activeItemStyles,
                                            )}
                                        >
                                            {group.icon && (
                                                <group.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {group.title}
                                        </NavigationMenuTrigger>

                                        <NavigationMenuContent>
                                            <ul className="grid w-56 gap-1 p-2">
                                                {group.items.map((entry) =>
                                                    isNavSection(entry) ? (
                                                        <li key={entry.title}>
                                                            <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium tracking-wide uppercase">
                                                                {entry.title}
                                                            </div>
                                                            <ul className="border-border ml-2 grid gap-1 border-l pl-2">
                                                                {entry.items.map(
                                                                    (item) => (
                                                                        <li
                                                                            key={
                                                                                item.title
                                                                            }
                                                                        >
                                                                            <MenuLink
                                                                                item={
                                                                                    item
                                                                                }
                                                                            />
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </li>
                                                    ) : (
                                                        <li key={entry.title}>
                                                            <MenuLink
                                                                item={entry}
                                                            />
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </NavigationMenuContent>

                                        {hasActiveChild && (
                                            <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px" />
                                        )}
                                    </NavigationMenuItem>
                                );
                            })}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
