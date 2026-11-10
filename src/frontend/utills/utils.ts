// -------------------------------
// GROUPING
// -------------------------------

const DAY = 24 * 60 * 60 * 1000;

export type Grouping = 'day' | 'week' | 'month' | 'year';

const LEVELS: Grouping[] = ['day', 'week', 'month', 'year'];
const MIN_DENSE = 2; 
const SPARSE_STREAK = 2;

interface Item { date: string, read: boolean };

export type GroupingResult <I extends Item> = { 
  label: string;
  items: I[];
};

export function pickGrouping(dates: number[]): Grouping {
  const gaps = dates.slice(1).map((d, i) => dates[i] - d).sort((a, b) => a - b);
  const median = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 0;
  if (median < DAY / 2) return 'day';
  if (median < 7 * DAY / 2) return 'week';
  if (median < 30 * DAY / 2) return 'month';
  return 'year';
}

export function groupByDate<I extends Item>(items: I[]): GroupingResult<I>[] {
  const picked = pickGrouping(items.map((i) => Date.parse(i.date)));
  return buildGroups(items, 0, LEVELS.indexOf(picked), picked !== 'day');
}

// this algorithm will take a number of items and it will dive them in groups, ordered by date
// recent elements will have one grouping (by day/week/month/year)
// later elements will be grouped again such that sparser periods (e.g. 20 items in 20 weeks) are grouped one level coarser (e.g week/month/year) 
function buildGroups<I extends Item>(items: I[], from: number, levelIdx: number, canCoarse: boolean): GroupingResult<I>[] {
  const level = LEVELS[levelIdx];
  // do the first grouping
  const buckets: { label: string, start: number, items: I[] }[] = [];
  for (let i = from; i < items.length; i++) {
    const label = groupLabel(new Date(items[i].date), level);
    const indexed = { ...items[i], index: i };
    const last = buckets.at(-1);
    if (last?.label === label) last.items.push(indexed);
    else buckets.push({ label, start: i, items: [indexed] });
  }

  // find the first run of sparse buckets and group everything after one level coarser (and may coarsen again)
  if (canCoarse && levelIdx < LEVELS.length - 1) {
    let run = 0;
    for (let b = 0; b < buckets.length; b++) {
      run = buckets[b].items.length < MIN_DENSE ? run + 1 : 0;
      if (run >= SPARSE_STREAK) {
        const cut = buckets[b - run + 1].start;
        return [
          ...buckets.filter((g) => g.start < cut).map(({ label, items }) => ({ label, items })),
          ...buildGroups(items, cut, levelIdx + 1, true),
        ];
      }
    }
  }

  return buckets.map(({ label, items }) => ({ label, items }));
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
// FILTERING
// -------------------------------

export function filterRead<I extends Item>(grouped: GroupingResult<I>[], showUnread: boolean): GroupingResult<I>[] {
  if (showUnread === false) return grouped;
  const result = [];
  for (let group of grouped) {
    const partial = group.items.filter((i) => !i.read);
    if (partial.length > 0) {
      result.push({ label: group.label, items: partial });
    }
  }
  return result;
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