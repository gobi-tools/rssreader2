

export function formatDate(iso: string): string {
  const date = new Date(iso);
  // const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return date.toLocaleDateString("en-GB", {
    day: 'numeric',
    month: 'short',
    year: undefined,
    timeZone: 'UTC',
  });
}

export function getYear(iso: string): number {
  return new Date(iso).getUTCFullYear();
} 