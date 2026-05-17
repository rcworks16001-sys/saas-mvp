'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const S = {
  bg: '#0F1115',
  surface: '#161A22',
  surface2: '#1C2130',
  accent: '#4F8CFF',
  accentHover: '#3a7ae8',
  border: '#2A3142',
  textPrimary: '#F5F7FA',
  textSecondary: '#9AA4B2',
  textMuted: '#5C6A7E',
};

const features = [
  {
    icon: '🤖',
    title: 'AI WhatsApp Chatbot',
    desc: 'Capture and qualify leads 24/7 automatically. Never miss an inquiry again — even at midnight.',
  },
  {
    icon: '📊',
    title: 'Lead Dashboard',
    desc: 'Every lead in one place. Track status, view conversation history, and follow up instantly.',
  },
  {
    icon: '📧',
    title: 'Email Marketing',
    desc: 'Send campaigns, drip sequences, and broadcasts to your entire customer base in minutes.',
  },
  {
    icon: '🔔',
    title: 'Instant Notifications',
    desc: 'Get WhatsApp alerts the moment a new lead is captured — so you never respond late again.',
  },
  {
    icon: '⚙️',
    title: 'Custom Chatbot Setup',
    desc: 'Configure your chatbot questions and greeting for your exact business — no coding needed.',
  },
  {
    icon: '📈',
    title: 'Analytics & Insights',
    desc: 'Understand your leads, campaigns, and conversions with a clear AI-powered dashboard.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    desc: 'Perfect for solo agents and small shops',
    features: ['1 WhatsApp chatbot', 'Lead dashboard', 'Instant notifications', '100 leads/month'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹2,999',
    desc: 'For growing businesses that need more',
    features: ['3 chatbots', 'Email marketing', 'CRM pipeline', 'Unlimited leads', 'Priority support'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '₹9,999',
    desc: 'Full platform for serious businesses',
    features: ['Unlimited chatbots', 'Automation workflows', 'AI analytics', 'Team management', 'White label option'],
    cta: 'Contact Us',
    highlighted: false,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.textPrimary, fontFamily: 'Inter, sans-serif' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(15,17,21,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${S.border}` : 'none',
        transition: 'all 0.3s ease',
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: S.textPrimary, letterSpacing: '-0.5px' }}>
          Arch<span style={{ color: S.accent }}>on</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" style={{
            color: S.textSecondary, textDecoration: 'none', fontSize: '14px',
            padding: '8px 16px', borderRadius: '8px',
            transition: 'color 0.2s',
          }}>Login</Link>
          <Link href="/register" style={{
            background: S.accent, color: '#fff', textDecoration: 'none',
            fontSize: '14px', fontWeight: 600, padding: '8px 20px',
            borderRadius: '8px', transition: 'background 0.2s',
          }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px',
        background: `radial-gradient(ellipse at 50% 0%, rgba(79,140,255,0.12) 0%, transparent 70%)`,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(79,140,255,0.1)', border: `1px solid rgba(79,140,255,0.3)`,
          borderRadius: '100px', padding: '6px 16px', marginBottom: '32px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: S.accent, display: 'inline-block' }} />
          <span style={{ fontSize: '13px', color: S.accent, fontWeight: 500 }}>AI-Powered Customer Engagement Platform</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800,
          lineHeight: 1.1, letterSpacing: '-2px',
          marginBottom: '24px', maxWidth: '800px',
        }}>
          Stop Losing Customers.<br />
          <span style={{ color: S.accent }}>Start Winning Them.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)', color: S.textSecondary,
          maxWidth: '560px', lineHeight: 1.7, marginBottom: '40px',
        }}>
          Archon replaces 7 expensive tools with one platform. WhatsApp chatbot, CRM, email marketing, and AI analytics — built for Indian SMBs.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" style={{
            background: S.accent, color: '#fff', textDecoration: 'none',
            fontSize: '16px', fontWeight: 700, padding: '14px 32px',
            borderRadius: '10px', transition: 'background 0.2s',
          }}>Start Free Trial</Link>
          <a href="#features" style={{
            background: S.surface, color: S.textPrimary, textDecoration: 'none',
            fontSize: '16px', fontWeight: 600, padding: '14px 32px',
            borderRadius: '10px', border: `1px solid ${S.border}`,
            transition: 'background 0.2s',
          }}>See Features</a>
        </div>

        <p style={{ marginTop: '20px', fontSize: '13px', color: S.textMuted }}>
          No credit card required · 14-day free trial · Cancel anytime
        </p>

        {/* STATS */}
        <div style={{
          display: 'flex', gap: '48px', marginTop: '80px',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[['500+', 'Leads Captured'], ['98%', 'Response Rate'], ['3 sec', 'Avg Reply Time'], ['24/7', 'Always On']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: S.textPrimary }}>{val}</div>
              <div style={{ fontSize: '13px', color: S.textMuted, marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px' }}>
            Everything your business needs
          </h2>
          <p style={{ color: S.textSecondary, fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
            One platform. One login. One price. No more juggling 7 different tools.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: S.surface, border: `1px solid ${S.border}`,
              borderRadius: '16px', padding: '32px',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = S.accent;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = S.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: S.textSecondary, fontSize: '14px', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px' }}>
            Simple, honest pricing
          </h2>
          <p style={{ color: S.textSecondary, fontSize: '18px' }}>
            Start free. Upgrade when you're ready.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px', alignItems: 'start',
        }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlighted ? `rgba(79,140,255,0.08)` : S.surface,
              border: `1px solid ${plan.highlighted ? S.accent : S.border}`,
              borderRadius: '16px', padding: '36px',
              position: 'relative',
            }}>
              {plan.highlighted && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: S.accent, color: '#fff', fontSize: '12px', fontWeight: 700,
                  padding: '4px 16px', borderRadius: '100px',
                }}>Most Popular</div>
              )}
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{plan.name}</div>
              <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px' }}>
                {plan.price}<span style={{ fontSize: '16px', color: S.textMuted, fontWeight: 400 }}>/mo</span>
              </div>
              <div style={{ color: S.textSecondary, fontSize: '14px', marginBottom: '28px' }}>{plan.desc}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: S.textSecondary }}>
                    <span style={{ color: S.accent, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{
                display: 'block', textAlign: 'center',
                background: plan.highlighted ? S.accent : S.surface2,
                color: plan.highlighted ? '#fff' : S.textPrimary,
                textDecoration: 'none', fontWeight: 700, fontSize: '15px',
                padding: '12px', borderRadius: '10px',
                border: `1px solid ${plan.highlighted ? 'transparent' : S.border}`,
                transition: 'opacity 0.2s',
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          background: `linear-gradient(135deg, rgba(79,140,255,0.15), rgba(79,140,255,0.05))`,
          border: `1px solid rgba(79,140,255,0.3)`,
          borderRadius: '24px', padding: '64px 40px',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
            Ready to never miss a lead again?
          </h2>
          <p style={{ color: S.textSecondary, fontSize: '18px', marginBottom: '32px' }}>
            Join businesses already using Archon to automate their customer engagement.
          </p>
          <Link href="/register" style={{
            background: S.accent, color: '#fff', textDecoration: 'none',
            fontSize: '16px', fontWeight: 700, padding: '14px 40px',
            borderRadius: '10px', display: 'inline-block',
          }}>
            Start Free — No Card Needed
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: `1px solid ${S.border}`, padding: '32px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Arch<span style={{ color: S.accent }}>on</span>
        </div>
        <div style={{ color: S.textMuted, fontSize: '13px' }}>
          © 2026 Archon. Built for Indian SMBs.
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/login" style={{ color: S.textMuted, textDecoration: 'none', fontSize: '13px' }}>Login</Link>
          <Link href="/register" style={{ color: S.textMuted, textDecoration: 'none', fontSize: '13px' }}>Register</Link>
        </div>
      </footer>

    </div>
  );
}