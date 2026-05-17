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
              background: S.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 16px rgba(79,140,255,0.35)`
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>W</span>
            </div>
            <span style={{ color: S.textPrimary, fontWeight: 700, fontSize: '15px' }}>
              WhatsApp CRM
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
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = S.accent;
                e.currentTarget.style.color = S.accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = S.border;
                e.currentTarget.style.color = S.textSecondary;
              }}
            >
              Sign in
            </Link>
            <Link href="/register" style={{
              padding: '7px 18px',
              background: S.accent,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
              boxShadow: `0 4px 14px rgba(79,140,255,0.3)`,
              transition: 'all 180ms ease'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = S.accentDark;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = S.accent;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start Free Trial
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          padding: '100px 48px 80px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          animation: 'fadeUp 0.5s ease forwards'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 14px', borderRadius: '999px',
            background: 'rgba(79,140,255,0.1)',
            border: `1px solid rgba(79,140,255,0.2)`,
            marginBottom: '28px'
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 6px rgba(52,211,153,0.7)',
              animation: 'pulse 2s ease infinite'
            }} />
            <span style={{
              color: '#93c5fd', fontSize: '11px',
              fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Live — Capturing leads 24/7
            </span>
          </div>

          <h1 style={{
            fontSize: '52px', fontWeight: 800,
            color: S.textPrimary, lineHeight: 1.15,
            letterSpacing: '-0.03em', marginBottom: '20px'
          }}>
            Never miss a<br />
            <span style={{
              background: `linear-gradient(135deg, ${S.accent}, #818cf8)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              WhatsApp lead
            </span>
            <br />again.
          </h1>

          <p style={{
            fontSize: '18px', color: S.textSecondary,
            lineHeight: 1.7, marginBottom: '40px',
            maxWidth: '560px', margin: '0 auto 40px'
          }}>
            Your AI chatbot captures, qualifies, and organizes every WhatsApp inquiry automatically — while you sleep, while you're in meetings, while you live your life.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              padding: '14px 32px',
              background: S.accent,
              borderRadius: '10px', color: 'white',
              fontSize: '15px', fontWeight: 600,
              textDecoration: 'none',
              boxShadow: `0 4px 20px rgba(79,140,255,0.35)`,
              transition: 'all 180ms ease',
              display: 'inline-block'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 28px rgba(79,140,255,0.45)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 20px rgba(79,140,255,0.35)`;
              }}
            >
              Start Free Trial — ₹1,999/mo
            </Link>
            <Link href="/login" style={{
              padding: '14px 32px',
              background: 'transparent',
              border: `1px solid ${S.border}`,
              borderRadius: '10px', color: S.textSecondary,
              fontSize: '15px', fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 180ms ease',
              display: 'inline-block'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = S.accent;
                e.currentTarget.style.color = S.accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = S.border;
                e.currentTarget.style.color = S.textSecondary;
              }}
            >
              Sign in to Dashboard
            </Link>
          </div>

          {/* Trust line */}
          <p style={{
            marginTop: '24px', fontSize: '12px',
            color: S.textMuted
          }}>
            No credit card required · Setup in 5 minutes · Cancel anytime
          </p>
        </section>

        {/* ── STATS ── */}
        <section style={{
          padding: '0 48px 80px',
          maxWidth: '900px', margin: '0 auto'
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {[
              { value: '24/7', label: 'Automatic lead capture', sub: 'Even at 2 AM' },
              { value: '< 3s', label: 'Response time', sub: 'Faster than any human' },
              { value: '0', label: 'Leads missed', sub: 'Every inquiry captured' },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: '14px',
                textAlign: 'center',
                transition: 'all 200ms ease'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(79,140,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = S.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '36px', fontWeight: 800,
                  color: S.accent, letterSpacing: '-0.02em',
                  marginBottom: '6px'
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: S.textPrimary, marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '12px', color: S.textMuted }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{
          padding: '80px 48px',
          background: S.surface,
          borderTop: `1px solid ${S.border}`,
          borderBottom: `1px solid ${S.border}`,
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 style={{
                fontSize: '34px', fontWeight: 700,
                color: S.textPrimary, letterSpacing: '-0.02em',
                marginBottom: '12px'
              }}>
                Everything a real estate agent needs
              </h2>
              <p style={{ fontSize: '15px', color: S.textSecondary, maxWidth: '480px', margin: '0 auto' }}>
                One platform that handles your entire lead pipeline — from first WhatsApp message to closed deal.
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }}>
              {[
                {
                  icon: '🤖',
                  title: 'AI WhatsApp Chatbot',
                  desc: 'Automatically replies to every inquiry. Asks the right questions — budget, location, BHK — and qualifies leads before you even wake up.',
                  color: '#4F8CFF'
                },
                {
                  icon: '📊',
                  title: 'Lead Dashboard',
                  desc: 'Every lead in one place. See who inquired, what they need, when they messaged. Update status from New to Converted in one click.',
                  color: '#a78bfa'
                },
                {
                  icon: '⚡',
                  title: 'Instant Notifications',
                  desc: 'Get a WhatsApp notification the moment a new lead arrives — with their name, budget, and requirements. Never check again.',
                  color: '#34d399'
                },
              ].map((feature, i) => (
                <div key={i} style={{
                  padding: '28px',
                  background: S.surface2,
                  border: `1px solid ${S.border}`,
                  borderRadius: '14px',
                  transition: 'all 200ms ease'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = feature.color + '44';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = S.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: feature.color + '18',
                    border: `1px solid ${feature.color}33`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px', marginBottom: '16px'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '15px', fontWeight: 700,
                    color: S.textPrimary, marginBottom: '10px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '13px', color: S.textSecondary,
                    lineHeight: 1.7
                  }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '34px', fontWeight: 700,
              color: S.textPrimary, letterSpacing: '-0.02em',
              marginBottom: '12px'
            }}>
              Up and running in 5 minutes
            </h2>
            <p style={{
              fontSize: '15px', color: S.textSecondary,
              marginBottom: '56px'
            }}>
              No technical knowledge needed. No complicated setup.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  step: '01',
                  title: 'Create your account',
                  desc: 'Sign up with your business name and email. Takes 60 seconds.'
                },
                {
                  step: '02',
                  title: 'Connect your WhatsApp',
                  desc: 'Link your WhatsApp Business number. Your AI chatbot goes live immediately.'
                },
                {
                  step: '03',
                  title: 'Watch leads appear',
                  desc: 'Every WhatsApp inquiry is automatically captured, qualified, and shown in your dashboard.'
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: '20px', padding: '24px',
                  background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRadius: '14px',
                  textAlign: 'left',
                  transition: 'all 200ms ease'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(79,140,255,0.25)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = S.border;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'rgba(79,140,255,0.12)',
                    border: `1px solid rgba(79,140,255,0.2)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '12px', fontWeight: 800,
                    color: S.accent, letterSpacing: '0.05em'
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '15px', fontWeight: 700,
                      color: S.textPrimary, marginBottom: '6px'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: S.textSecondary, lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ── */}
        <section style={{
          padding: '80px 48px',
          background: S.surface,
          borderTop: `1px solid ${S.border}`,
          borderBottom: `1px solid ${S.border}`,
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginBottom: '20px' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: '#fbbf24', fontSize: '18px' }}>★</span>
              ))}
            </div>
            <p style={{
              fontSize: '18px', color: S.textSecondary,
              lineHeight: 1.75, marginBottom: '28px',
              fontStyle: 'italic'
            }}>
              "I was losing 5–6 leads every night. Customers would message at 10 PM and by morning they had already gone to another agent. Now my chatbot handles everything automatically. I wake up to qualified leads ready to visit."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${S.accent}, #818cf8)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '16px', fontWeight: 700
              }}>R</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: S.textPrimary }}>
                  Rahul Sharma
                </div>
                <div style={{ fontSize: '12px', color: S.textMuted }}>
                  Senior Property Consultant, Bangalore
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '460px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '34px', fontWeight: 700,
              color: S.textPrimary, letterSpacing: '-0.02em',
              marginBottom: '12px'
            }}>
              Simple, honest pricing
            </h2>
            <p style={{
              fontSize: '15px', color: S.textSecondary,
              marginBottom: '40px'
            }}>
              One plan. Everything included. No surprises.
            </p>

            <div style={{
              padding: '36px',
              background: S.surface,
              border: `1px solid rgba(79,140,255,0.3)`,
              borderRadius: '20px',
              boxShadow: '0 0 40px rgba(79,140,255,0.08)'
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '999px',
                background: 'rgba(79,140,255,0.1)',
                border: `1px solid rgba(79,140,255,0.2)`,
                marginBottom: '20px'
              }}>
                <span style={{ color: S.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Starter Plan
                </span>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: S.textPrimary, letterSpacing: '-0.03em' }}>
                  ₹1,999
                </span>
                <span style={{ fontSize: '15px', color: S.textMuted }}>/month</span>
              </div>
              <p style={{ fontSize: '13px', color: S.textMuted, marginBottom: '28px' }}>
                14-day free trial · No credit card required
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', textAlign: 'left' }}>
                {[
                  'WhatsApp AI chatbot — active 24/7',
                  'Unlimited lead capture',
                  'Lead dashboard with pipeline tracking',
                  'Instant WhatsApp notifications',
                  'Conversation history for every lead',
                  'Up to 3 team members',
                  'Email support',
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'rgba(52,211,153,0.15)',
                      border: '1px solid rgba(52,211,153,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '10px', color: '#34d399'
                    }}>✓</div>
                    <span style={{ fontSize: '13px', color: S.textSecondary }}>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" style={{
                display: 'block', padding: '13px',
                background: S.accent,
                borderRadius: '10px', color: 'white',
                fontSize: '14px', fontWeight: 600,
                textDecoration: 'none', textAlign: 'center',
                boxShadow: `0 4px 18px rgba(79,140,255,0.3)`,
                transition: 'all 180ms ease'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = S.accentDark;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(79,140,255,0.4)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = S.accent;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 18px rgba(79,140,255,0.3)`;
                }}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: '32px 48px',
          borderTop: `1px solid ${S.border}`,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: S.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '11px' }}>W</span>
            </div>
            <span style={{ color: S.textMuted, fontSize: '13px' }}>
              WhatsApp CRM © 2025
            </span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/login" style={{ color: S.textMuted, fontSize: '13px', textDecoration: 'none' }}>
              Sign in
            </Link>
            <Link href="/register" style={{ color: S.textMuted, fontSize: '13px', textDecoration: 'none' }}>
              Get started
            </Link>
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