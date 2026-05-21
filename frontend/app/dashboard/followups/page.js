'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

const DEFAULT_SEQUENCES = [
    { day: 1, enabled: true, message: "Hi {name}! Just checking in — are you still looking for a property in {area}? We have some great options available." },
    { day: 3, enabled: true, message: "Hi {name}! We have new listings matching your budget of {budget} in {area}. Would you like to know more?" },
    { day: 7, enabled: true, message: "Hi {name}! This is our final follow-up. We would love to help you find your perfect home. Reply anytime to reconnect with us." },
];

const VARIABLES = ['{name}', '{area}', '{budget}', '{bhk}'];

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
        } catch (error) {
            toast.error('Failed to load follow-up settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/followup/settings', {
                is_enabled: isEnabled,
                sequences
            });
            toast.success('Follow-up settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const resetToDefault = () => {
        setSequences(DEFAULT_SEQUENCES);
        setIsEnabled(true);
        toast.success('Reset to default settings');
    };

    const updateSequence = (index, field, value) => {
        const updated = [...sequences];
        updated[index] = { ...updated[index], [field]: value };
        setSequences(updated);
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px',
        background: S.surface2, border: `1.5px solid ${S.border}`,
        borderRadius: '10px', color: S.textPrimary, fontSize: '14px',
        fontFamily: 'var(--font-family)', outline: 'none',
        transition: 'all 180ms ease', boxSizing: 'border-box',
    };

    const focusHandlers = {
        onFocus: e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`; },
        onBlur: e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '24px', height: '24px', border: `2px solid ${S.border}`, borderTopColor: S.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'var(--font-family)', color: S.textPrimary }}>

            {/* Navbar */}
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '58px', background: S.surface, borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: S.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 14px rgba(79,140,255,0.35)` }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>W</span>
                    </div>
                    <span style={{ color: S.textPrimary, fontWeight: 600, fontSize: '14px' }}>WhatsApp CRM</span>
                </div>
                <Link href="/dashboard" style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '8px', color: S.textSecondary, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                    ← Back to Dashboard
                </Link>
            </nav>

            <div style={{ padding: '32px 40px', maxWidth: '760px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(79,140,255,0.2), rgba(99,102,241,0.15))', border: `1px solid rgba(79,140,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            🔄
                        </div>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em' }}>Follow-up Automation</h1>
                            <p style={{ color: S.textMuted, fontSize: '13px', marginTop: '2px' }}>Auto-send WhatsApp messages to silent leads</p>
                        </div>
                    </div>
                    <button onClick={resetToDefault} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '8px', color: S.textMuted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all 180ms ease' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMuted; }}>
                        ↺ Reset to Default
                    </button>
                </div>

                {/* Master toggle */}
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: '16px', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: S.textPrimary, marginBottom: '4px' }}>
                            🔄 Follow-up Automation
                        </div>
                        <div style={{ fontSize: '12px', color: S.textMuted, lineHeight: 1.6 }}>
                            When enabled, your chatbot automatically follows up with leads that go silent.
                        </div>
                    </div>
                    <div onClick={() => setIsEnabled(!isEnabled)} style={{ width: '52px', height: '28px', background: isEnabled ? `linear-gradient(135deg, ${S.accent}, #6366f1)` : S.border, borderRadius: '999px', cursor: 'pointer', position: 'relative', transition: 'all 250ms ease', boxShadow: isEnabled ? '0 2px 12px rgba(79,140,255,0.4)' : 'none', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: '4px', left: isEnabled ? '26px' : '4px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                </div>

                {/* How it works */}
                <div style={{ background: 'rgba(79,140,255,0.05)', border: `1px solid rgba(79,140,255,0.15)`, borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: S.accent, marginBottom: '10px' }}>💡 How it works</div>
                    <div style={{ fontSize: '12px', color: S.textSecondary, lineHeight: 1.8 }}>
                        When a lead stops responding, your bot automatically sends follow-up messages at the intervals you set below.
                        Use <code style={{ color: S.accent, background: 'rgba(79,140,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{'{name}'}</code>,
                        <code style={{ color: S.accent, background: 'rgba(79,140,255,0.1)', padding: '1px 6px', borderRadius: '4px', margin: '0 4px' }}>{'{area}'}</code>,
                        <code style={{ color: S.accent, background: 'rgba(79,140,255,0.1)', padding: '1px 6px', borderRadius: '4px', margin: '0 4px' }}>{'{budget}'}</code>,
                        <code style={{ color: S.accent, background: 'rgba(79,140,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{'{bhk}'}</code> to personalize messages with lead details.
                    </div>
                </div>

                {/* Sequences */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {sequences.map((seq, i) => (
                        <div key={i} style={{ background: S.surface, border: `1px solid ${seq.enabled ? 'rgba(79,140,255,0.2)' : S.border}`, borderRadius: '16px', padding: '20px 24px', transition: 'all 200ms ease', opacity: seq.enabled ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: seq.enabled ? `linear-gradient(135deg, ${S.accent}, #6366f1)` : S.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white', transition: 'all 200ms ease' }}>
                                        {seq.day}d
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '13px', color: S.textSecondary, fontWeight: 500 }}>
                                                Send after
                                            </span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={seq.day}
                                                onChange={e => updateSequence(i, 'day', parseInt(e.target.value) || 1)}
                                                style={{
                                                    width: '60px', padding: '4px 8px',
                                                    background: S.surface2,
                                                    border: `1.5px solid ${S.border}`,
                                                    borderRadius: '8px',
                                                    color: S.textPrimary, fontSize: '14px',
                                                    fontWeight: 700, fontFamily: 'var(--font-family)',
                                                    outline: 'none', textAlign: 'center'
                                                }}
                                            />
                                            <span style={{ fontSize: '13px', color: S.textSecondary, fontWeight: 500 }}>
                                                days of silence
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: S.textMuted, marginTop: '4px' }}>
                                            = {(seq.day * 24)} hours after last message
                                        </div>
                                    </div>
                                </div>
                                <div onClick={() => updateSequence(i, 'enabled', !seq.enabled)} style={{ width: '44px', height: '24px', background: seq.enabled ? `linear-gradient(135deg, ${S.accent}, #6366f1)` : S.border, borderRadius: '999px', cursor: 'pointer', position: 'relative', transition: 'all 250ms ease' }}>
                                    <div style={{ position: 'absolute', top: '3px', left: seq.enabled ? '22px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Message</label>
                                <textarea
                                    value={seq.message}
                                    onChange={e => updateSequence(i, 'message', e.target.value)}
                                    rows={3}
                                    disabled={!seq.enabled}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, opacity: seq.enabled ? 1 : 0.5, cursor: seq.enabled ? 'text' : 'not-allowed' }}
                                    {...focusHandlers}
                                />
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    {VARIABLES.map(v => (
                                        <span key={v} style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(79,140,255,0.08)', border: `1px solid rgba(79,140,255,0.15)`, borderRadius: '4px', color: S.accent, cursor: 'pointer' }}
                                            onClick={() => {
                                                if (seq.enabled) updateSequence(i, 'message', seq.message + v);
                                            }}>
                                            {v}
                                        </span>
                                    ))}
                                    <span style={{ fontSize: '11px', color: S.textMuted }}>← click to insert</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save button */}
                <button onClick={handleSave} disabled={saving} style={{
                    width: '100%', padding: '13px',
                    background: saving ? S.surface2 : `linear-gradient(135deg, ${S.accent}, #6366f1)`,
                    border: 'none', borderRadius: '12px',
                    color: 'white', fontSize: '14px', fontWeight: 700,
                    fontFamily: 'var(--font-family)',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 200ms ease',
                    boxShadow: saving ? 'none' : `0 4px 24px rgba(79,140,255,0.35)`,
                }}>
                    {saving ? '⏳ Saving...' : '✓ Save Follow-up Settings'}
                </button>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                textarea::placeholder { color: #5C6A7E; }
            `}</style>
        </div>
    );
}