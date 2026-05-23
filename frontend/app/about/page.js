'use client';

import Link from 'next/link';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'var(--font-family)', color: S.textPrimary }}>

            {/* Navbar */}
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '64px', background: 'rgba(22,26,34,0.9)', borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Ourivo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <span style={{ fontWeight: 800, fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                        <span style={{ color: S.textPrimary }}>Our</span><span style={{ color: S.accent }}>ivo</span>
                    </span>
                </Link>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link href="/login" style={{ padding: '7px 18px', background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '8px', color: S.textSecondary, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
                    <Link href="/register" style={{ padding: '7px 18px', background: S.accent, border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Start Free Trial</Link>
                </div>
            </nav>

            {/* Content */}
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 48px' }}>

                {/* Label */}
                <div style={{ marginBottom: '32px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: `2px solid ${S.accent}`, paddingBottom: '4px' }}>
                        About Us
                    </span>
                </div>

                {/* Hero text */}
                <h1 style={{ fontSize: '52px', fontWeight: 800, color: S.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
                    We exist so businesses<br />never miss a customer.
                </h1>
                <p style={{ fontSize: '18px', color: S.textSecondary, lineHeight: 1.9, marginBottom: '72px' }}>
                    Ourivo was built to solve a problem every growing business faces — too many customers, not enough time to respond to all of them.
                </p>

                {/* Divider */}
                <div style={{ height: '1px', background: S.border, marginBottom: '72px' }} />

                {/* Our Story */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Our Story</h2>
                    <p style={{ fontSize: '16px', color: S.textSecondary, lineHeight: 1.9, marginBottom: '16px' }}>
                        Ourivo was born from a simple frustration — businesses were losing customers not because they had a bad product, but because they couldn't respond fast enough. A message sent at 11 PM. A lead that went cold by morning. An opportunity lost to a competitor who just happened to reply first.
                    </p>
                    <p style={{ fontSize: '16px', color: S.textPrimary, lineHeight: 1.9, fontWeight: 500 }}>
                        We built Ourivo to fix that.
                    </p>
                </div>

                {/* Mission */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Our Mission</h2>
                    <p style={{ fontSize: '22px', color: S.textPrimary, lineHeight: 1.7, fontFamily: 'Georgia, serif', fontWeight: 600 }}>
                        "To help every small and medium business respond to every customer, every time — automatically, intelligently, and personally."
                    </p>
                </div>

                {/* Vision */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Our Vision</h2>
                    <p style={{ fontSize: '22px', color: S.textPrimary, lineHeight: 1.7, fontFamily: 'Georgia, serif', fontWeight: 600 }}>
                        "A world where no business loses a customer simply because they weren't available."
                    </p>
                </div>

                {/* What We Do */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>What We Do</h2>
                    <p style={{ fontSize: '16px', color: S.textSecondary, lineHeight: 1.9 }}>
                        Ourivo gives businesses the tools to capture every lead, qualify them automatically, and follow up without lifting a finger. One simple platform. Zero missed opportunities.
                    </p>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: S.border, marginBottom: '72px' }} />

                {/* Future Plans */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Our Future</h2>
                    <p style={{ fontSize: '16px', color: S.textSecondary, lineHeight: 1.9, marginBottom: '32px' }}>
                        We are just getting started. Here is where we are headed:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {[
                            { icon: '💬', title: 'Multi-platform expansion', desc: 'Expanding across messaging platforms so businesses can reach customers wherever they are.' },
                            { icon: '📊', title: 'Deeper analytics', desc: 'Understanding not just who your leads are but why they convert — and how to get more of them.' },
                            { icon: '👥', title: 'Team collaboration', desc: 'Enabling entire sales teams to work from one place, with shared inboxes and smart assignment.' },
                            { icon: '🤖', title: 'Full journey automation', desc: 'Automating the entire customer journey — from first message to closed deal — without writing a single line of code.' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: S.textPrimary, marginBottom: '6px' }}>{item.title}</div>
                                    <div style={{ fontSize: '15px', color: S.textSecondary, lineHeight: 1.8 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: S.border, marginBottom: '72px' }} />

                {/* Values */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px' }}>Our Values</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {[
                            { title: 'Simplicity', desc: 'If it needs a manual, we have failed.' },
                            { title: 'Reliability', desc: 'Your business runs 24/7, so does ours.' },
                            { title: 'Affordability', desc: 'Enterprise-grade tools at SMB prices.' },
                            { title: 'Customer First', desc: 'We succeed only when you succeed.' },
                        ].map((v, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '16px', paddingBottom: '24px', borderBottom: i < 3 ? `1px solid ${S.border}` : 'none' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: S.accent, textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '140px', flexShrink: 0 }}>{v.title}</span>
                                <span style={{ fontSize: '15px', color: S.textSecondary, lineHeight: 1.8 }}>{v.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Who We Are */}
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Who We Are</h2>
                    <p style={{ fontSize: '16px', color: S.textSecondary, lineHeight: 1.9 }}>
                        We are a small, focused team building tools that punch above their weight. We believe software should be simple, affordable, and immediately useful — not complex, expensive, and requiring a consultant to set up.
                    </p>
                </div>

                {/* CTA */}
                <div style={{ padding: '48px', background: S.surface, borderRadius: '20px', border: `1px solid ${S.border}`, textAlign: 'center' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: S.textPrimary, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>Ready to get started?</h3>
                    <p style={{ fontSize: '15px', color: S.textSecondary, marginBottom: '24px' }}>14 days free. No credit card required.</p>
                    <Link href="/register" style={{ display: 'inline-block', padding: '13px 32px', background: `linear-gradient(135deg, #4F8CFF, #6366f1)`, borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(79,140,255,0.3)' }}>
                        Start Free Trial →
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${S.border}`, padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: S.textMuted }}>© 2026 Ourivo. All rights reserved.</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
                        <Link key={href} href={href} style={{ fontSize: '13px', color: S.textMuted, textDecoration: 'none' }}>{label}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
}