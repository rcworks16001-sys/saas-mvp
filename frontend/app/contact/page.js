'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

const Navbar = () => (
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
);

const Footer = () => (
    <div style={{ borderTop: `1px solid ${S.border}`, padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: S.textMuted }}>© 2026 Ourivo. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
            {[['About', '/about'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontSize: '13px', color: S.textMuted, textDecoration: 'none' }}>{label}</Link>
            ))}
        </div>
    </div>
);

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error('Please fill all fields');
            return;
        }
        setSending(true);
        try {
            await api.post('/contact', form);
            setSent(true);
            toast.success('Message sent!');
        } catch (error) {
            toast.error('Failed to send message. Try emailing us directly.');
        } finally {
            setSending(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px',
        background: S.surface2, border: `1.5px solid ${S.border}`,
        borderRadius: '10px', color: S.textPrimary, fontSize: '15px',
        fontFamily: 'var(--font-family)', outline: 'none',
        transition: 'all 180ms ease', boxSizing: 'border-box',
    };

    const focusHandlers = {
        onFocus: e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`; },
        onBlur: e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }
    };

    return (
        <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'var(--font-family)', color: S.textPrimary }}>
            <Navbar />

            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 48px' }}>

                {/* Label */}
                <div style={{ marginBottom: '32px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: `2px solid ${S.accent}`, paddingBottom: '4px' }}>
                        Contact Us
                    </span>
                </div>

                <h1 style={{ fontSize: '48px', fontWeight: 800, color: S.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
                    We'd love to hear<br />from you.
                </h1>
                <p style={{ fontSize: '16px', color: S.textSecondary, lineHeight: 1.9, marginBottom: '72px' }}>
                    Have a question, a problem, or just want to say hi? Send us a message and we'll get back to you as soon as possible.
                </p>

                <div style={{ height: '1px', background: S.border, marginBottom: '72px' }} />

                {/* Contact options */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '64px' }}>
                    <a href="mailto:support@ourivo.com" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: '16px', textDecoration: 'none', transition: 'all 180ms ease' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(79,140,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>✉️</div>
                        <div>
                            <div style={{ fontSize: '12px', color: S.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Email</div>
                            <div style={{ fontSize: '15px', color: S.textPrimary, fontWeight: 600 }}>support@ourivo.com</div>
                        </div>
                    </a>

                    <a href="https://wa.me/917294034023" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: '16px', textDecoration: 'none', transition: 'all 180ms ease' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#25d366'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>💬</div>
                        <div>
                            <div style={{ fontSize: '12px', color: S.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>WhatsApp</div>
                            <div style={{ fontSize: '15px', color: S.textPrimary, fontWeight: 600 }}>+91 72940 34023</div>
                        </div>
                    </a>
                </div>

                <div style={{ height: '1px', background: S.border, marginBottom: '64px' }} />

                {/* Contact Form */}
                {sent ? (
                    <div style={{ textAlign: 'center', padding: '64px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: S.textPrimary, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>Message received!</h2>
                        <p style={{ fontSize: '15px', color: S.textSecondary, lineHeight: 1.8, marginBottom: '8px' }}>
                            Thank you for reaching out. We have sent a confirmation to <strong style={{ color: S.textPrimary }}>{form.email}</strong>.
                        </p>
                        <p style={{ fontSize: '15px', color: S.textSecondary, lineHeight: 1.8 }}>
                            We will get back to you as soon as possible.
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px' }}>Send a Message</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Name</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" style={inputStyle} {...focusHandlers} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Address</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle} {...focusHandlers} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Message</label>
                                <textarea name="message" value={form.message} onChange={handleChange} rows={6} placeholder="How can we help you?" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} {...focusHandlers} />
                            </div>

                            <button onClick={handleSubmit} disabled={sending} style={{ padding: '14px', background: sending ? S.surface2 : `linear-gradient(135deg, ${S.accent}, #6366f1)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-family)', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 180ms ease', boxShadow: sending ? 'none' : '0 4px 20px rgba(79,140,255,0.3)' }}>
                                {sending ? 'Sending...' : 'Send Message →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
            <style>{`input::placeholder, textarea::placeholder { color: #5C6A7E; }`}</style>
        </div>
    );
}