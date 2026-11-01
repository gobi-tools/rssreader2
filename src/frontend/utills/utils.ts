// -------------------------------
// GROUPING
// -------------------------------

const DAY = 24 * 60 * 60 * 1000;

export type Grouping = 'day' | 'week' | 'month' | 'year';

export function pickGrouping(dates: number[]): Grouping {
  const gaps = dates.slice(1).map((d, i) => dates[i] - d).sort((a, b) => a - b);
  const median = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 0;
  if (median < DAY / 2) return 'day';
  if (median < 7 * DAY / 2) return 'week';
  if (median < 30 * DAY / 2) return 'month';
  return 'year';
}

export function groupByDate<T extends { date: string }>(items: T[]) {
  const grouping = pickGrouping(items.map((i) => Date.parse(i.date)));
  const groups: { label: string, items: T[] }[] = [];
  let i = 0;
  for (const item of items) {
    const label = groupLabel(new Date(item.date), grouping);
    const last = groups.at(-1);
    const indexed = { ...item, index: i };
    if (last?.label === label) last.items.push(indexed);
    else groups.push({ label, items: [indexed] });
    i++;
  }
  return groups;
}

function groupLabel(date: Date, grouping: Grouping): string {
  switch (grouping) {
    case 'day':
      return format(date, { day: 'numeric', month: 'short' });
    case 'week':
      return `Week of ${format(getMonday(date), { day: 'numeric', month: 'short' })}`;
    case 'month':
      return format(date, { month: 'long' });
    case 'year':
      return String(date.getUTCFullYear());
  }
}

function format(date: Date, options: Intl.DateTimeFormatOptions) {
  const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return date.toLocaleString('en-GB', {
    ...options,
    year: sameYear ? undefined : 'numeric',
    timeZone: 'UTC',
  });
}

function getMonday(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - ((date.getUTCDay() + 6) % 7)
    )
  )
}

// -------------------------------
// URL
// -------------------------------

export function getHostname(url: string) {
  try {
    return new URL(url).hostname.replaceAll('www.', '');
  } catch (e) {
    return url;
  }
}