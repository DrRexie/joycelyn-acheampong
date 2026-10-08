import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Admin sign in | Joycelyn Acheampong' },
    { name: 'description', content: 'Sign in to manage consultation availability.' },
    { property: 'og:title', content: 'Admin sign in | Joycelyn Acheampong' },
    { property: 'og:description', content: 'Sign in to manage consultation availability.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email')), password = String(f.get('password'));
    setBusy(true); setMsg('');
    if (mode === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg(error.message);
      navigate({ to: '/admin' });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setBusy(false);
      if (error) return setMsg(error.message);
      if (data.session) navigate({ to: '/admin' });
      else setMsg('Check your email to confirm your account, then sign in.');
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="text-center"><ShieldCheck className="mx-auto text-primary" /><h1 className="mt-3 text-2xl">{mode === 'in' ? 'Admin sign in' : 'Create admin account'}</h1></div>
        <form className="consultation-form" onSubmit={submit}>
          <label>Email<Input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<Input name="password" type="password" required minLength={8} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} /></label>
          <Button variant="gold" type="submit" disabled={busy}>{mode === 'in' ? 'Sign in' : 'Create account'}</Button>
          {msg && <p role="status" className="text-center text-sm text-muted-foreground">{msg}</p>}
        </form>
        <Button variant="link" className="w-full" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(''); }}>{mode === 'in' ? 'Need an account? Create one' : 'Have an account? Sign in'}</Button>
        <Link to="/" className="block text-center text-xs text-muted-foreground">Back to website</Link>
      </div>
    </main>
  );
}
