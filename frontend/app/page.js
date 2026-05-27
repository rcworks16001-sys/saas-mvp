'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE THESE IF NEEDED
// ─────────────────────────────────────────────────────────────────────────────
const SITE = {
  registerUrl: '/register',
  loginUrl: '/login',
  contactUrl: '/contact',
  price: '₹1,999',
  trialDays: 14,
  stats: {
    leads: '2,400+',
    agents: '47',
    response: '< 30s',
  },
}
// ─────────────────────────────────────────────────────────────────────────────

// Analytics — calls posthog if available, silently skips if not
const track = (event, props = {}) => {
  try { window?.posthog?.capture(event, { ...props, page: 'landing' }) } catch { }
}

// Scroll-reveal hook
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ── Data ──────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'AI Lead Capture', '24/7 WhatsApp Bot', 'Instant Brochures',
  'Hot Lead Scoring', 'Auto Follow-ups', 'Inventory by WhatsApp',
  `${SITE.price}/month`, `${SITE.trialDays}-Day Free Trial`,
  'No Credit Card', 'Made in India',
]

const FEATURES = [
  { icon: '🤖', title: '24/7 AI Chatbot', desc: 'Replies to buyers in seconds — midnight, Sunday, public holiday. You never miss a lead.', accent: 'var(--yellow)' },
  { icon: '📄', title: 'Instant Brochures', desc: 'Buyer describes requirements. AI matches listings. Branded PDF sent in under 30 seconds.', accent: 'var(--green)' },
  { icon: '🔥', title: 'Lead Scoring', desc: 'Every lead scored Hot, Warm, or Cold automatically. Know who to call first, every morning.', accent: 'var(--yellow)' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'New lead? WhatsApp ping in seconds. Hot lead scored? Urgent notification immediately.', accent: 'var(--green)' },
  { icon: '🔄', title: 'Auto Follow-ups', desc: 'Cold leads get automatic follow-ups on Day 1, 3, and 7. Close deals you would have forgotten.', accent: 'var(--yellow)' },
  { icon: '🏢', title: 'Inventory by WhatsApp', desc: 'Add and update listings by texting your own number. No forms. No dashboard login needed.', accent: 'var(--green)' },
]

const PLAN_FEATURES = [
  '24/7 AI WhatsApp chatbot',
  'Instant property brochures',
  'Hot / Warm / Cold lead scoring',
  'WhatsApp & email notifications',
  'Day 1 / 3 / 7 follow-up automation',
  'Inventory management via WhatsApp',
  'Full conversation history',
  'Lead dashboard & search',
]

const PRO_EXTRAS = [
  'Priority WhatsApp support',
  'Your own WhatsApp number',
  'Unlimited lead history',
  'Advanced analytics dashboard',
  'Early access to new features',
]

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 62, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 40px',
      background: scrolled ? 'rgba(255,255,255,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent',
      transition: 'all 0.28s',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Image src="/logo.png" alt="Ourivo logo" width={34} height={34} style={{ borderRadius: 8 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: 1.5 }}>OURIVO</span>
      </Link>

      <div style={{ display: 'flex', gap: 4 }}>
        {[['#how-it-works', 'How it works'], ['#features', 'Features'], ['#pricing', 'Pricing'], ['/help', 'Help']].map(([href, label]) => (
          <a key={href} href={href}
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--ash)', textDecoration: 'none', padding: '7px 14px', borderRadius: 'var(--r-nav)', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.target.style.background = 'var(--mist)'; e.target.style.color = 'var(--ink)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--ash)' }}>
            {label}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link href={SITE.loginUrl}
          onClick={() => track('login_clicked')}
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--ash)', textDecoration: 'none', padding: '9px 18px', borderRadius: 'var(--r-btn)', border: '1.5px solid #d4d8de', transition: 'all 0.18s' }}>
          Sign in
        </Link>
        <Link href={SITE.registerUrl}
          onClick={() => track('cta_clicked', { position: 'navbar' })}
          style={{ fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: 'var(--r-btn)', background: 'var(--ink)', transition: 'opacity 0.18s' }}>
          Start free trial →
        </Link>
      </div>
    </nav>
  )
}

// ── Mini dashboard (hero visual) ──────────────────────────────────────────────
function MiniDashboard() {
  const leads = [
    { init: 'AS', name: 'Arjun Sharma', req: '3BHK · Velachery · ₹45L', hot: true },
    { init: 'KR', name: 'Karthik Rajan', req: '4BHK · OMR · ₹85L', hot: true },
    { init: 'PN', name: 'Priya Nair', req: '2BHK · Anna Nagar · ₹32L', hot: false },
  ]
  return (
    <div style={{ background: '#fff', borderRadius: 28, border: '1px solid #d4d8de', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.10)' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--mist)', borderBottom: '1px solid #e8e8e8', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'var(--ink)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: '#fff' }}>O</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>OURIVO</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Dashboard', 'Leads', 'Inventory'].map((t, i) => (
            <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 6, background: i === 0 ? 'var(--ink)' : 'transparent', color: i === 0 ? '#fff' : 'var(--ash)' }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 12, borderBottom: '1px solid #f0f0f0' }}>
        {[['47', 'Total Leads'], ['8', 'Hot Leads'], ['14', 'Brochures']].map(([n, l]) => (
          <div key={l} style={{ background: 'var(--mist)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{n}</div>
            <div style={{ fontSize: 10, color: 'var(--fog)', fontWeight: 500, marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>
      {/* Lead rows */}
      {leads.map((lead, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: i < 2 ? '1px solid #f7f7f7' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: lead.hot ? 'var(--yellow)' : 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{lead.init}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{lead.name}</div>
              <div style={{ fontSize: 10, color: 'var(--fog)', marginTop: 2 }}>{lead.req}</div>
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: lead.hot ? 'var(--yellow)' : 'var(--green)', color: 'var(--ink)' }}>
            {lead.hot ? '🔥 Hot' : '✳ Warm'}
          </span>
        </div>
      ))}
      {/* Toast */}
      <div style={{ margin: '8px 12px 10px', background: 'var(--ink)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>
          Brochure sent to <strong style={{ color: 'var(--green)' }}>Arjun Sharma</strong> — Prestige Park 3BHK
        </div>
      </div>
    </div>
  )
}

// ── WhatsApp bubble ───────────────────────────────────────────────────────────
function WaBubble() {
  const msgs = [
    { from: 'buyer', text: 'Hi, looking for 3BHK in Velachery 🏠' },
    { from: 'bot', text: "Great! What's your budget? 😊" },
    { from: 'buyer', text: 'Around 45 lakhs, ready to move' },
    { from: 'bot', text: '📄 Sending 3 matching properties now...' },
  ]
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', padding: '12px 14px', width: 255, boxShadow: '0 8px 32px rgba(0,0,0,0.11)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f5f5f5' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💬</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700 }}>Sharma Properties</div>
          <div style={{ fontSize: 9, color: '#25D366', fontWeight: 600 }}>● AI bot — online</div>
        </div>
      </div>
      {msgs.map((m, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: m.from === 'buyer' ? 'flex-start' : 'flex-end', marginBottom: 6 }}>
          <div style={{
            background: m.from === 'buyer' ? '#f0f0f0' : '#dcf8c6',
            borderRadius: m.from === 'buyer' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
            padding: '7px 11px', maxWidth: '82%', fontSize: 11, color: '#111', lineHeight: 1.4,
          }}>
            {m.text}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])
  const s = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'none' : 'translateY(24px)',
    transition: `opacity 0.8s ${delay}s var(--ease), transform 0.8s ${delay}s var(--ease)`,
  })

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '128px 40px 80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

        {/* Left */}
        <div>
          <div style={{ ...s(0), display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <div className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ink)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AI-powered WhatsApp lead capture
            </span>
          </div>

          <h1 style={{ ...s(0.08), fontFamily: 'var(--font-display)', fontSize: 'clamp(60px, 7.5vw, 90px)', lineHeight: 0.91, letterSpacing: -2, color: 'var(--ink)', marginBottom: 24 }}>
            NEVER MISS<br />A LEAD<br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              AGAIN.
              <span style={{ position: 'absolute', bottom: 6, left: 0, right: 0, height: 12, background: 'var(--yellow)', zIndex: -1, borderRadius: 2 }} />
            </span>
          </h1>

          <p style={{ ...s(0.18), fontSize: 17, color: 'var(--ash)', lineHeight: 1.65, marginBottom: 36, maxWidth: 440 }}>
            Your AI bot captures and qualifies real estate buyers on WhatsApp —{' '}
            <strong style={{ color: 'var(--ink)' }}>24 hours a day, 7 days a week.</strong>{' '}
            Wake up to a full pipeline of hot leads, ready to close.
          </p>

          <div style={{ ...s(0.26), display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={SITE.registerUrl}
              onClick={() => track('cta_clicked', { position: 'hero_primary' })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', padding: '13px 28px', borderRadius: 'var(--r-btn)', fontSize: 14, fontWeight: 700 }}>
              Start free {SITE.trialDays}-day trial →
            </Link>
            <a href="#how-it-works"
              onClick={() => track('cta_clicked', { position: 'hero_secondary' })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ash)', textDecoration: 'none', padding: '13px 26px', borderRadius: 'var(--r-btn)', border: '1.5px solid #d4d8de', fontSize: 14, fontWeight: 600 }}>
              See how it works
            </a>
          </div>

          <p style={{ ...s(0.32), fontSize: 12, color: 'var(--fog)', marginTop: 16 }}>
            No credit card required · Setup in 5 minutes · Cancel anytime
          </p>

          <div style={{ ...s(0.4), display: 'flex', gap: 32, paddingTop: 28, borderTop: '1px solid #e0e0e0', marginTop: 32 }}>
            {[
              [SITE.stats.leads, 'Leads captured'],
              [SITE.stats.agents, 'Agents trust us'],
              [SITE.stats.response, 'Bot response time'],
            ].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: -0.5 }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--fog)', fontWeight: 500, marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="float-anim" style={{ position: 'relative' }}>
          <MiniDashboard />
          <div style={{ position: 'absolute', bottom: -16, left: -28, zIndex: 10 }}>
            <WaBubble />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker() {
  const all = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div style={{ background: 'var(--ink)', padding: '14px 0', overflow: 'hidden' }} aria-hidden="true">
      <div className="marquee-track">
        {all.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: '#fff', letterSpacing: 1.5, padding: '0 24px', whiteSpace: 'nowrap' }}>{item}</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)', flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Problem ───────────────────────────────────────────────────────────────────
function Problem() {
  const [ref, visible] = useReveal()
  const problems = [
    { icon: '😴', title: 'Midnight inquiry. No reply.', body: "A buyer messages at 11pm. You're asleep. They message the next agent. Deal gone — and you never knew." },
    { icon: '📵', title: 'Follow-up forgotten.', body: "You spoke to a warm lead Tuesday. By Friday you've moved on. They've signed with another agent." },
    { icon: '🐢', title: 'Property info takes hours.', body: "Buyer asks for listings. You manually compile a PDF. By the time you send it, they've lost interest." },
  ]
  return (
    <section style={{ background: 'var(--ink)', padding: '96px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fog)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>The problem</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px,6vw,72px)', color: '#fff', lineHeight: 0.91, letterSpacing: -1.5, marginBottom: 56 }}>
            YOU&apos;RE LOSING DEALS<br />WHILE YOU SLEEP.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {problems.map((p, i) => (
            <div key={i} className={`reveal reveal-d${i + 1} ${visible ? 'visible' : ''}`}
              style={{ background: '#0d0d0d', borderRadius: 24, padding: 28, border: '1px solid #1c1c1c' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', letterSpacing: 0.3, marginBottom: 10, lineHeight: 1.1 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--fog)', lineHeight: 1.65 }}>{p.body}</p>
              <div style={{ marginTop: 20, width: 32, height: 3, background: 'var(--yellow)', borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const [ref, visible] = useReveal()
  const steps = [
    { num: '01', icon: '💬', title: 'Buyer messages your WhatsApp', body: 'A buyer messages your number at any hour. The AI bot responds within seconds, automatically.', tag: 'Instant', tagBg: 'var(--yellow)', tagColor: 'var(--ink)' },
    { num: '02', icon: '🧠', title: 'AI qualifies and scores the lead', body: 'Bot asks your questions — budget, location, BHK. Captures contact details and scores Hot, Warm, or Cold.', tag: 'Automatic', tagBg: 'var(--green)', tagColor: 'var(--ink)' },
    { num: '03', icon: '📨', title: 'Brochure sent. Lead in your dashboard.', body: 'AI matches listings and sends a branded PDF brochure. You get a WhatsApp alert with full lead details.', tag: 'Done', tagBg: 'var(--ink)', tagColor: '#fff' },
  ]
  return (
    <section id="how-it-works" style={{ padding: '96px 40px', background: 'var(--ice)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>How it works</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,5.5vw,66px)', color: 'var(--ink)', lineHeight: 0.91, letterSpacing: -1.5 }}>
            THREE STEPS TO A<br />FULL PIPELINE.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {steps.map((step, i) => (
            <div key={i} className={`reveal reveal-d${i + 1} ${visible ? 'visible' : ''}`}
              style={{ background: '#fff', borderRadius: 'var(--r-card)', padding: 32, border: '1px solid #d4d8de', position: 'relative', transition: 'border-color 0.22s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#d4d8de'}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, color: 'var(--ice)', letterSpacing: -2, lineHeight: 1, marginBottom: 14 }}>{step.num}</div>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{step.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 0.3, marginBottom: 12, lineHeight: 1.1 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ash)', lineHeight: 1.65 }}>{step.body}</p>
              <div style={{ marginTop: 24, display: 'inline-block', background: step.tagBg, color: step.tagColor, borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
                {step.tag}
              </div>
              {i < 2 && (
                <div style={{ position: 'absolute', top: '50%', right: -13, transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--fog)', zIndex: 1 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const [ref, visible] = useReveal()
  return (
    <section id="features" style={{ padding: '96px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Features</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,5.5vw,66px)', color: 'var(--ink)', lineHeight: 0.91, letterSpacing: -1.5 }}>
            EVERYTHING YOU NEED<br />TO CLOSE MORE DEALS.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`reveal reveal-d${(i % 3) + 1} ${visible ? 'visible' : ''}`}
              style={{ background: 'var(--mist)', borderRadius: 24, padding: 28, border: '1px solid var(--ice)', transition: 'all 0.22s', cursor: 'default' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--ink)'
                e.currentTarget.querySelector('.fc-t').style.color = '#fff'
                e.currentTarget.querySelector('.fc-d').style.color = 'var(--fog)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--mist)'
                e.currentTarget.querySelector('.fc-t').style.color = 'var(--ink)'
                e.currentTarget.querySelector('.fc-d').style.color = 'var(--ash)'
              }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ width: 28, height: 4, background: f.accent, borderRadius: 2, marginBottom: 16 }} />
              <h3 className="fc-t" style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 0.3, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.1, transition: 'color 0.22s' }}>{f.title}</h3>
              <p className="fc-d" style={{ fontSize: 13, color: 'var(--ash)', lineHeight: 1.65, transition: 'color 0.22s' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const [ref, visible] = useReveal()
  useEffect(() => { if (visible) track('pricing_viewed') }, [visible])
  return (
    <section id="pricing" style={{ padding: '96px 40px', background: 'var(--ice)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Pricing</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,5.5vw,66px)', color: 'var(--ink)', lineHeight: 0.91, letterSpacing: -1.5, marginBottom: 16 }}>
            ONE PLAN.<br />EVERYTHING INCLUDED.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ash)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            No feature tiers. No hidden limits. Every agent gets the full product from day one.
          </p>
        </div>

        <div className={`reveal reveal-d2 ${visible ? 'visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Free trial */}
          <div style={{ background: '#fff', borderRadius: 'var(--r-card)', padding: 36, border: '1px solid #d4d8de' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 12 }}>Free Trial</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 60, letterSpacing: -2, lineHeight: 0.88, color: 'var(--ink)', marginBottom: 8 }}>₹0</div>
            <div style={{ fontSize: 13, color: 'var(--fog)', marginBottom: 28 }}>{SITE.trialDays} days · No credit card required</div>
            <Link href={SITE.registerUrl}
              onClick={() => track('cta_clicked', { position: 'pricing_trial' })}
              style={{ display: 'flex', justifyContent: 'center', padding: 12, borderRadius: 'var(--r-btn)', border: '1.5px solid #d4d8de', fontSize: 13, fontWeight: 600, color: 'var(--ash)', textDecoration: 'none', marginBottom: 28 }}>
              Start free trial
            </Link>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Includes</div>
            {PLAN_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--ash)' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Pro */}
          <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-card)', padding: 36, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 22, right: 22, background: 'var(--yellow)', borderRadius: 20, padding: '4px 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--ink)' }}>MOST POPULAR</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 12 }}>Pro Plan</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 60, letterSpacing: -2, lineHeight: 0.88, color: '#fff', marginBottom: 8 }}>{SITE.price}</div>
            <div style={{ fontSize: 13, color: 'var(--fog)', marginBottom: 28 }}>per month · pay via UPI or card</div>
            <Link href={SITE.registerUrl}
              onClick={() => track('cta_clicked', { position: 'pricing_pro' })}
              style={{ display: 'flex', justifyContent: 'center', padding: 12, borderRadius: 'var(--r-btn)', background: 'var(--green)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none', marginBottom: 28 }}>
              Get started now →
            </Link>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Everything in trial, plus</div>
            {PRO_EXTRAS.map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--fog)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  const [ref, visible] = useReveal()
  return (
    <section style={{ padding: '96px 40px', background: 'var(--ink)', textAlign: 'center' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <div className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fog)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ready to start</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,7vw,82px)', color: '#fff', lineHeight: 0.91, letterSpacing: -2, marginBottom: 20 }}>
            CLOSE MORE DEALS<br />
            <span style={{ color: 'var(--green)' }}>STARTING TONIGHT.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--fog)', lineHeight: 1.65, marginBottom: 40, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Your AI bot is ready the moment you sign up. No technical setup. No waiting. Just more deals.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href={SITE.registerUrl}
              onClick={() => track('cta_clicked', { position: 'final_cta' })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', padding: '15px 34px', borderRadius: 'var(--r-btn)', fontSize: 15, fontWeight: 700 }}>
              Start your {SITE.trialDays}-day free trial →
            </Link>
            <Link href={SITE.contactUrl}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--fog)', textDecoration: 'none', padding: '15px 24px', borderRadius: 'var(--r-btn)', border: '1.5px solid #333', fontSize: 13, fontWeight: 600 }}>
              Talk to us first
            </Link>
          </div>
          <p style={{ fontSize: 12, color: '#444', marginTop: 20 }}>
            No credit card · {SITE.trialDays} days free · Setup in 5 minutes
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { label: 'Product', links: [['#features', 'Features'], ['#pricing', 'Pricing'], ['/help', 'Help'], ['/feedback', 'Feedback']] },
    { label: 'Company', links: [['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms']] },
    { label: 'Contact', links: [['mailto:support@ourivo.com', 'support@ourivo.com'], ['https://wa.me/15556382558', 'WhatsApp us']] },
  ]
  return (
    <footer style={{ background: '#090909', borderTop: '1px solid #181818', padding: '56px 40px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Image src="/logo.png" alt="Ourivo logo" width={32} height={32} style={{ borderRadius: 8 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', letterSpacing: 1.5 }}>OURIVO</span>
            </div>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, maxWidth: 280 }}>
              AI-powered WhatsApp lead capture for Indian real estate agents. Never miss a lead again.
            </p>
            <div style={{ marginTop: 20, fontSize: 12, color: '#333' }}>Made with ❤️ in India 🇮🇳</div>
          </div>
          {cols.map(col => (
            <div key={col.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>{col.label}</div>
              {col.links.map(([href, label]) => (
                <Link key={label} href={href}
                  style={{ display: 'block', fontSize: 13, color: '#555', textDecoration: 'none', marginBottom: 10, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: '#444' }}>© 2025 Ourivo Technologies. All rights reserved.</div>
          <div style={{ fontSize: 12, color: '#444' }}>
            Analytics by{' '}
            <Link href="/privacy" style={{ color: '#666', textDecoration: 'underline' }}>PostHog</Link>
            {' '}· We never sell your data.
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    track('page_viewed', { page: 'landing' })
  }, [])

  return (
    <div style={{ background: 'var(--ice)', overflowX: 'hidden' }}>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Problem />
        <HowItWorks />
        <Features />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}