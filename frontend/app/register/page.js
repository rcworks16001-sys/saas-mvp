'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '../../lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [form, setForm] = useState({
        orgName: '', name: '', email: '', password: '', confirmPassword: '', phone: ''
    });

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
            await api.post('/otp/verify', { email: form.email, otp });
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

    const STEPS = [
        { n: 1, label: 'Business' },
        { n: 2, label: 'Account' },
        { n: 3, label: 'Verify' },
    ];

    const inputStyle = {
        width: '100%', padding: '12px 14px',
        background: 'var(--mist)',
        border: '1.5px solid var(--ice)',
        borderRadius: 'var(--r-btn)',
        color: 'var(--ink)', fontSize: '14px',
        fontFamily: 'var(--font-inter)', outline: 'none',
        transition: 'all 0.18s', boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block', fontSize: '10px', fontWeight: 700,
        color: 'var(--fog)', marginBottom: '8px',
        letterSpacing: '0.1em', textTransform: 'uppercase',
    };

    const focusHandlers = {
        onFocus: e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; },
        onBlur: e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; },
    };

    const btnPrimary = (disabled = false) => ({
        flex: 1, padding: '13px',
        background: disabled ? 'var(--mist)' : 'var(--ink)',
        border: 'none', borderRadius: 'var(--r-btn)',
        color: disabled ? 'var(--fog)' : '#fff',
        fontSize: '14px', fontWeight: 700,
        fontFamily: 'var(--font-inter)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.18s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        letterSpacing: -0.2,
    });

    const btnBack = {
        flexShrink: 0, padding: '13px 20px',
        background: 'transparent',
        border: '1.5px solid var(--ice)',
        borderRadius: 'var(--r-btn)',
        color: 'var(--ash)', fontSize: '14px', fontWeight: 600,
        fontFamily: 'var(--font-inter)', cursor: 'pointer',
        transition: 'all 0.18s',
    };

    const Spinner = () => (
        <span style={{ width: 13, height: 13, border: '2px solid #ccc', borderTopColor: 'var(--ash)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} />
    );

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
                width: '100%', maxWidth: 480,
                background: '#fff',
                borderRadius: 'var(--r-card)',
                border: '1px solid #d4d8de',
                overflow: 'hidden',
            }}>

                {/* Progress bar */}
                <div style={{ height: 4, background: 'var(--ice)' }}>
                    <div style={{
                        height: '100%',
                        width: `${(step / 3) * 100}%`,
                        background: 'var(--ink)',
                        transition: 'width 0.4s var(--ease)',
                        borderRadius: '0 4px 4px 0',
                    }} />
                </div>

                <div style={{ padding: '40px' }}>

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                        <Image src="/logo.png" alt="Ourivo" width={36} height={36} style={{ borderRadius: 8 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: 1.5 }}>OURIVO</span>
                    </div>

                    {/* Step indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
                        {STEPS.map((s, i) => (
                            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: '50%',
                                    background: step > s.n ? 'var(--green)' : step === s.n ? 'var(--ink)' : 'transparent',
                                    border: step >= s.n ? 'none' : '1.5px solid var(--ice)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 800,
                                    color: step >= s.n ? (step > s.n ? 'var(--ink)' : '#fff') : 'var(--fog)',
                                    transition: 'all 0.3s',
                                    flexShrink: 0,
                                }}>
                                    {step > s.n ? '✓' : s.n}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: step === s.n ? 700 : 500, color: step >= s.n ? 'var(--ink)' : 'var(--fog)', transition: 'color 0.3s' }}>
                                    {s.label}
                                </span>
                                {i < 2 && (
                                    <div style={{ width: 24, height: 1.5, background: step > s.n ? 'var(--ink)' : 'var(--ice)', margin: '0 4px', transition: 'background 0.3s', flexShrink: 0 }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ── STEP 1: Business info ── */}
                    {step === 1 && (
                        <form onSubmit={handleStep1}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.95, marginBottom: 8 }}>
                                CREATE YOUR<br />ACCOUNT.
                            </h1>
                            <p style={{ fontSize: 13, color: 'var(--ash)', marginBottom: 28, lineHeight: 1.5 }}>
                                Start capturing leads in under 5 minutes
                            </p>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Business / Agency name</label>
                                <input type="text" name="orgName" value={form.orgName} onChange={handleChange} required placeholder="e.g. Sharma Properties" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Your full name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Rahul Sharma" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: 28 }}>
                                <label style={labelStyle}>Phone number <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(for lead notifications)</span></label>
                                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 917294034023 (with country code)" style={inputStyle} {...focusHandlers} />
                            </div>

                            <button type="submit" style={btnPrimary()}>
                                Continue →
                            </button>
                        </form>
                    )}

                    {/* ── STEP 2: Account setup ── */}
                    {step === 2 && (
                        <form onSubmit={handleStep2}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.95, marginBottom: 8 }}>
                                SET UP YOUR<br />LOGIN.
                            </h1>
                            <p style={{ fontSize: 13, color: 'var(--ash)', marginBottom: 28, lineHeight: 1.5 }}>
                                You will use these to sign in every time
                            </p>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Email address</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@youragency.com" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Password</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ marginBottom: 28 }}>
                                <label style={labelStyle}>Confirm password</label>
                                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Repeat your password" style={inputStyle} {...focusHandlers} />
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setStep(1)} style={btnBack}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ice)'}>
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading} style={btnPrimary(loading)}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}>
                                    {loading ? <><Spinner /> Sending code...</> : 'Send Verification Code →'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── STEP 3: OTP verification ── */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.95, marginBottom: 8 }}>
                                VERIFY YOUR<br />EMAIL.
                            </h1>
                            <p style={{ fontSize: 13, color: 'var(--ash)', marginBottom: 4, lineHeight: 1.5 }}>
                                We sent a 6-digit code to
                            </p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 28 }}>
                                {form.email}
                            </p>

                            <div style={{ marginBottom: 28 }}>
                                <label style={labelStyle}>Verification code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    style={{ ...inputStyle, fontSize: 24, fontWeight: 800, letterSpacing: 10, textAlign: 'center' }}
                                    {...focusHandlers}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                    <span style={{ fontSize: 11, color: 'var(--fog)' }}>Code expires in 10 minutes</span>
                                    <button type="button" onClick={handleResendOTP} disabled={loading}
                                        style={{ fontSize: 11, color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontWeight: 700, padding: 0, textDecoration: 'underline' }}>
                                        Resend code
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setStep(2)} style={btnBack}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ice)'}>
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading || otp.length !== 6}
                                    style={{
                                        ...btnPrimary(loading || otp.length !== 6),
                                        background: (!loading && otp.length === 6) ? 'var(--green)' : 'var(--mist)',
                                        color: (!loading && otp.length === 6) ? 'var(--ink)' : 'var(--fog)',
                                    }}
                                    onMouseEnter={e => { if (!loading && otp.length === 6) e.currentTarget.style.opacity = '0.85'; }}
                                    onMouseLeave={e => { if (!loading && otp.length === 6) e.currentTarget.style.opacity = '1'; }}>
                                    {loading ? <><Spinner /> Creating account...</> : 'Create Account ✓'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fog)', marginTop: 28 }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: var(--fog); }
            `}</style>
        </div>
    );
}