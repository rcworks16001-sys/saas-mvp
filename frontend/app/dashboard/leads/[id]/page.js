'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

const STATUS_CONFIG = {
    new: { label: 'New', color: '#4F8CFF', bg: 'rgba(79,140,255,0.12)' },
    contacted: { label: 'Contacted', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    qualified: { label: 'Qualified', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    site_visit: { label: 'Site Visit', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    converted: { label: 'Converted', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    lost: { label: 'Lost', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

const SCORE_CONFIG = {
    hot: { label: '🔥 Hot', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    warm: { label: '⚡ Warm', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    cold: { label: '❄️ Cold', color: '#9AA4B2', bg: 'rgba(154,164,178,0.12)' },
};

export default function LeadDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [lead, setLead] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const conversationEndRef = useRef(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        fetchLead();
    }, []);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations]);

    const fetchLead = async () => {
        try {
            const response = await api.get(`/leads/${params.id}`);
            setLead(response.data.lead);
            setConversations(response.data.conversations);
        } catch (error) {
            toast.error('Failed to load lead');
            if (error.response?.status === 401) router.push('/login');
            if (error.response?.status === 404) router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            await api.patch(`/leads/${params.id}/status`, { status: newStatus });
            setLead({ ...lead, status: newStatus });
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const deleteLead = async () => {
        setDeleting(true);
        try {
            await api.delete(`/leads/${params.id}`);
            toast.success('Lead deleted');
            router.push('/dashboard');
        } catch (error) {
            toast.error('Failed to delete lead');
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const sendReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            await api.post(`/leads/${params.id}/reply`, { message: replyText.trim() });
            setConversations(prev => [...prev, {
                sender: 'agent',
                message: replyText.trim(),
                created_at: new Date().toISOString()
            }]);
            setReplyText('');
            toast.success('Message sent');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getSenderStyle = (sender) => {
        switch (sender) {
            case 'customer':
                return {
                    justify: 'flex-start',
                    bg: S.surface2,
                    border: S.border,
                    borderRadius: '4px 14px 14px 14px',
                    labelColor: S.textMuted,
                    textColor: '#E2E8F0',
                    label: 'Customer'
                };
            case 'bot':
                return {
                    justify: 'flex-end',
                    bg: 'rgba(79,140,255,0.12)',
                    border: 'rgba(79,140,255,0.2)',
                    borderRadius: '14px 4px 14px 14px',
                    labelColor: S.accent,
                    textColor: '#CBD5E1',
                    label: 'Bot'
                };
            case 'agent':
                return {
                    justify: 'flex-end',
                    bg: 'rgba(52,211,153,0.1)',
                    border: 'rgba(52,211,153,0.25)',
                    borderRadius: '14px 4px 14px 14px',
                    labelColor: '#34d399',
                    textColor: '#E2E8F0',
                    label: 'You'
                };
            default:
                return {
                    justify: 'flex-start',
                    bg: S.surface2,
                    border: S.border,
                    borderRadius: '4px 14px 14px 14px',
                    labelColor: S.textMuted,
                    textColor: '#E2E8F0',
                    label: sender
                };
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-family)' }}>
                <div style={{ width: '24px', height: '24px', border: `2px solid ${S.border}`, borderTopColor: S.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!lead) return null;

    const requirements = lead.requirements || {};

    return (
        <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'var(--font-family)', color: S.textPrimary }}>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗑️</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: S.textPrimary, marginBottom: '8px' }}>Delete this lead?</h3>
                        <p style={{ fontSize: '13px', color: S.textSecondary, lineHeight: 1.6, marginBottom: '24px' }}>
                            This will permanently delete <strong style={{ color: S.textPrimary }}>{lead.name}</strong> and all their conversation history. This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${S.border}`, background: 'transparent', color: S.textSecondary, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                                Cancel
                            </button>
                            <button onClick={deleteLead} disabled={deleting} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontSize: '13px', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family)', opacity: deleting ? 0.6 : 1 }}>
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '58px', background: S.surface, borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 14px rgba(79,140,255,0.35)` }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '12px' }}>O</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>
                        <span style={{ color: S.textPrimary }}>Our</span><span style={{ color: S.accent }}>ivo</span>
                    </span>
                </div>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '8px', color: S.textSecondary, fontSize: '13px', fontWeight: 500, textDecoration: 'none', transition: 'all 180ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; e.currentTarget.style.color = S.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textSecondary; }}>
                    ← Back to Dashboard
                </Link>
            </nav>

            {/* Content */}
            <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em' }}>
                                {lead.name || 'Unknown Lead'}
                            </h1>
                            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, color: STATUS_CONFIG[lead.status]?.color, background: STATUS_CONFIG[lead.status]?.bg }}>
                                {STATUS_CONFIG[lead.status]?.label}
                            </span>
                            {lead.score > 0 && (
                                <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: SCORE_CONFIG[lead.score_label]?.color, background: SCORE_CONFIG[lead.score_label]?.bg }}>
                                    {SCORE_CONFIG[lead.score_label]?.label} · {lead.score}pts
                                </span>
                            )}
                        </div>
                        <p style={{ color: S.textMuted, fontSize: '13px' }}>
                            Captured {formatDate(lead.created_at)} · via {lead.source}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                            <button key={value} onClick={() => updateStatus(value)} disabled={lead.status === value || updating}
                                style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${lead.status === value ? config.color : S.border}`, background: lead.status === value ? config.bg : 'transparent', color: lead.status === value ? config.color : S.textMuted, fontSize: '12px', fontWeight: 600, cursor: lead.status === value ? 'default' : 'pointer', fontFamily: 'var(--font-family)', transition: 'all 180ms ease', opacity: updating ? 0.5 : 1 }}
                                onMouseEnter={e => { if (lead.status !== value) { e.currentTarget.style.borderColor = config.color; e.currentTarget.style.color = config.color; e.currentTarget.style.background = config.bg; } }}
                                onMouseLeave={e => { if (lead.status !== value) { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = 'transparent'; } }}>
                                {config.label}
                            </button>
                        ))}
                        <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all 180ms ease' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}>
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                {/* Two column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>

                    {/* Left: Lead info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Contact details */}
                        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: '14px', padding: '20px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, color: S.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                                Contact Details
                            </h3>
                            {[
                                { label: 'Phone', value: lead.phone, icon: '📱' },
                                { label: 'WhatsApp', value: lead.whatsapp_number, icon: '💬' },
                                { label: 'Source', value: lead.source, icon: '📌' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${S.border}` : 'none' }}>
                                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '11px', color: S.textMuted, marginBottom: '2px' }}>{item.label}</div>
                                        <div style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 500, fontFamily: 'monospace' }}>{item.value || '—'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Requirements */}
                        {Object.keys(requirements).length > 0 && (
                            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: '14px', padding: '20px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: 700, color: S.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                                    Requirements
                                </h3>
                                {Object.entries(requirements).map(([key, value], i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < Object.keys(requirements).length - 1 ? `1px solid ${S.border}` : 'none' }}>
                                        <span style={{ fontSize: '12px', color: S.textMuted, textTransform: 'capitalize' }}>{key}</span>
                                        <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 600 }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* First message */}
                        {lead.message && (
                            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: '14px', padding: '20px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: 700, color: S.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    First Message
                                </h3>
                                <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.7, padding: '12px', background: S.surface2, borderRadius: '10px', border: `1px solid ${S.border}` }}>
                                    "{lead.message}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Conversation + Reply */}
                    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, color: S.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                Conversation
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: S.textMuted }}></div>
                                <span>🟦 Bot</span>
                                <span>🟩 You</span>
                                <span>⬜ Customer</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '300px', maxHeight: '420px' }}>
                            {conversations.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                                    <p style={{ color: S.textSecondary, fontSize: '14px', fontWeight: 500 }}>No messages yet</p>
                                    <p style={{ color: S.textMuted, fontSize: '12px', marginTop: '4px' }}>Conversation will appear here once the chatbot is connected</p>
                                </div>
                            ) : (
                                conversations.map((msg, i) => {
                                    const style = getSenderStyle(msg.sender);
                                    return (
                                        <div key={i} style={{ display: 'flex', justifyContent: style.justify }}>
                                            <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: style.borderRadius, background: style.bg, border: `1px solid ${style.border}` }}>
                                                <div style={{ fontSize: '10px', fontWeight: 700, color: style.labelColor, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {style.label}
                                                </div>
                                                <p style={{ fontSize: '13px', color: style.textColor, lineHeight: 1.6, margin: 0 }}>
                                                    {msg.message}
                                                </p>
                                                <div style={{ fontSize: '10px', color: S.textMuted, marginTop: '6px', textAlign: 'right' }}>
                                                    {formatDate(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={conversationEndRef} />
                        </div>

                        {/* Reply box */}
                        <div style={{ padding: '12px 16px', borderTop: `1px solid ${S.border}`, background: S.surface2 }}>
                            <div style={{ fontSize: '11px', color: S.textMuted, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#34d399' }}>●</span>
                                Reply as agent — sends directly to customer's WhatsApp
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendReply();
                                        }
                                    }}
                                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                                    rows={2}
                                    style={{
                                        flex: 1, padding: '10px 14px',
                                        background: S.surface,
                                        border: `1.5px solid ${S.border}`,
                                        borderRadius: '10px',
                                        color: '#E2E8F0', fontSize: '13px',
                                        fontFamily: 'var(--font-family)',
                                        outline: 'none', resize: 'none',
                                        lineHeight: 1.5,
                                        transition: 'all 180ms ease'
                                    }}
                                    onFocus={e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.1)`; }}
                                    onBlur={e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }}
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={sending || !replyText.trim()}
                                    style={{
                                        padding: '10px 18px',
                                        background: sending || !replyText.trim() ? S.border : `linear-gradient(135deg, ${S.accent}, #6366f1)`,
                                        border: 'none', borderRadius: '10px',
                                        color: 'white', fontSize: '13px', fontWeight: 700,
                                        cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                                        fontFamily: 'var(--font-family)',
                                        transition: 'all 180ms ease',
                                        whiteSpace: 'nowrap',
                                        boxShadow: sending || !replyText.trim() ? 'none' : '0 4px 12px rgba(79,140,255,0.3)'
                                    }}>
                                    {sending ? '...' : '↑ Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } textarea::placeholder { color: #5C6A7E; }`}</style>
        </div >
    );
}