import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import type { Availability } from './availability';

export const getAvailability = createServerFn({ method: 'GET' }).handler(async (): Promise<Availability> => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Availability is not configured');
  const res = await fetch(`${url}/rest/v1/availability_settings?id=eq.1&select=time_zone,weekly`, { headers: { apikey: key } });
  if (!res.ok) throw new Error('Could not load availability');
  const rows = (await res.json()) as { time_zone: string; weekly: Record<string, string[]> }[];
  const row = rows[0];
  return { timeZone: row?.time_zone ?? 'America/New_York', weekly: row?.weekly ?? {} };
});

export const availabilityQuery = queryOptions({ queryKey: ['availability'], queryFn: () => getAvailability() });
