export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
