import type { SVGAttributes } from 'react';

/**
 * A spiral wound gasket seen face on: the solid centring ring outside, the
 * wound section within, and the break at twelve o'clock where the winding
 * starts. Same geometry as the favicon, drawn with a gap rather than a
 * knockout so it sits on any background.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
        >
            <circle cx="32" cy="32" r="23" strokeWidth="4" fill="none" />
            <path
                d="M28.794 18.115A14.25 14.25 0 1 0 35.206 18.115"
                strokeWidth="3.5"
                fill="none"
            />
            <circle cx="32" cy="32" r="6.75" strokeWidth="3.5" fill="none" />
        </svg>
    );
}
