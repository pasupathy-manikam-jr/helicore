import { cn } from '@/lib/utils';
import { materialStyle } from '@/lib/materials';

/**
 * Colour-coded label. `group` decides the colour, `children` the text, so a
 * subcategory can be tinted by the group it belongs to.
 */
export function MatChip({
    group,
    children,
    className,
}: {
    group: string | null | undefined;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            style={materialStyle(group)}
            className={cn(
                'mat-chip inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
                className,
            )}
        >
            {children}
        </span>
    );
}
