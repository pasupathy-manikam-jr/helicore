/**
 * Decorative panel art: a spiral wound gasket drawn at scale, bleeding off the
 * right edge. The winding alternates weight the way the real strip alternates
 * metal and graphite, and the outer band is the centring ring.
 *
 * Drawn rather than photographed so there is nothing to licence, and it stays
 * sharp at any panel size.
 */
const WINDING = Array.from({ length: 30 }, (_, index) => 232 - index * 6);

export default function GasketPlate() {
    return (
        <svg
            aria-hidden
            viewBox="0 0 800 900"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
        >
            <defs>
                <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M40 0H0V40"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1"
                        opacity="0.05"
                    />
                </pattern>

                <radialGradient id="glow" cx="58%" cy="45%" r="62%">
                    <stop offset="0%" stopColor="#0a4d3c" />
                    <stop offset="100%" stopColor="#06201a" />
                </radialGradient>
            </defs>

            <rect width="800" height="900" fill="url(#glow)" />
            <rect width="800" height="900" fill="url(#grid)" />

            <g transform="translate(470 430)">
                {/* Centring ring: solid carbon steel band. */}
                <circle
                    r="286"
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity="0.16"
                    strokeWidth="34"
                />
                <circle
                    r="286"
                    fill="none"
                    stroke="#00a878"
                    strokeOpacity="0.55"
                    strokeWidth="2"
                />

                {/* The wound section. */}
                {WINDING.map((radius, index) => (
                    <circle
                        key={radius}
                        r={radius}
                        fill="none"
                        stroke={index % 2 === 0 ? '#00a878' : '#ffffff'}
                        strokeOpacity={index % 2 === 0 ? 0.5 : 0.2}
                        strokeWidth={index % 2 === 0 ? 2.5 : 1.5}
                    />
                ))}

                {/* Winding start. */}
                <path
                    d="M0 -238 L0 -52"
                    stroke="#06201a"
                    strokeWidth="9"
                    strokeLinecap="round"
                />

                {/* Bore. */}
                <circle r="46" fill="#06201a" />
                <circle
                    r="46"
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity="0.25"
                    strokeWidth="2"
                />

                {/* Outside diameter callout. */}
                <path
                    d="M-286 0 H286"
                    stroke="#ffffff"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    strokeDasharray="6 8"
                />
            </g>

            <g
                fill="#ffffff"
                fillOpacity="0.55"
                fontSize="17"
                fontWeight="500"
                letterSpacing="0.12em"
            >
                <text x="64" y="150">
                    SPW · 316L / FG · CLASS 600
                </text>
                <text x="64" y="182" fillOpacity="0.35">
                    ASME B16.20
                </text>
            </g>
        </svg>
    );
}
