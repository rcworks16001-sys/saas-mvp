'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '../../lib/api';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', accentDark: '#3a7aef', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [form, setForm] = useState({
        orgName: '', name: '', email: '', password: '', confirmPassword: '', phone: ''
    });

    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleStep1 = (e) => {
        e.preventDefault();
        if (!form.orgName || !form.name) {
            toast.error('Please fill all fields');
            return;
        }
        setStep(2);
    };

    const handleStep2 = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (!form.email) {
            toast.error('Email is required');
            return;
        }

        setLoading(true);
        try {
            await api.post('/otp/send', { email: form.email });
            setOtpSent(true);
            setStep(3);
            toast.success('Verification code sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await api.post('/otp/send', { email: form.email });
            toast.success('New code sent');
        } catch (error) {
            toast.error('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Enter the 6-digit code');
            return;
        }

        setLoading(true);
        try {
            // Verify OTP first
            await api.post('/otp/verify', { email: form.email, otp });

            // Create account
            const response = await api.post('/auth/register', {
                orgName: form.orgName,
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
            });

            const { token, user, organizationId } = response.data;
            Cookies.set('token', token, { expires: 7 });
            Cookies.set('organizationId', organizationId, { expires: 7 });
            Cookies.set('userName', user.name, { expires: 7 });
            toast.success('Account created! Welcome to Ourivo.');
            router.push('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: S.surface,
        border: `1.5px solid ${S.border}`,
        borderRadius: '10px',
        color: S.textPrimary, fontSize: '14px',
        fontFamily: 'var(--font-family)', outline: 'none',
        transition: 'all 180ms ease',
        boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block', fontSize: '11px', fontWeight: 600,
        color: S.textMuted, marginBottom: '8px',
        letterSpacing: '0.08em', textTransform: 'uppercase'
    };

    const focusHandlers = {
        onFocus: e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`; },
        onBlur: e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }
    };

    const totalSteps = 3;
    const progressWidth = `${(step / totalSteps) * 100}%`;

    return (
        <div style={{
            minHeight: '100vh', background: S.bg,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', position: 'relative',
            overflow: 'hidden', fontFamily: 'var(--font-family)'
        }}>

            <Particles id="tsparticles" init={particlesInit}
                options={{
                    background: { color: { value: 'transparent' } },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 50, density: { enable: true, area: 900 } },
                        color: { value: ['#4F8CFF', '#818cf8'] },
                        shape: { type: 'circle' },
                        opacity: { value: 0.18, animation: { enable: true, speed: 0.5, minimumValue: 0.05 } },
                        size: { value: { min: 1, max: 2 } },
                        links: { enable: true, distance: 150, color: '#4F8CFF', opacity: 0.06, width: 1 },
                        move: { enable: true, speed: 0.5, random: true, outModes: { default: 'bounce' } }
                    },
                    interactivity: {
                        events: { onHover: { enable: true, mode: 'repulse' } },
                        modes: { repulse: { distance: 80, duration: 0.4 } }
                    },
                    detectRetina: true
                }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
            />

            <div style={{ position: 'absolute', top: '-180px', right: '-180px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,140,255,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-180px', left: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Card */}
            <div style={{
                position: 'relative', zIndex: 1,
                width: '100%', maxWidth: '480px', margin: '24px',
                background: S.surface, borderRadius: '20px',
                border: `1px solid ${S.border}`,
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                overflow: 'hidden', animation: 'fadeUp 0.4s ease forwards'
            }}>

                {/* Progress bar */}
                <div style={{ height: '3px', background: S.surface2 }}>
                    <div style={{ height: '100%', width: progressWidth, background: `linear-gradient(90deg, ${S.accent}, #818cf8)`, transition: 'width 400ms ease', borderRadius: '999px' }} />
                </div>

                <div style={{ padding: '40px' }}>

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px rgba(79,140,255,0.35)` }}>
                            <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>O</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '15px' }}>
                            <span style={{ color: S.textPrimary }}>Our</span><span style={{ color: S.accent }}>ivo</span>
                        </span>
                    </div>

                    {/* Step indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
                        {[
                            { n: 1, label: 'Business' },
                            { n: 2, label: 'Account' },
                            { n: 3, label: 'Verify' }
                        ].map((s, i) => (
                            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= s.n ? S.accent : S.surface2, border: `1.5px solid ${step >= s.n ? S.accent : S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: step >= s.n ? 'white' : S.textMuted, transition: 'all 300ms ease' }}>
                                    {step > s.n ? '✓' : s.n}
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 500, color: step >= s.n ? S.textSecondary : S.textMuted }}>{s.label}</span>
                                {i < 2 && <div style={{ width: '20px', height: '1px', background: step > s.n ? S.accent : S.border, margin: '0 2px', transition: 'background 300ms ease' }} />}
                            </div>
                        ))}
                    </div>

                    {/* STEP 1 — Business Info */}
                    {step === 1 && (
                        <form onSubmit={handleStep1} style={{ animation: 'fadeUp 0.3s ease' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>Create your account</h1>
                            <p style={{ color: S.textMuted, fontSize: '13px', marginBottom: '24px' }}>Start capturing leads in under 5 minutes</p>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Business / Agency Name</label>
                                <input type="text" name="orgName" value={form.orgName} onChange={handleChange} required placeholder="e.g. Sharma Properties" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Your Full Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Rahul Sharma" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Phone Number (for lead notifications)</label>
                                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 917294034023 (with country code)" style={inputStyle} {...focusHandlers} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-family)', cursor: 'pointer', transition: 'all 180ms ease', boxShadow: `0 4px 18px rgba(79,140,255,0.3)` }}>
                                Continue →
                            </button>
                        </form>
                    )}

                    {/* STEP 2 — Account Setup */}
                    {step === 2 && (
                        <form onSubmit={handleStep2} style={{ animation: 'fadeUp 0.3s ease' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>Set up your login</h1>
                            <p style={{ color: S.textMuted, fontSize: '13px', marginBottom: '24px' }}>You will use these to sign in every time</p>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Email Address</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@youragency.com" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Password</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Confirm Password</label>
                                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Repeat your password" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setStep(1)} style={{ flex: '0 0 auto', padding: '12px 20px', background: 'transparent', border: `1.5px solid ${S.border}`, borderRadius: '10px', color: S.textSecondary, fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-family)', cursor: 'pointer', transition: 'all 180ms ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSecondary; }}>
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? S.surface2 : `linear-gradient(135deg, ${S.accent}, #6366f1)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-family)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 180ms ease', boxShadow: loading ? 'none' : `0 4px 18px rgba(79,140,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {loading ? (
                                        <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} />Sending code...</>
                                    ) : 'Send Verification Code →'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3 — OTP Verification */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} style={{ animation: 'fadeUp 0.3s ease' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>Verify your email</h1>
                            <p style={{ color: S.textMuted, fontSize: '13px', marginBottom: '8px' }}>
                                We sent a 6-digit code to
                            </p>
                            <p style={{ color: S.accent, fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
                                {form.email}
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Verification Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    style={{
                                        ...inputStyle,
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        letterSpacing: '6px',
                                        textAlign: 'center',
                                    }}
                                    {...focusHandlers}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                    <span style={{ fontSize: '11px', color: S.textMuted }}>Code expires in 10 minutes</span>
                                    <button type="button" onClick={handleResendOTP} disabled={loading} style={{ fontSize: '11px', color: S.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', fontWeight: 600, padding: 0 }}>
                                        Resend code
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setStep(2)} style={{ flex: '0 0 auto', padding: '12px 20px', background: 'transparent', border: `1.5px solid ${S.border}`, borderRadius: '10px', color: S.textSecondary, fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-family)', cursor: 'pointer', transition: 'all 180ms ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSecondary; }}>
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading || otp.length !== 6} style={{ flex: 1, padding: '12px', background: loading || otp.length !== 6 ? S.surface2 : `linear-gradient(135deg, ${S.accent}, #6366f1)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-family)', cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer', transition: 'all 180ms ease', boxShadow: loading || otp.length !== 6 ? 'none' : `0 4px 18px rgba(79,140,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {loading ? (
                                        <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} />Creating account...</>
                                    ) : 'Create Account ✓'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p style={{ textAlign: 'center', fontSize: '13px', color: S.textMuted, marginTop: '24px' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: S.accent, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: #5C6A7E; }
            `}</style>
        </div>
    );
}