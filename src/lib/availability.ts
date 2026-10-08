export type Weekly = Record<string, string[]>; // "0" (Sun) … "6" (Sat) → ["HH:MM", …]
export type Availability = { timeZone: string; weekly: Weekly };

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_ZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'Europe/London', 'Africa/Accra',
];

export function formatTime(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function zoneLabel(timeZone: string) {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'long' })
      .formatToParts(new Date()).find(p => p.type === 'timeZoneName');
    return part?.value ?? timeZone;
  } catch { return timeZone; }
}

export type BookableDay = { label: string; weekday: string; date: string; slots: string[] };

/** Upcoming days (starting tomorrow in the advisor's time zone) that have open slots. */
export function upcomingDays(a: Availability, count = 10, horizon = 28): BookableDay[] {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: a.timeZone, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date()).map(p => [p.type, p.value]),
  );
  const base = Date.UTC(Number(parts['year']), Number(parts['month']) - 1, Number(parts['day']));
  const out: BookableDay[] = [];
  for (let i = 1; i <= horizon && out.length < count; i++) {
    const d = new Date(base + i * 86400000);
    const slots = [...(a.weekly[String(d.getUTCDay())] ?? [])].sort();
    if (!slots.length) continue;
    const fmt = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', { timeZone: 'UTC', ...o });
    out.push({ label: fmt({ weekday: 'long', month: 'long', day: 'numeric' }), weekday: fmt({ weekday: 'short' }), date: fmt({ month: 'short', day: 'numeric' }), slots });
  }
  return out;
}
