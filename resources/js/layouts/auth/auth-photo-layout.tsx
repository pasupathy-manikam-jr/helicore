import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import GasketPlate from '@/components/gasket-plate';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

/**
 * Sign-in shell: form on the left, the factory floor on the right. The photo
 * panel is decorative and drops away below lg, where the form takes the full
 * width.
 */
export default function AuthPhotoLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="bg-card grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-sm">
                    <Link href={home()} className="flex flex-col">
                        <span className="flex items-center gap-2.5">
                            <AppLogoIcon className="text-primary size-8" />
                            <span className="text-3xl leading-none font-bold tracking-tight">
                                Helicore
                            </span>
                        </span>
                        <span className="text-muted-foreground mt-1.5 text-xs">
                            Helicore Sealing Systems
                        </span>
                    </Link>

                    <div className="mt-10 space-y-1">
                        <h1 className="text-xl font-semibold">{title}</h1>
                        <p className="text-muted-foreground text-sm">
                            {description}
                        </p>
                    </div>

                    <div className="mt-8">{children}</div>
                </div>
            </div>

            <div className="relative hidden lg:block">
                <GasketPlate />

                {/* Weighted to the bottom so the caption stays readable. */}
                <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[oklch(0.206_0.007_229.3)]/85 via-transparent to-transparent"
                />

                <div className="absolute inset-x-0 bottom-0 p-12">
                    <p className="max-w-md text-2xl leading-snug font-semibold text-white">
                        Spiral wound, ring joint and kammprofile gaskets, made
                        to ASME B16.20 and API 6A.
                    </p>
                    <p className="mt-3 text-sm text-white/70">
                        Sendayan Merchant Square, Labu, Seremban &middot; Pasir
                        Gudang
                    </p>
                </div>
            </div>
        </div>
    );
}
