const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

export const money = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/** Legacy date columns are inconsistent, so anything unparseable is shown as is. */
export function formatDate(value: string | null) {
    if (!value) {
        return null;
    }

    const parsed = new Date(value.replace(' ', 'T'));

    return Number.isNaN(parsed.getTime()) ? value : dateFormat.format(parsed);
}
