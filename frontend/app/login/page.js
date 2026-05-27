'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '../../lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', form);
            const { token, user, organizationId } = response.data;
            Cookies.set('token', token, { expires: 7 });
            Cookies.set('organizationId', organizationId, { expires: 7 });
            Cookies.set('userName', user.name, { expires: 7 });
            toast.success(`Welcome back, ${user.name}!`);
            router.push('/dashboard');
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--ice)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'var(--font-inter)',
        }}>
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: 960,
                borderRadius: 'var(--r-card)',
                overflow: 'hidden',
                border: '1px solid #d4d8de',
            }}>

                {/* ── Left panel ── */}
                <div style={{
                    width: '44%',
                    background: 'var(--ink)',
                    padding: '48px 44px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Image src="/logo.png" alt="Ourivo" width={36} height={36} style={{ borderRadius: 8 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', letterSpacing: 1.5 }}>OURIVO</span>
                    </div>

                    {/* Headline */}
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>AI-powered lead capture</span>
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 4vw, 52px)', color: '#fff', lineHeight: 0.91, letterSpacing: -1.5, marginBottom: 20 }}>
                            NEVER MISS<br />A LEAD<br />
                            <span style={{ color: 'var(--yellow)' }}>AGAIN.</span>
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--fog)', lineHeight: 1.7, maxWidth: 260, marginBottom: 32 }}>
                            Your AI chatbot captures and qualifies WhatsApp leads 24/7 — while you focus on closing deals.
                        </p>

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[
                                { value: '24/7', label: 'Lead capture', accent: 'var(--green)' },
                                { value: '< 3s', label: 'Response time', accent: 'var(--yellow)' },
                                { value: '0', label: 'Leads missed', accent: 'var(--green)' },
                            ].map((s) => (
                                <div key={s.label} style={{ flex: 1, padding: '14px 10px', background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 16 }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: s.accent, letterSpacing: -0.5, marginBottom: 2 }}>{s.value}</div>
                                    <div style={{ fontSize: 10, color: 'var(--fog)', fontWeight: 500 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div style={{ padding: '20px', background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 20 }}>
                        <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                            {[...Array(5)].map((_, i) => <span key={i} style={{ color: 'var(--yellow)', fontSize: 11 }}>★</span>)}
                        </div>
                        <p style={{ color: 'var(--fog)', fontSize: 12, lineHeight: 1.75, marginBottom: 14 }}>
                            &ldquo;I was losing 5–6 leads every night. Now my chatbot captures everything and I wake up to qualified prospects.&rdquo;
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--ink)' }}>RS</div>
                            <div>
                                <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Rahul Sharma</div>
                                <div style={{ color: 'var(--fog)', fontSize: 11 }}>Property Consultant, Bangalore</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div style={{
                    flex: 1,
                    background: '#fff',
                    padding: '48px 44px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}>
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.95, marginBottom: 10 }}>
                            WELCOME<br />BACK.
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--ash)' }}>Sign in to your Ourivo dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Email address
                            </label>
                            <input
                                type="email" name="email" value={form.email}
                                onChange={handleChange} required
                                placeholder="you@youragency.com"
                                style={{ width: '100%', padding: '12px 14px', background: 'var(--mist)', border: '1.5px solid var(--ice)', borderRadius: 'var(--r-btn)', color: 'var(--ink)', fontSize: 14, outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box', fontFamily: 'var(--font-inter)' }}
                                onFocus={e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; }}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Password</label>
                                <span style={{ fontSize: 12, color: 'var(--ash)', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
                            </div>
                            <input
                                type="password" name="password" value={form.password}
                                onChange={handleChange} required
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '12px 14px', background: 'var(--mist)', border: '1.5px solid var(--ice)', borderRadius: 'var(--r-btn)', color: 'var(--ink)', fontSize: 14, outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box', fontFamily: 'var(--font-inter)' }}
                                onFocus={e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; }}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit" disabled={loading}
                            style={{ width: '100%', padding: '13px', background: loading ? 'var(--mist)' : 'var(--ink)', border: 'none', borderRadius: 'var(--r-btn)', color: loading ? 'var(--fog)' : '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-inter)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: -0.2 }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ width: 13, height: 13, border: '2px solid #ccc', borderTopColor: 'var(--ash)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} />
                                    Signing in...
                                </>
                            ) : 'Sign in to Dashboard →'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--ice)' }} />
                        <span style={{ color: 'var(--fog)', fontSize: 11 }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--ice)' }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ash)' }}>
                        New to Ourivo?{' '}
                        <Link href="/register" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
                            Create free account
                        </Link>
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 32 }}>
                        {[['🔒', 'Secure login'], ['⚡', 'Instant access'], ['🇮🇳', 'Made in India']].map(([icon, text]) => (
                            <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fog)', fontWeight: 500 }}>
                                {icon} {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: var(--fog); }
            `}</style>
        </div>
    );
}