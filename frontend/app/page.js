'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const S = {
  bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
  accent: '#4F8CFF', accentDark: '#3a7aef', border: '#2A3142',
  textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

export default function LandingPage() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: S.bg,
      fontFamily: 'var(--font-family)', color: S.textPrimary,
      overflowX: 'hidden'
    }}>

      {/* Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            number: { value: 40, density: { enable: true, area: 900 } },
            color: { value: ['#4F8CFF', '#818cf8'] },
            shape: { type: 'circle' },
            opacity: { value: 0.15, animation: { enable: true, speed: 0.5, minimumValue: 0.05 } },
            size: { value: { min: 1, max: 2 } },
            links: { enable: true, distance: 150, color: '#4F8CFF', opacity: 0.05, width: 1 },
            move: { enable: true, speed: 0.4, random: true, outModes: { default: 'bounce' } }
          },
          interactivity: {
            events: { onHover: { enable: true, mode: 'repulse' } },
            modes: { repulse: { distance: 80, duration: 0.4 } }
          },
          detectRetina: true
        }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Glow blobs */}
      <div style={{
        position: 'fixed', top: '-200px', left: '-200px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,140,255,0.07) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-200px', right: '-100px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── NAVBAR ── */}
        <nav style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px', height: '64px',
          background: 'rgba(22,26,34,0.8)',
          borderBottom: `1px solid ${S.border}`,
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 16px rgba(79,140,255,0.35)`
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>O</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em' }}>
              <span style={{ color: S.textPrimary }}>Our</span><span style={{ color: S.accent }}>ivo</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" style={{
              padding: '7px 18px',
              background: 'transparent',
              border: `1px solid ${S.border}`,
              borderRadius: '8px',
              color: S.textSecondary,
              fontSize: '13px', fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 180ms ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSecondary; }}
            >
              Sign in
            </Link>
            <Link href="/register" style={{
              padding: '7px 18px',
              background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
              boxShadow: `0 4px 14px rgba(79,140,255,0.3)`,
              transition: 'all 180ms ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 20px rgba(79,140,255,0.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px rgba(79,140,255,0.3)`; }}
            >
              Start Free Trial
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          padding: '110px 48px 90px',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto',
          animation: 'fadeUp 0.5s ease forwards'
        }}>

          <h1 style={{
            fontSize: '56px', fontWeight: 800,
            color: S.textPrimary, lineHeight: 1.12,
            letterSpacing: '-0.03em', marginBottom: '24px'
          }}>
            Your AI sales assistant<br />
            <span style={{
              background: `linear-gradient(135deg, ${S.accent}, #818cf8)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              that never sleeps.
            </span>
          </h1>

          <p style={{
            fontSize: '18px', color: S.textSecondary,
            lineHeight: 1.75, marginBottom: '44px',
            maxWidth: '580px', margin: '0 auto 44px'
          }}>
            Ourivo captures every WhatsApp lead, qualifies them automatically, and follows up so you never lose a deal to a missed message again.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              padding: '15px 36px',
              background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
              borderRadius: '12px', color: 'white',
              fontSize: '15px', fontWeight: 700,
              textDecoration: 'none',
              boxShadow: `0 4px 24px rgba(79,140,255,0.35)`,
              transition: 'all 180ms ease',
              display: 'inline-block', letterSpacing: '0.01em'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 32px rgba(79,140,255,0.45)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px rgba(79,140,255,0.35)`; }}
            >
              Start Free — 14 days free trial
            </Link>
            <Link href="/login" style={{
              padding: '15px 36px',
              background: 'transparent',
              border: `1px solid ${S.border}`,
              borderRadius: '12px', color: S.textSecondary,
              fontSize: '15px', fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 180ms ease',
              display: 'inline-block'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSecondary; }}
            >
              Sign in →
            </Link>
          </div>

          <p style={{ marginTop: '20px', fontSize: '12px', color: S.textMuted }}>
            No credit card required · ₹1,999/month after trial · Cancel anytime
          </p>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: '0 48px 80px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { value: '24/7', label: 'Automatic lead capture', sub: 'Even at 2 AM' },
              { value: '< 3s', label: 'Response time', sub: 'Faster than any human' },
              { value: '0', label: 'Leads missed', sub: 'Every inquiry captured' },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: '16px',
                textAlign: 'center',
                transition: 'all 200ms ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '38px', fontWeight: 800, color: S.accent, letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: S.textPrimary, marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ fontSize: '12px', color: S.textMuted }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: '80px 48px', background: S.surface, borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em', marginBottom: '12px' }}>
                Everything you need to close more deals
              </h2>
              <p style={{ fontSize: '15px', color: S.textSecondary, maxWidth: '500px', margin: '0 auto' }}>
                One platform that handles your entire lead pipeline — from first WhatsApp message to closed deal.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { icon: '🤖', title: 'AI WhatsApp Chatbot', desc: 'Automatically replies to every inquiry. Asks the right questions — budget, location, BHK — and qualifies leads before you even wake up.', color: '#4F8CFF' },
                { icon: '🔥', title: 'Lead Scoring', desc: 'Every lead is scored Hot, Warm, or Cold automatically. Focus your energy on leads most likely to convert — never waste time on tyre-kickers.', color: '#f97316' },
                { icon: '🔄', title: 'Follow-up Automation', desc: 'Leads that go silent get automatic follow-ups at Day 1, Day 3, and Day 7. Customizable messages that feel personal, not robotic.', color: '#a78bfa' },
                { icon: '📊', title: 'Lead Dashboard', desc: 'Every lead in one place. See who inquired, what they need, when they messaged. Update status from New to Converted in one click.', color: '#34d399' },
                { icon: '⚡', title: 'Instant Notifications', desc: 'Get a WhatsApp and email notification the moment a new lead arrives — with their name, budget, and requirements.', color: '#f59e0b' },
                { icon: '💬', title: 'Full Conversation History', desc: 'Every message between your chatbot and the lead is saved. See exactly what was said, when, and what they need.', color: '#818cf8' },
              ].map((feature, i) => (
                <div key={i} style={{
                  padding: '28px',
                  background: S.surface2,
                  border: `1px solid ${S.border}`,
                  borderRadius: '16px',
                  transition: 'all 200ms ease'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = feature.color + '44'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.15)`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: feature.color + '18', border: `1px solid ${feature.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: S.textPrimary, marginBottom: '10px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '13px', color: S.textSecondary, lineHeight: 1.7 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Up and running in 5 minutes
            </h2>
            <p style={{ fontSize: '15px', color: S.textSecondary, marginBottom: '56px' }}>
              No technical knowledge needed. No complicated setup.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { step: '01', title: 'Create your account', desc: 'Sign up with your business name and email. Your 14-day free trial starts immediately.' },
                { step: '02', title: 'Customize your chatbot', desc: 'Set your greeting, qualifying questions, and AI response rules. Takes 3 minutes.' },
                { step: '03', title: 'Share your WhatsApp number', desc: 'Give leads your WhatsApp number. Every message is captured, qualified, and shown in your dashboard automatically.' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '20px',
                  padding: '24px', background: S.surface,
                  border: `1px solid ${S.border}`, borderRadius: '16px',
                  textAlign: 'left', transition: 'all 200ms ease'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.25)'; e.currentTarget.style.transform = 'translateX(6px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, rgba(79,140,255,0.15), rgba(99,102,241,0.1))`, border: `1px solid rgba(79,140,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 800, color: S.accent, letterSpacing: '0.05em' }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: S.textPrimary, marginBottom: '6px' }}>{item.title}</h3>
                    <p style={{ fontSize: '13px', color: S.textSecondary, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ── */}
        <section style={{ padding: '80px 48px', background: S.surface, borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
          <div style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginBottom: '24px' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: '#fbbf24', fontSize: '20px' }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: '19px', color: S.textSecondary, lineHeight: 1.8, marginBottom: '32px', fontStyle: 'italic' }}>
              "I was losing 5–6 leads every night. Customers would message at 10 PM and by morning they had already gone to another agent. Now my chatbot handles everything. I wake up to qualified leads ready to visit."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${S.accent}, #818cf8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 700 }}>R</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: S.textPrimary }}>Rahul Sharma</div>
                <div style={{ fontSize: '12px', color: S.textMuted }}>Senior Property Consultant, Bangalore</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Simple, honest pricing
            </h2>
            <p style={{ fontSize: '15px', color: S.textSecondary, marginBottom: '40px' }}>
              One plan. Everything included. No surprises.
            </p>

            <div style={{ padding: '40px', background: S.surface, border: `1px solid rgba(79,140,255,0.25)`, borderRadius: '24px', boxShadow: '0 0 60px rgba(79,140,255,0.06)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', background: `linear-gradient(135deg, rgba(79,140,255,0.12), rgba(99,102,241,0.08))`, border: `1px solid rgba(79,140,255,0.2)`, marginBottom: '24px' }}>
                <span style={{ color: S.accent, fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pro Plan</span>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '52px', fontWeight: 800, color: S.textPrimary, letterSpacing: '-0.03em' }}>₹1,999</span>
                <span style={{ fontSize: '15px', color: S.textMuted }}>/month</span>
              </div>
              <p style={{ fontSize: '13px', color: S.textMuted, marginBottom: '32px' }}>14-day free trial · No credit card required</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', textAlign: 'left' }}>
                {[
                  'WhatsApp AI chatbot — active 24/7',
                  'Unlimited lead capture',
                  'Automated follow-ups at Day 1, 3, 7',
                  'AI lead scoring — Hot, Warm, Cold',
                  'Lead dashboard with full conversation history',
                  'Instant WhatsApp + email notifications',
                  'Chatbot sandbox to preview responses',
                  'Email support',
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', color: '#34d399' }}>✓</div>
                    <span style={{ fontSize: '13px', color: S.textSecondary }}>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" style={{
                display: 'block', padding: '14px',
                background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
                borderRadius: '12px', color: 'white',
                fontSize: '15px', fontWeight: 700,
                textDecoration: 'none', textAlign: 'center',
                boxShadow: `0 4px 20px rgba(79,140,255,0.3)`,
                transition: 'all 180ms ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(79,140,255,0.4)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(79,140,255,0.3)`; }}
              >
                Start Free Trial →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding: '32px 48px', borderTop: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '11px' }}>O</span>
            </div>
            <span style={{ fontSize: '13px' }}>
              <span style={{ color: S.textMuted }}>Our</span><span style={{ color: S.accent }}>ivo</span><span style={{ color: S.textMuted }}> © 2025</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="mailto:support@ourivo.com" style={{ color: S.textMuted, fontSize: '13px', textDecoration: 'none' }}>support@ourivo.com</a>
            <Link href="/login" style={{ color: S.textMuted, fontSize: '13px', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ color: S.textMuted, fontSize: '13px', textDecoration: 'none' }}>Get started</Link>
          </div>
        </footer>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}