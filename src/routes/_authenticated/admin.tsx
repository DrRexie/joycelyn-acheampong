import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { TIME_ZONES, WEEKDAYS, formatTime, type Weekly } from '@/lib/availability';

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [
    { title: 'Availability settings | Joycelyn Acheampong' },
    { name: 'description', content: 'Manage weekly consultation availability.' },
    { property: 'og:title', content: 'Availability settings | Joycelyn Acheampong' },
    { property: 'og:description', content: 'Manage weekly consultation availability.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [state, setState] = useState<'loading' | 'denied' | 'ready'>('loading');
  const [tz, setTz] = useState('America/New_York');
  const [weekly, setWeekly] = useState<Weekly>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', u.user!.id).eq('role', 'admin');
      if (!roles?.length) return setState('denied');
      const { data } = await supabase.from('availability_settings').select('time_zone, weekly').eq('id', 1).single();
      if (data) { setTz(data.time_zone); setWeekly((data.weekly ?? {}) as Weekly); }
      setState('ready');
    })();
  }, []);

  const add = (day: string) => {
    const t = draft[day];
    if (!t) return;
    setWeekly(w => ({ ...w, [day]: Array.from(new Set([...(w[day] ?? []), t])).sort() }));
    setDraft(d => ({ ...d, [day]: '' }));
  };
  const remove = (day: string, t: string) => setWeekly(w => ({ ...w, [day]: (w[day] ?? []).filter(x => x !== t) }));
  const save = async () => {
    setMsg('Saving…');
    const { error } = await supabase.from('availability_settings').update({ time_zone: tz, weekly, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) return setMsg(`Could not save: ${error.message}`);
    await qc.invalidateQueries({ queryKey: ['availability'] });
    setMsg('Saved. Visitors now see these times.');
  };
  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: '/auth' }); };

  if (state === 'loading') return <main className="shell py-20 text-muted-foreground">Loading…</main>;
  if (state === 'denied') return <main className="shell space-y-4 py-20"><h1 className="text-2xl">No admin access</h1><p className="text-muted-foreground">This account can’t change availability.</p><Button variant="outline" onClick={signOut}>Sign out</Button></main>;

  return (
    <main className="shell max-w-3xl space-y-8 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><div className="eyebrow">Admin</div><h1 className="section-title">Consultation availability</h1></div>
        <div className="flex gap-2"><Button variant="outline" asChild><Link to="/">View site</Link></Button><Button variant="ghost" onClick={signOut}>Sign out</Button></div>
      </div>
      <label className="block space-y-2 text-sm">Joycelyn’s time zone
        <select className="topic-select mt-2 w-full" value={tz} onChange={e => setTz(e.target.value)}>{TIME_ZONES.map(z => <option key={z}>{z}</option>)}</select>
      </label>
      <div className="space-y-3">
        {WEEKDAYS.map((name, i) => { const day = String(i); const times = weekly[day] ?? []; return (
          <div key={day} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base">{name}</h2>
              <div className="flex items-center gap-2"><Input type="time" aria-label={`Add time on ${name}`} className="w-36" value={draft[day] ?? ''} onChange={e => setDraft(d => ({ ...d, [day]: e.target.value }))} /><Button size="sm" variant="outline" onClick={() => add(day)}><Plus /> Add</Button></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{times.length ? times.map(t => <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm">{formatTime(t)}<button aria-label={`Remove ${formatTime(t)} on ${name}`} onClick={() => remove(day, t)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button></span>) : <span className="text-sm text-muted-foreground">Unavailable</span>}</div>
          </div>); })}
      </div>
      <div className="flex items-center gap-4"><Button variant="gold" onClick={save}>Save availability</Button>{msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}</div>
    </main>
  );
}
