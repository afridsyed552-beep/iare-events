// ---------- Date & formatting helpers ----------

export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseDate(isoStr: string): Date {
  return new Date(isoStr + (isoStr.includes("T") ? "" : "T00:00:00"));
}

export function formatDate(isoStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseDate(isoStr).toLocaleDateString("en-IN", opts ?? {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDay(isoStr: string): string {
  return parseDate(isoStr).toLocaleDateString("en-IN", { day: "2-digit" });
}

export function formatMonth(isoStr: string): string {
  return parseDate(isoStr).toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
}

export function daysUntil(isoStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = parseDate(isoStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function isPast(isoStr: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return parseDate(isoStr).getTime() < now.getTime();
}

export function relativeDay(isoStr: string): string {
  const d = daysUntil(isoStr);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 0) return `${-d} days ago`;
  return `In ${d} days`;
}

export function timeAgo(isoStr: string): string {
  const diff = Date.now() - parseDate(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function plural(n: number, word: string) {
  return `${n.toLocaleString("en-IN")} ${word}${n === 1 ? "" : "s"}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
