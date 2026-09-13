/**
 * The eleven ASME B16.20 centring-ring colours, in the order the standard
 * lists them. Category groups are assigned a colour from this ring so the same
 * group reads the same everywhere in the app.
 */
export const MATERIAL_TOKENS = [
    '--mat-316',
    '--mat-347',
    '--mat-monel',
    '--mat-304',
    '--mat-321',
    '--mat-nickel',
    '--mat-titanium',
    '--mat-inconel',
    '--mat-317',
    '--mat-hastelloy',
    '--mat-alloy20',
] as const;

export type MaterialToken = (typeof MATERIAL_TOKENS)[number];

/**
 * Stable name → colour. Hashing rather than a hand-kept map means a group
 * added in the database gets a colour without a code change, and keeps the
 * same one on every page.
 */
export function materialFor(name: string | null | undefined): MaterialToken {
    let hash = 0;

    for (const character of (name ?? '').toUpperCase()) {
        hash = (hash * 31 + character.charCodeAt(0)) % 100_000;
    }

    return MATERIAL_TOKENS[hash % MATERIAL_TOKENS.length];
}

/** Inline style that drives `.mat-chip` and `.mat-rule`. */
export function materialStyle(
    name: string | null | undefined,
): React.CSSProperties {
    return { '--mat': `var(${materialFor(name)})` } as React.CSSProperties;
}
