// Format a Date object as YYYY-MM-DD using local time (not UTC),
// so "today" matches the user's actual calendar day.
export const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayString = (): string => toDateString(new Date());

// Format a YYYY-MM-DD string as a friendly display string, e.g. "Sunday, June 14"
export const formatFriendlyDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

// Format a YYYY-MM-DD string as a short display string, e.g. "Jun 14, 2026"
export const formatShortDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isToday = (dateStr: string): boolean => {
  return dateStr === getTodayString();
};
