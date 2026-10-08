import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { ArrowRight, ShieldCheck, HeartHandshake, Phone, Check, Shield, Heart, Sprout, BriefcaseBusiness, MapPin, Mail, Menu, X, HandCoins, CircleCheck, Users, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSuspenseQuery } from '@tanstack/react-query';
import hero from '@/assets/joycelyn-hero.jpg';
import { availabilityQuery } from '@/lib/availability.functions';
import { createChecklist } from '@/lib/checklist.functions';
import { upcomingDays, formatTime, zoneLabel } from '@/lib/availability';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Joycelyn Acheampong | Life Insurance & Legacy Planning' },
    { name: 'description', content: 'Protect your legacy with personalized life insurance, retirement planning, and business protection. Connect with Joycelyn Acheampong in Carteret, NJ.' },
    { property: 'og:title', content: 'Joycelyn Acheampong | Protect Your Legacy' },
    { property: 'og:description', content: 'Personalized life insurance guidance for individuals, families, and business owners.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(availabilityQuery),
  component: Index,
});
const services = [
  { name: 'Life Insurance', icon: Shield, copy: 'Protect the people who matter most, whatever tomorrow brings.', detail: 'Explore term life and whole life insurance with guidance tailored to your family, your priorities, and your budget.', options: ['Term Life Insurance', 'Whole Life Insurance', 'Final Expense Coverage'] },
  { name: 'Income Protection', icon: Heart, copy: 'Keep your family’s financial foundation strong through life’s changes.', detail: 'Talk through your financial commitments and explore protection options that fit your needs.', options: ['Income Protection'] },
  { name: 'Retirement & Wealth', icon: Sprout, copy: 'Plan for a comfortable tomorrow and a legacy that lasts.', detail: 'Start a conversation about your retirement goals and how you want to pass your legacy to the next generation.', options: ['Retirement Planning', 'Wealth Transfer Strategies'] },
  { name: 'Business Protection', icon: BriefcaseBusiness, copy: 'Safeguard the business you’ve built and the people behind it.', detail: 'Explore business protection plans with personalized guidance for the business you have worked hard to build.', options: ['Business Protection Plans'] },
];
const values = [
  { icon: Users, title: 'Your life. Your plan.', copy: 'Personalized recommendations, never a one-size-fits-all policy.' },
  { icon: HeartHandshake, title: 'Clarity at every step.', copy: 'Transparent, honest guidance so you can make informed decisions.' },
  { icon: HandCoins, title: 'Protection that fits.', copy: 'Flexible payment options with your priorities in mind.' },
  { icon: CircleCheck, title: 'A relationship, not a transaction.', copy: 'A simple application process and ongoing support after enrollment.' },
];
function Index() {
  const { data: availability } = useSuspenseQuery(availabilityQuery);
  const [consultation, setConsultation] = useState(false);
  const [service, setService] = useState<number | null>(null);
  const [topic, setTopic] = useState('Life Insurance');
  const [mobileMenu, setMobileMenu] = useState(false);
  const activeService = service === null ? null : services[service];
  const startConsultation = (value = 'Life Insurance') => { setTopic(value); setService(null); setConsultation(true); setMobileMenu(false); };
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState('');
  const [error, setError] = useState('');
  const days = consultation ? upcomingDays(availability) : [];
  const daySlots = days.find(d => d.label === day)?.slots ?? [];
  const zone = zoneLabel(availability.timeZone);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [prepBusy, setPrepBusy] = useState(false);
  const [prepError, setPrepError] = useState('');
  const [prepTopic, setPrepTopic] = useState('Life Insurance');
  const runChecklist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const goals = String(f.get('goals') || '').trim();
    if (goals.length < 10) { setPrepError('Tell us a little more about your goals.'); return; }
    setPrepBusy(true); setPrepError(''); setChecklist([]);
    try {
      const res = await createChecklist({ data: { goals, coverage: String(f.get('coverage') || ''), topic: prepTopic } });
      if ('error' in res && res.error) setPrepError(res.error); else if ('items' in res) setChecklist(res.items ?? []);
    } catch { setPrepError('We couldn’t create your checklist right now. Please try again later.'); }
    setPrepBusy(false);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!day || !slot) { setError('Please choose a day and time.'); return; }
    setError('');
    const data = new FormData(event.currentTarget);
    const clean = (k: string, max: number) => String(data.get(k) || '').trim().slice(0, max);
    const time = `${day} at ${formatTime(slot)} (${zone})`;
    const prep = checklist.length ? `\n\nMy preparation checklist:\n${checklist.map(i => `- ${i}`).join('\n')}` : '';
    const body = `Hello Joycelyn,\n\nI’d like to request a consultation about ${topic}.\n\nPreferred time: ${time}\n\nName: ${clean('name', 100)}\nEmail: ${clean('email', 255)}\nPhone: ${clean('phone', 30)}\n\n${clean('message', 1000)}${prep}`;
    window.location.href = `mailto:jaykorang@yahoo.com?subject=${encodeURIComponent(`Consultation request: ${day}, ${formatTime(slot)}`)}&body=${encodeURIComponent(body)}`;
  };
  return <>
    <header className="site-header">
      <div className="shell flex h-full items-center justify-between gap-4">
        <a href="#home" aria-label="Joycelyn Acheampong home" className="flex items-center gap-3"><ShieldCheck className="brand-icon" strokeWidth={1.35} /><div><div className="brand-name">Joycelyn Acheampong<span className="text-primary">.</span></div><div className="brand-caption">Life insurance & legacy planning</div></div></a>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex"><a href="#home" className="nav-link text-foreground">Home</a><a href="#services" className="nav-link">Services</a><a href="#about" className="nav-link">Why Joycelyn</a><a href="#prepare" className="nav-link">Prepare</a><a href="#contact" className="nav-link">Contact</a></nav>
        <Button variant="gold" className="hidden md:inline-flex" onClick={() => startConsultation()}>Let’s talk <ArrowRight /></Button>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={mobileMenu ? 'Close menu' : 'Open menu'} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</Button>
      </div>
      {mobileMenu && <nav aria-label="Mobile navigation" className="absolute top-[76px] z-30 flex w-full flex-col gap-5 border-b border-border bg-background p-6 md:hidden">{[['Home','home'],['Services','services'],['Why Joycelyn','about'],['Prepare','prepare'],['Contact','contact']].map(([label,id]) => <a key={id} href={`#${id}`} onClick={() => setMobileMenu(false)} className="nav-link">{label}</a>)}<Button variant="gold" onClick={() => startConsultation()}>Let’s talk <ArrowRight /></Button></nav>}
    </header>
    <main>
      <section id="home" className="hero">
        <img src={hero} alt="Joycelyn Acheampong, life insurance advisor, in front of sunlit city buildings" className="hero-image" fetchPriority="high" />
        <div className="shell hero-content"><div className="eyebrow">Your future deserves protection</div><h1>Life insurance.<br /><em>A lasting legacy.</em></h1><p className="hero-copy">Life is unpredictable. Your family’s future shouldn’t be. Find the right protection for the life you’re building—and the legacy you’ll leave.</p><div className="hero-actions"><Button variant="gold" size="hero" onClick={() => startConsultation()}>Let’s protect your legacy <ArrowRight /></Button><Button variant="heroOutline" size="hero" asChild><a href="#services">Explore services</a></Button></div><div className="hero-note"><LockKeyhole size={12} /> Personal guidance. No pressure. Just possibilities.</div></div>
        <div className="advisor-signature"><div className="signature">Joycelyn Acheampong</div><p>Licensed life insurance advisor</p></div>
      </section>
      <div className="trust-strip"><div className="shell grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4"><div className="trust-item"><ShieldCheck /> Licensed professional</div><div className="trust-item"><Users /> People-first guidance</div><div className="trust-item"><Check /> Plans tailored to you</div><div className="trust-item"><HeartHandshake /> Support that stays</div></div></div>
      <section id="services" className="section shell"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="eyebrow">Protection for every chapter</div><h2 className="section-title">Your priorities. Our starting point.</h2></div><p className="section-copy max-w-[320px]">Thoughtful solutions for your family, your future, and everything you’ve worked for.</p></div><div className="service-grid">{services.map((item,index) => <article className="service-card" key={item.name}><item.icon className="service-icon" /><h3>{item.name}</h3><p>{item.copy}</p><Button variant="link" className="service-link" onClick={() => setService(index)}>Explore options <ArrowRight size={14} /></Button></article>)}</div></section>
      <section id="about" className="section about-section"><div className="shell about-grid"><div><div className="eyebrow">A partner in your corner</div><h2 className="section-title">Real guidance.<br />Lasting peace of mind.</h2><p className="section-copy mt-5 max-w-[430px]">I’m Joycelyn Acheampong. I help individuals, families, and business owners protect what matters with life insurance solutions designed for lasting security.</p><p className="section-copy mt-4 max-w-[430px]">The right plan begins with listening. Together, we’ll find protection that reflects your life today and your hopes for tomorrow.</p><Button variant="link" className="mt-5 px-0" onClick={() => startConsultation()}>Start a conversation <ArrowRight /></Button></div><div>{values.map(item => <div className="value-row" key={item.title}><item.icon /><div><h3>{item.title}</h3><p>{item.copy}</p></div></div>)}</div></div></section>
      <section id="prepare" className="section shell"><div className="grid gap-10 md:grid-cols-2"><div><div className="eyebrow">Come prepared</div><h2 className="section-title">Your personal consultation checklist.</h2><p className="section-copy mt-5 max-w-[430px]">Share your goals and any coverage you have today. Our AI-powered assistant will suggest what to gather and what to ask, so your time with Joycelyn counts.</p><form className="consultation-form mt-6" onSubmit={runChecklist}><label>I’m interested in<select className="topic-select" value={prepTopic} onChange={e => setPrepTopic(e.target.value)}>{services.map(item => <option key={item.name}>{item.name}</option>)}<option>Not sure yet</option></select></label><label>Your insurance goals<Textarea name="goals" required maxLength={1500} rows={3} placeholder="e.g. Make sure my two kids are covered if something happens to me" /></label><label>Current coverage (optional)<Textarea name="coverage" maxLength={1500} rows={2} placeholder="e.g. $50k group life through work, no personal policy" /></label><Button variant="gold" type="submit" disabled={prepBusy}>{prepBusy ? 'Creating your checklist…' : <>Create my checklist <ArrowRight /></>}</Button>{prepError && <p role="alert" className="text-sm text-destructive">{prepError}</p>}<p className="text-xs text-muted-foreground">General preparation tips only, not insurance, legal, or tax advice.</p></form></div><div className="rounded-lg border border-border bg-card p-6" aria-live="polite">{checklist.length ? <><h3 className="text-lg">Before your consultation</h3><ul className="mt-4 space-y-3">{checklist.map(item => <li key={item} className="flex gap-3 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-primary" />{item}</li>)}</ul><Button variant="gold" className="mt-6" onClick={() => startConsultation(prepTopic === 'Not sure yet' ? 'Life Insurance' : prepTopic)}>Book with this checklist <ArrowRight /></Button></> : <p className="text-sm text-muted-foreground">{prepBusy ? 'Thinking through your situation…' : 'Your checklist will appear here.'}</p>}</div></div></section>
      <section id="contact" className="contact-section"><div className="shell flex flex-col justify-between gap-9 md:flex-row md:items-center"><div><div className="eyebrow">The first step is a conversation</div><h2 className="section-title">Let’s protect what matters.</h2><div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-6"><a href="tel:+19738966077" className="contact-detail"><Phone /> (973) 896-6077</a><a href="mailto:jaykorang@yahoo.com" className="contact-detail"><Mail /> jaykorang@yahoo.com</a></div><a className="contact-detail mt-4" href="https://www.google.com/maps/search/?api=1&query=7+Somerset+Street+Carteret+NJ" target="_blank" rel="noreferrer"><MapPin /> 7 Somerset Street, Carteret, NJ <ArrowRight size={12} /></a></div><Button variant="gold" size="hero" onClick={() => startConsultation()}>Request a consultation <ArrowRight /></Button></div></section>
    </main>
    <footer><div className="shell flex flex-col justify-between gap-4 sm:flex-row"><p>© {new Date().getFullYear()} Joycelyn Acheampong. All rights reserved.</p><p>Your family. Your future. Your legacy.</p></div><p className="shell mt-4 text-[10px]">Coverage and eligibility are subject to policy terms and insurer approval.</p></footer>
    <Dialog open={activeService !== null} onOpenChange={open => { if (!open) setService(null); }}><DialogContent className="max-w-[calc(100%-32px)] sm:max-w-lg">{activeService && <><activeService.icon className="text-primary" size={30} /><DialogTitle>{activeService.name}</DialogTitle><DialogDescription>{activeService.detail}</DialogDescription><ul className="my-3 space-y-3">{activeService.options.map(option => <li className="flex items-center gap-3 text-sm" key={option}><Check size={16} className="text-primary" />{option}</li>)}</ul><Button variant="gold" onClick={() => startConsultation(activeService.name)}>Discuss my options <ArrowRight /></Button></>}</DialogContent></Dialog>
    <Dialog open={consultation} onOpenChange={setConsultation}><DialogContent className="max-h-[90vh] max-w-[calc(100%-32px)] overflow-y-auto sm:max-w-lg"><DialogTitle>Book a consultation.</DialogTitle><DialogDescription>Choose a time that suits you. Joycelyn will confirm your appointment.</DialogDescription><form className="consultation-form" onSubmit={submit}><fieldset className="space-y-2"><legend className="mb-2 text-sm">Choose a day</legend>{!days.length && <p className="text-xs text-muted-foreground">No open times right now. Please call (973) 896-6077.</p>}<div className="grid grid-cols-5 gap-2">{days.map(d => <Button key={d.label} type="button" size="sm" variant={day === d.label ? 'gold' : 'outline'} className="h-auto flex-col py-2 text-xs" aria-pressed={day === d.label} onClick={() => { setDay(d.label); setSlot(''); }}><span>{d.weekday}</span><span>{d.date}</span></Button>)}</div></fieldset><fieldset><legend className="mb-2 text-sm">Choose a time ({zone})</legend>{!day ? <p className="text-xs text-muted-foreground">Pick a day to see open times.</p> : <div className="grid grid-cols-3 gap-2">{daySlots.map(s => <Button key={s} type="button" size="sm" variant={slot === s ? 'gold' : 'outline'} aria-pressed={slot === s} onClick={() => setSlot(s)}>{formatTime(s)}</Button>)}</div>}{error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}</fieldset><label>Your name<Input name="name" placeholder="Full name" required maxLength={100} autoComplete="name" /></label><label>Email address<Input name="email" type="email" placeholder="you@example.com" required maxLength={255} autoComplete="email" /></label><label>Phone number<Input name="phone" type="tel" placeholder="(555) 555-5555" required maxLength={30} autoComplete="tel" /></label><label>I’m interested in<select className="topic-select" value={topic} onChange={event => setTopic(event.target.value)}>{services.map(item => <option key={item.name}>{item.name}</option>)}<option>Not sure yet</option></select></label><label>What’s on your mind? <Textarea name="message" placeholder="Tell me a little about your goals (optional)" rows={3} /></label><Button variant="gold" type="submit">Request this time <Mail /></Button><p className="text-center text-xs text-muted-foreground">Opens your email app with your request ready to send.{checklist.length ? ' Your checklist is included.' : ''} Your time is confirmed once Joycelyn replies.</p></form><div className="flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">Prefer a call? <a href="tel:+19738966077" className="text-primary">(973) 896-6077</a></div></DialogContent></Dialog>
  </>;
}
