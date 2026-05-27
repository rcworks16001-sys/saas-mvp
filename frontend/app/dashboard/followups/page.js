'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const DEFAULT_SEQUENCES = [
    { day: 1, enabled: true, message: "Hi {name}! Just checking in — are you still looking for a property in {area}? We have some great options available." },
    { day: 3, enabled: true, message: "Hi {name}! We have new listings matching your budget of {budget} in {area}. Would you like to know more?" },
    { day: 7, enabled: true, message: "Hi {name}! This is our final follow-up. We would love to help you find your perfect home. Reply anytime to reconnect with us." },
];

const VARIABLES = ['{name}', '{area}', '{budget}', '{bhk}'];

const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--mist)', border: '1.5px solid var(--ice)',
    borderRadius: 'var(--r-btn)', color: 'var(--ink)', fontSize: '14px',
    fontFamily: 'var(--font-inter)', outline: 'none',
    transition: 'all 0.18s', boxSizing: 'border-box',
};

const focusHandlers = {
    onFocus: e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; },
    onBlur: e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; },
};

export default function FollowupsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);
    const [sequences, setSequences] = useState(DEFAULT_SEQUENCES);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/followup/settings');
            setIsEnabled(response.data.is_enabled);
            setSequences(response.data.sequences || DEFAULT_SEQUENCES);
        } catch {
            toast.error('Failed to load follow-up settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/followup/settings', { is_enabled: isEnabled, sequences });
            toast.success('Follow-up settings saved');
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const resetToDefault = () => {
        setSequences(DEFAULT_SEQUENCES);
        setIsEnabled(true);
        toast.success('Reset to defaults');
    };

    const updateSequence = (index, field, value) => {
        const updated = [...sequences];
        updated[index] = { ...updated[index], [field]: value };
        setSequences(updated);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--ice)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 24, height: 24, border: '2px solid var(--ice)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--fog)', letterSpacing: 1 }}>LOADING...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ice)', fontFamily: 'var(--font-inter)', color: 'var(--ink)' }}>

            {/* ── Navbar ── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                height: 62, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 32px',
                background: '#fff', borderBottom: '1px solid #e8ecf4',
            }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <Image src="/logo.png" alt="Ourivo" width={34} height={34} style={{ borderRadius: 8 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: 1.5 }}>OURIVO</span>
                </Link>
                <Link href="/dashboard"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r-btn)', border: '1.5px solid var(--ice)', color: 'var(--ash)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ice)'; e.currentTarget.style.color = 'var(--ash)'; }}>
                    ← Back to Dashboard
                </Link>
            </nav>

            {/* ── Content ── */}
            <div style={{ padding: '32px 40px', maxWidth: 760, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Automation</div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.92, marginBottom: 6 }}>
                            FOLLOW-UPS.
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--ash)' }}>Auto-send WhatsApp messages to leads that go silent</p>
                    </div>
                    <button onClick={resetToDefault}
                        style={{ padding: '9px 16px', background: 'transparent', border: '1.5px solid var(--ice)', borderRadius: 'var(--r-btn)', color: 'var(--ash)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'all 0.18s', marginTop: 8 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ice)'; e.currentTarget.style.color = 'var(--ash)'; }}>
                        ↺ Reset to Default
                    </button>
                </div>

                {/* Master toggle */}
                <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 20, padding: '20px 24px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>🔄 Follow-up Automation</div>
                        <div style={{ fontSize: 12, color: 'var(--fog)', lineHeight: 1.6, maxWidth: 480 }}>
                            When enabled, your chatbot automatically follows up with leads that go silent.
                        </div>
                    </div>
                    <div onClick={() => setIsEnabled(!isEnabled)}
                        style={{ width: 50, height: 26, background: isEnabled ? 'var(--ink)' : 'var(--ice)', borderRadius: 999, cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 3, left: isEnabled ? 26 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                </div>

                {/* How it works */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 18px', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>💡 How it works</div>
                    <div style={{ fontSize: 12, color: 'var(--ash)', lineHeight: 1.8 }}>
                        When a lead stops responding, your bot sends follow-up messages at the intervals below.
                        Use{' '}
                        {VARIABLES.map((v, i) => (
                            <span key={v}>
                                <code style={{ color: 'var(--ink)', background: 'var(--green)', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{v}</code>
                                {i < VARIABLES.length - 1 ? ' ' : ''}
                            </span>
                        ))}
                        {' '}to personalise messages with lead details.
                    </div>
                </div>

                {/* Sequences */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {sequences.map((seq, i) => (
                        <div key={i} style={{
                            background: '#fff',
                            border: `1px solid ${seq.enabled ? 'var(--ink)' : '#e8ecf4'}`,
                            borderRadius: 20, padding: '20px 24px',
                            transition: 'all 0.2s',
                            opacity: seq.enabled ? 1 : 0.55,
                        }}>
                            {/* Row header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: seq.enabled ? 'var(--ink)' : 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: seq.enabled ? '#fff' : 'var(--fog)', transition: 'all 0.2s', letterSpacing: 0.5 }}>
                                        {seq.day}D
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 13, color: 'var(--ash)', fontWeight: 500 }}>Send after</span>
                                            <input
                                                type="number" min="1" max="30"
                                                value={seq.day}
                                                onChange={e => updateSequence(i, 'day', parseInt(e.target.value) || 1)}
                                                style={{ width: 60, padding: '4px 8px', background: 'var(--mist)', border: '1.5px solid var(--ice)', borderRadius: 8, color: 'var(--ink)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-inter)', outline: 'none', textAlign: 'center' }}
                                                onFocus={e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; }}
                                                onBlur={e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; }}
                                            />
                                            <span style={{ fontSize: 13, color: 'var(--ash)', fontWeight: 500 }}>days of silence</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--fog)', marginTop: 3 }}>{seq.day * 24} hours after last message</div>
                                    </div>
                                </div>

                                {/* Toggle */}
                                <div onClick={() => updateSequence(i, 'enabled', !seq.enabled)}
                                    style={{ width: 44, height: 24, background: seq.enabled ? 'var(--ink)' : 'var(--ice)', borderRadius: 999, cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                                    <div style={{ position: 'absolute', top: 3, left: seq.enabled ? 22 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                            </div>

                            {/* Message textarea */}
                            <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message</label>
                                <textarea
                                    value={seq.message}
                                    onChange={e => updateSequence(i, 'message', e.target.value)}
                                    rows={3}
                                    disabled={!seq.enabled}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65, opacity: seq.enabled ? 1 : 0.5, cursor: seq.enabled ? 'text' : 'not-allowed' }}
                                    onFocus={e => { if (seq.enabled) { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; } }}
                                    onBlur={e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; }}
                                />
                                {/* Variable chips */}
                                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {VARIABLES.map(v => (
                                        <span key={v}
                                            onClick={() => { if (seq.enabled) updateSequence(i, 'message', seq.message + v); }}
                                            style={{ fontSize: 11, padding: '3px 10px', background: 'var(--green)', border: 'none', borderRadius: 20, color: 'var(--ink)', fontWeight: 700, cursor: seq.enabled ? 'pointer' : 'default', fontFamily: 'monospace', transition: 'opacity 0.15s' }}
                                            onMouseEnter={e => { if (seq.enabled) e.currentTarget.style.opacity = '0.7'; }}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                            {v}
                                        </span>
                                    ))}
                                    <span style={{ fontSize: 11, color: 'var(--fog)' }}>← click to insert</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save */}
                <button onClick={handleSave} disabled={saving}
                    style={{ width: '100%', padding: '13px', background: saving ? 'var(--mist)' : 'var(--ink)', border: 'none', borderRadius: 'var(--r-btn)', color: saving ? 'var(--fog)' : '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-inter)', cursor: saving ? 'not-allowed' : 'pointer', transition: 'opacity 0.18s' }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {saving ? '⏳ Saving...' : '✓ Save Follow-up Settings'}
                </button>

                {/* Mini footer */}
                <div style={{ borderTop: '1px solid var(--ice)', marginTop: 48, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--fog)' }}>© 2025 Ourivo</span>
                    <div style={{ display: 'flex', gap: 20 }}>
                        {[['Help', '/help'], ['Feedback', '/feedback'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
                            <Link key={href} href={href} style={{ fontSize: 12, color: 'var(--fog)', textDecoration: 'none', transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--fog)'}>
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                textarea::placeholder { color: var(--fog); }
            `}</style>
        </div>
    );
}