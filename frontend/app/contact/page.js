'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'var(--mist)', border: '1.5px solid var(--ice)',
    borderRadius: 'var(--r-btn)', color: 'var(--ink)', fontSize: '14px',
    fontFamily: 'var(--font-inter)', outline: 'none',
    transition: 'all 0.18s', boxSizing: 'border-box',
};

const focusHandlers = {
    onFocus: e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; },
    onBlur: e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; },
};

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) { toast.error('Please fill all fields'); return; }
        setSending(true);
        try {
            await api.post('/contact', form);
            setSent(true);
            toast.success('Message sent!');
        } catch {
            toast.error('Failed to send. Try emailing us directly.');
        } finally {
            setSending(false);
        }
    };

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
                        <a key={href} href={href} style={{ fontSize: 13, fontWeight: 500, color: 'var(--ash)', textDecoration: 'none', padding: '7px 14px', borderRadius: 'var(--r-nav)', transition: 'all 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--mist)'; e.currentTarget.style.color = 'var(--ink)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ash)'; }}>
                            {label}
                        </a>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Link href="/sign-in" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ash)', textDecoration: 'none', padding: '8px 18px', borderRadius: 'var(--r-btn)', border: '1.5px solid var(--ice)', transition: 'all 0.18s' }}>Sign in</Link>
                    <Link href="/sign-up" style={{ fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: 'var(--r-btn)', background: 'var(--ink)' }}>Start Free Trial →</Link>
                </div>
            </nav>

            {/* ── Content ── */}
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 40px' }}>

                {/* Hero */}
                <div style={{ marginBottom: 56 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', borderRadius: 20, padding: '4px 14px', marginBottom: 24 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)' }} />
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contact Us</span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 68px)', color: 'var(--ink)', lineHeight: 0.92, letterSpacing: -1.5, marginBottom: 20 }}>
                        WE&apos;D LOVE TO<br />HEAR FROM YOU.
                    </h1>
                    <p style={{ fontSize: 16, color: 'var(--ash)', lineHeight: 1.85 }}>
                        Have a question, a problem, or just want to say hi? Send us a message and we&apos;ll get back to you as soon as possible.
                    </p>
                </div>

                {/* Contact options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 48 }}>
                    <a href="mailto:support@ourivo.com" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, background: '#fff', border: '1px solid #e8ecf4', borderRadius: 20, textDecoration: 'none', transition: 'border-color 0.18s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e8ecf4'}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✉️</div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Email</div>
                            <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700 }}>support@ourivo.com</div>
                        </div>
                    </a>

                    <a href="https://wa.me/917294034023" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, background: '#fff', border: '1px solid #e8ecf4', borderRadius: 20, textDecoration: 'none', transition: 'border-color 0.18s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#25D366'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e8ecf4'}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💬</div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>WhatsApp</div>
                            <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700 }}>+91 72940 34023</div>
                        </div>
                    </a>
                </div>

                <div style={{ height: 1, background: 'var(--ice)', marginBottom: 48 }} />

                {/* Form or success */}
                {sent ? (
                    <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-card)', padding: '56px 40px', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: 'var(--green)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 20px' }}>✓</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', letterSpacing: -0.5, marginBottom: 14 }}>MESSAGE RECEIVED!</h2>
                        <p style={{ fontSize: 14, color: 'var(--fog)', lineHeight: 1.8, marginBottom: 6 }}>
                            Confirmation sent to <strong style={{ color: 'var(--green)' }}>{form.email}</strong>
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--fog)', lineHeight: 1.8 }}>We will get back to you as soon as possible.</p>
                    </div>
                ) : (
                    <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 'var(--r-card)', padding: '32px' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 24 }}>Send a Message</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Name</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" style={inputStyle} {...focusHandlers} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle} {...focusHandlers} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message</label>
                                <textarea name="message" value={form.message} onChange={handleChange} rows={6}
                                    placeholder="How can we help you?"
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} {...focusHandlers} />
                            </div>

                            <button onClick={handleSubmit} disabled={sending}
                                style={{ padding: '13px', background: sending ? 'var(--mist)' : 'var(--ink)', border: 'none', borderRadius: 'var(--r-btn)', color: sending ? 'var(--fog)' : '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-inter)', cursor: sending ? 'not-allowed' : 'pointer', transition: 'opacity 0.18s' }}
                                onMouseEnter={e => { if (!sending) e.currentTarget.style.opacity = '0.85'; }}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                {sending ? 'Sending...' : 'Send Message →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid #e8ecf4', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: '#fff' }}>
                <span style={{ fontSize: 13, color: 'var(--fog)' }}>© 2025 Ourivo Technologies. All rights reserved.</span>
                <div style={{ display: 'flex', gap: 24 }}>
                    {[['About', '/about'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Help', '/help']].map(([label, href]) => (
                        <Link key={href} href={href} style={{ fontSize: 13, color: 'var(--fog)', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--fog)'}>
                            {label}
                        </Link>
                    ))}
                </div>
            </footer>

            <style>{`input::placeholder, textarea::placeholder { color: var(--fog); }`}</style>
        </div>
    );
}