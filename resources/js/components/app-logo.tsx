import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <AppLogoIcon className="text-primary size-7 shrink-0" />
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-base leading-tight font-bold tracking-tight">
                    {name}
                </span>
            </div>
        </>
    );
}
