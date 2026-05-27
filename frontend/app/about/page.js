'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {

    const navLink = { fontSize: 13, fontWeight: 500, color: 'var(--ash)', textDecoration: 'none', padding: '7px 14px', borderRadius: 'var(--r-nav)', transition: 'all 0.18s' };

    const sectionLabel = { fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ice)', fontFamily: 'var(--font-inter)', color: 'var(--ink)' }}>

            {/* ── Navbar ── */}
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 62, background: '#fff', borderBottom: '1px solid #e8ecf4', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <Image src="/logo.png" alt="Ourivo" width={34} height={34} style={{ borderRadius: 8 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: 1.5 }}>OURIVO</span>
                </Link>
                <div style={{ display: 'flex', gap: 4 }}>
                    {[['/#features', 'Features'], ['/#pricing', 'Pricing'], ['/about', 'About'], ['/help', 'Help']].map(([href, label]) => (
                        <a key={href} href={href} style={{ ...navLink, color: href === '/about' ? 'var(--ink)' : 'var(--ash)', fontWeight: href === '/about' ? 700 : 500 }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--mist)'; e.currentTarget.style.color = 'var(--ink)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = href === '/about' ? 'var(--ink)' : 'var(--ash)'; }}>
                            {label}
                        </a>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ash)', textDecoration: 'none', padding: '8px 18px', borderRadius: 'var(--r-btn)', border: '1.5px solid var(--ice)', transition: 'all 0.18s' }}>Sign in</Link>
                    <Link href="/register" style={{ fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: 'var(--r-btn)', background: 'var(--ink)', transition: 'opacity 0.18s' }}>Start Free Trial →</Link>
                </div>
            </nav>

            {/* ── Content ── */}
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px' }}>

                {/* Hero */}
                <div style={{ marginBottom: 64 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', borderRadius: 20, padding: '4px 14px', marginBottom: 24 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>About Ourivo</span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 72px)', color: 'var(--ink)', lineHeight: 0.92, letterSpacing: -1.5, marginBottom: 24 }}>
                        WE EXIST SO BUSINESSES<br />NEVER MISS<br />A CUSTOMER.
                    </h1>
                    <p style={{ fontSize: 18, color: 'var(--ash)', lineHeight: 1.85 }}>
                        Ourivo was built to solve a problem every growing business faces — too many customers, not enough time to respond to all of them.
                    </p>
                </div>

                <div style={{ height: 1, background: 'var(--ice)', marginBottom: 64 }} />

                {/* Our Story */}
                <div style={{ marginBottom: 56 }}>
                    <div style={sectionLabel}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />Our Story</div>
                    <p style={{ fontSize: 16, color: 'var(--ash)', lineHeight: 1.9, marginBottom: 16 }}>
                        Ourivo was born from a simple frustration — businesses were losing customers not because they had a bad product, but because they couldn't respond fast enough. A message sent at 11 PM. A lead that went cold by morning. An opportunity lost to a competitor who just happened to reply first.
                    </p>
                    <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.9, fontWeight: 700 }}>
                        We built Ourivo to fix that.
                    </p>
                </div>

                {/* Mission + Vision — black cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 56 }}>
                    <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-card)', padding: 28 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>Our Mission</div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--green)', lineHeight: 1.3, letterSpacing: 0.3 }}>
                            HELP EVERY BUSINESS RESPOND TO EVERY CUSTOMER — AUTOMATICALLY, INTELLIGENTLY, PERSONALLY.
                        </p>
                    </div>
                    <div style={{ background: 'var(--yellow)', borderRadius: 'var(--r-card)', padding: 28 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>Our Vision</div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: 0.3 }}>
                            A WORLD WHERE NO BUSINESS LOSES A CUSTOMER SIMPLY BECAUSE THEY WEREN'T AVAILABLE.
                        </p>
                    </div>
                </div>

                {/* What We Do */}
                <div style={{ marginBottom: 56 }}>
                    <div style={sectionLabel}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />What We Do</div>
                    <p style={{ fontSize: 16, color: 'var(--ash)', lineHeight: 1.9 }}>
                        Ourivo gives businesses the tools to capture every lead, qualify them automatically, and follow up without lifting a finger. One simple platform. Zero missed opportunities.
                    </p>
                </div>

                <div style={{ height: 1, background: 'var(--ice)', marginBottom: 64 }} />

                {/* Our Future */}
                <div style={{ marginBottom: 56 }}>
                    <div style={sectionLabel}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />Our Future</div>
                    <p style={{ fontSize: 16, color: 'var(--ash)', lineHeight: 1.9, marginBottom: 32 }}>We are just getting started. Here is where we are headed:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {[
                            { icon: '💬', title: 'Multi-platform expansion', desc: 'Expanding across messaging platforms so businesses can reach customers wherever they are.' },
                            { icon: '📊', title: 'Deeper analytics', desc: 'Understanding not just who your leads are but why they convert — and how to get more of them.' },
                            { icon: '👥', title: 'Team collaboration', desc: 'Enabling entire sales teams to work from one place, with shared inboxes and smart assignment.' },
                            { icon: '🤖', title: 'Full journey automation', desc: 'Automating the entire customer journey — from first message to closed deal — without writing a single line of code.' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '20px', background: '#fff', borderRadius: 16, border: '1px solid #e8ecf4', transition: 'border-color 0.18s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e8ecf4'}>
                                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', letterSpacing: 0.3, marginBottom: 6 }}>{item.title.toUpperCase()}</div>
                                    <div style={{ fontSize: 14, color: 'var(--ash)', lineHeight: 1.7 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ height: 1, background: 'var(--ice)', marginBottom: 64 }} />

                {/* Values */}
                <div style={{ marginBottom: 56 }}>
                    <div style={sectionLabel}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />Our Values</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {[
                            { title: 'Simplicity', desc: 'If it needs a manual, we have failed.' },
                            { title: 'Reliability', desc: 'Your business runs 24/7, so does ours.' },
                            { title: 'Affordability', desc: 'Enterprise-grade tools at SMB prices.' },
                            { title: 'Customer First', desc: 'We succeed only when you succeed.' },
                        ].map((v, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 20, padding: '20px 0', borderBottom: i < 3 ? '1px solid var(--ice)' : 'none' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', letterSpacing: 0.5, minWidth: 160, flexShrink: 0 }}>{v.title.toUpperCase()}</span>
                                <span style={{ fontSize: 15, color: 'var(--ash)', lineHeight: 1.7 }}>{v.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Who We Are */}
                <div style={{ marginBottom: 64 }}>
                    <div style={sectionLabel}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />Who We Are</div>
                    <p style={{ fontSize: 16, color: 'var(--ash)', lineHeight: 1.9 }}>
                        We are a small, focused team building tools that punch above their weight. We believe software should be simple, affordable, and immediately useful — not complex, expensive, and requiring a consultant to set up.
                    </p>
                </div>

                {/* CTA */}
                <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-card)', padding: '48px', textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#fff', letterSpacing: -1, lineHeight: 0.95, marginBottom: 14 }}>
                        READY TO GET<br />STARTED?
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--fog)', marginBottom: 28 }}>14 days free. No credit card required.</p>
                    <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', background: 'var(--green)', borderRadius: 'var(--r-btn)', color: 'var(--ink)', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'opacity 0.18s' }}>
                        Start Free Trial →
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid #e8ecf4', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: '#fff' }}>
                <span style={{ fontSize: 13, color: 'var(--fog)' }}>© 2025 Ourivo Technologies. All rights reserved.</span>
                <div style={{ display: 'flex', gap: 24 }}>
                    {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact'], ['Help', '/help']].map(([label, href]) => (
                        <Link key={href} href={href} style={{ fontSize: 13, color: 'var(--fog)', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--fog)'}>
                            {label}
                        </Link>
                    ))}
                </div>
            </footer>
        </div>
    );
}