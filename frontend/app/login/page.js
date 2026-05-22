'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '../../lib/api';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

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

    const S = {
        bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
        accent: '#4F8CFF', accentDark: '#3a7aef', border: '#2A3142',
        textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
    };

    return (
        <div style={{
            minHeight: '100vh', background: S.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-family)'
        }}>

            <Particles id="tsparticles" init={particlesInit}
                options={{
                    background: { color: { value: 'transparent' } },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 50, density: { enable: true, area: 900 } },
                        color: { value: ['#4F8CFF', '#818cf8'] },
                        shape: { type: 'circle' },
                        opacity: { value: 0.18, animation: { enable: true, speed: 0.5, minimumValue: 0.05, sync: false } },
                        size: { value: { min: 1, max: 2 } },
                        links: { enable: true, distance: 150, color: '#4F8CFF', opacity: 0.06, width: 1 },
                        move: { enable: true, speed: 0.5, direction: 'none', random: true, outModes: { default: 'bounce' } }
                    },
                    interactivity: {
                        events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
                        modes: { repulse: { distance: 80, duration: 0.4 } }
                    },
                    detectRetina: true
                }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
            />

            <div style={{ position: 'absolute', top: '-180px', left: '-180px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,140,255,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-180px', right: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Card */}
            <div style={{
                position: 'relative', zIndex: 1,
                display: 'flex', width: '100%', maxWidth: '940px',
                margin: '0 24px', borderRadius: '20px', overflow: 'hidden',
                border: `1px solid ${S.border}`,
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                animation: 'fadeUp 0.4s ease forwards'
            }}>

                {/* Left Panel */}
                <div style={{
                    width: '44%', background: S.surface, padding: '48px 40px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    borderRight: `1px solid ${S.border}`, position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,140,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px rgba(79,140,255,0.35)` }}>
                            <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>O</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '15px' }}>
                            <span style={{ color: S.textPrimary }}>Our</span><span style={{ color: S.accent }}>ivo</span>
                        </span>
                    </div>

                    {/* Main copy */}
                    <div>
                        <h2 style={{ color: S.textPrimary, fontSize: '26px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: '12px' }}>
                            Never miss a<br />property lead<br />
                            <span style={{ background: `linear-gradient(90deg, ${S.accent}, #818cf8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>again.</span>
                        </h2>
                        <p style={{ color: S.textSecondary, fontSize: '13px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '260px' }}>
                            Your AI chatbot captures and qualifies WhatsApp leads 24/7 — while you focus on closing deals.
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { value: '24/7', label: 'Lead capture' },
                                { value: '< 3s', label: 'Response' },
                                { value: '0', label: 'Missed' },
                            ].map((s, i) => (
                                <div key={i} style={{ flex: 1, padding: '14px 12px', background: S.surface2, border: `1px solid ${S.border}`, borderRadius: '11px', transition: 'all 200ms ease', cursor: 'default' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    <div style={{ color: S.accent, fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>{s.value}</div>
                                    <div style={{ color: S.textMuted, fontSize: '10px', fontWeight: 500 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div style={{ padding: '18px', background: S.surface2, border: `1px solid ${S.border}`, borderRadius: '13px' }}>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                            {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbf24', fontSize: '11px' }}>★</span>)}
                        </div>
                        <p style={{ color: S.textSecondary, fontSize: '12px', lineHeight: 1.75, marginBottom: '12px' }}>
                            "I was losing 5–6 leads every night. Now my chatbot captures everything and I wake up to qualified prospects."
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${S.accent}, #818cf8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700 }}>R</div>
                            <div>
                                <div style={{ color: S.textPrimary, fontSize: '12px', fontWeight: 600 }}>Rahul Sharma</div>
                                <div style={{ color: S.textMuted, fontSize: '11px' }}>Property Consultant, Bangalore</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div style={{ flex: 1, background: '#0F1115', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '23px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em', marginBottom: '6px' }}>
                            Welcome back
                        </h1>
                        <p style={{ color: S.textSecondary, fontSize: '13px' }}>
                            Sign in to your Ourivo dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: S.textMuted, marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                Email address
                            </label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@youragency.com"
                                style={{ width: '100%', padding: '11px 14px', background: S.surface, border: `1.5px solid ${S.border}`, borderRadius: '10px', color: S.textPrimary, fontSize: '14px', fontFamily: 'var(--font-family)', outline: 'none', transition: 'all 180ms ease', boxSizing: 'border-box' }}
                                onFocus={e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`; }}
                                onBlur={e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div style={{ marginBottom: '26px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
                                <span style={{ fontSize: '12px', color: S.accent, cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
                            </div>
                            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••"
                                style={{ width: '100%', padding: '11px 14px', background: S.surface, border: `1.5px solid ${S.border}`, borderRadius: '10px', color: S.textPrimary, fontSize: '14px', fontFamily: 'var(--font-family)', outline: 'none', transition: 'all 180ms ease', boxSizing: 'border-box' }}
                                onFocus={e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`; }}
                                onBlur={e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <button type="submit" disabled={loading}
                            style={{ width: '100%', padding: '12px', background: loading ? S.surface2 : `linear-gradient(135deg, ${S.accent}, #6366f1)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-family)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 180ms ease', boxShadow: loading ? 'none' : `0 4px 18px rgba(79,140,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.01em' }}
                            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(79,140,255,0.4)`; } }}
                            onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 18px rgba(79,140,255,0.3)`; } }}>
                            {loading ? (
                                <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} />Signing in...</>
                            ) : 'Sign in to Dashboard →'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: S.border }} />
                        <span style={{ color: S.textMuted, fontSize: '11px' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: S.border }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: S.textSecondary }}>
                        New to Ourivo?{' '}
                        <Link href="/register" style={{ color: S.accent, fontWeight: 600, textDecoration: 'none' }}>Create free account</Link>
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '32px' }}>
                        {[{ icon: '🔒', text: 'Secure' }, { icon: '⚡', text: 'Instant access' }].map((t, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: S.textMuted, fontWeight: 500 }}>
                                {t.icon} {t.text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                input::placeholder { color: #5C6A7E; }
            `}</style>
        </div>
    );
}