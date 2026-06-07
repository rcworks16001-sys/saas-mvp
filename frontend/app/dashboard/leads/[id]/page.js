'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';

const STATUS_CONFIG = {
    new: { label: 'New', bg: 'var(--yellow)', color: 'var(--ink)' },
    contacted: { label: 'Contacted', bg: 'var(--mist)', color: 'var(--ash)' },
    qualified: { label: 'Qualified', bg: 'var(--green)', color: 'var(--ink)' },
    site_visit: { label: 'Site Visit', bg: 'var(--green)', color: 'var(--ink)' },
    converted: { label: 'Converted', bg: 'var(--ink)', color: '#fff' },
    lost: { label: 'Lost', bg: 'var(--mist)', color: 'var(--fog)' },
};

const SCORE_CONFIG = {
    hot: { label: '🔥 Hot', bg: 'var(--yellow)', color: 'var(--ink)' },
    warm: { label: '✳ Warm', bg: 'var(--green)', color: 'var(--ink)' },
    cold: { label: '❄️ Cold', bg: 'var(--mist)', color: 'var(--ash)' },
};

// IST-aware date formatting — fixes the UTC display bug
const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Kolkata',
    });
};

const getSenderStyle = (sender) => {
    switch (sender) {
        case 'customer': return {
            justify: 'flex-start',
            bg: 'var(--mist)', border: 'var(--ice)',
            borderRadius: '4px 16px 16px 16px',
            labelColor: 'var(--fog)', textColor: 'var(--ink)',
            label: 'Customer',
        };
        case 'bot': return {
            justify: 'flex-end',
            bg: 'var(--ink)', border: 'var(--ink)',
            borderRadius: '16px 4px 16px 16px',
            labelColor: 'var(--green)', textColor: '#fff',
            label: 'AI Bot',
        };
        case 'agent': return {
            justify: 'flex-end',
            bg: 'var(--green)', border: 'var(--green)',
            borderRadius: '16px 4px 16px 16px',
            labelColor: 'var(--ink)', textColor: 'var(--ink)',
            label: 'You',
        };
        default: return {
            justify: 'flex-start',
            bg: 'var(--mist)', border: 'var(--ice)',
            borderRadius: '4px 16px 16px 16px',
            labelColor: 'var(--fog)', textColor: 'var(--ink)',
            label: sender,
        };
    }
};

export default function LeadDetailPage() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useUser();
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
    const prevConvCount = useRef(0);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) { router.push('/sign-in'); return; }
        fetchLead();

        // Poll every 7s so new WhatsApp messages appear without a manual refresh.
        const pollId = setInterval(refreshLeadSilently, 5000);
        return () => clearInterval(pollId);
    }, [isLoaded, isSignedIn]);

    useEffect(() => {
        // Only auto-scroll when new messages actually arrived, not on every poll.
        // Otherwise the view yanks the agent to the bottom every few seconds even
        // when they've scrolled up to read earlier messages.
        if (conversations.length > prevConvCount.current) {
            conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevConvCount.current = conversations.length;
    }, [conversations]);

    const fetchLead = async () => {
        try {
            const response = await api.get(`/leads/${params.id}`);
            setLead(response.data.lead);
            setConversations(response.data.conversations);
        } catch (error) {
            toast.error('Failed to load lead');
            if (error.response?.status === 401) router.push('/sign-in');
            if (error.response?.status === 404) router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Silent background refresh for polling — no spinner, no toast, no redirects.
    // A blip just gets retried on the next tick; we don't disrupt the open page.
    const refreshLeadSilently = async () => {
        try {
            const response = await api.get(`/leads/${params.id}`);
            setLead(response.data.lead);
            setConversations(response.data.conversations);
        } catch (error) {
            // Intentionally swallow transient poll errors.
        }
    };

    const updateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            await api.patch(`/leads/${params.id}/status`, { status: newStatus });
            setLead({ ...lead, status: newStatus });
            toast.success('Status updated');
        } catch {
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
        } catch {
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
                created_at: new Date().toISOString(),
            }]);
            setReplyText('');
            toast.success('Message sent');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Loading state
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

    if (!lead) return null;

    const requirements = lead.requirements || {};

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ice)', fontFamily: 'var(--font-inter)' }}>

            {/* ── Delete modal ── */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: '#fff', borderRadius: 'var(--r-card)', padding: 32, maxWidth: 380, width: '100%', textAlign: 'center', border: '1px solid #d4d8de' }}>
                        <div style={{ width: 48, height: 48, background: '#fef2f2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 16px' }}>🗑️</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', letterSpacing: 0.5, marginBottom: 10 }}>DELETE LEAD?</h3>
                        <p style={{ fontSize: 13, color: 'var(--ash)', lineHeight: 1.65, marginBottom: 24 }}>
                            This permanently deletes <strong style={{ color: 'var(--ink)' }}>{lead.name}</strong> and all their conversation history. Cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                                style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-btn)', border: '1.5px solid var(--ice)', background: 'transparent', color: 'var(--ash)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                                Cancel
                            </button>
                            <button onClick={deleteLead} disabled={deleting}
                                style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-btn)', border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)', opacity: deleting ? 0.6 : 1 }}>
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r-btn)', border: '1.5px solid var(--ice)', background: 'transparent', color: 'var(--ash)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ice)'; e.currentTarget.style.color = 'var(--ash)'; }}>
                    ← Back to Dashboard
                </Link>
            </nav>

            {/* ── Content ── */}
            <div style={{ padding: '32px', maxWidth: 1160, margin: '0 auto' }}>

                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                            Lead detail
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.95 }}>
                                {lead.name || 'UNKNOWN LEAD'}
                            </h1>
                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: STATUS_CONFIG[lead.status]?.bg, color: STATUS_CONFIG[lead.status]?.color }}>
                                {STATUS_CONFIG[lead.status]?.label}
                            </span>
                            {lead.score > 0 && (
                                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: SCORE_CONFIG[lead.score_label]?.bg, color: SCORE_CONFIG[lead.score_label]?.color }}>
                                    {SCORE_CONFIG[lead.score_label]?.label} · {lead.score}pts
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--fog)' }}>
                            Captured {formatDate(lead.created_at)} · via {lead.source}
                        </p>
                    </div>

                    {/* Status buttons + delete */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                            <button key={value} onClick={() => updateStatus(value)}
                                disabled={lead.status === value || updating}
                                style={{
                                    padding: '7px 14px', borderRadius: 'var(--r-btn)',
                                    border: `1.5px solid ${lead.status === value ? 'var(--ink)' : 'var(--ice)'}`,
                                    background: lead.status === value ? 'var(--ink)' : 'transparent',
                                    color: lead.status === value ? '#fff' : 'var(--ash)',
                                    fontSize: 12, fontWeight: 700,
                                    cursor: lead.status === value ? 'default' : 'pointer',
                                    fontFamily: 'var(--font-inter)',
                                    transition: 'all 0.18s',
                                    opacity: updating ? 0.5 : 1,
                                }}
                                onMouseEnter={e => { if (lead.status !== value) { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; } }}
                                onMouseLeave={e => { if (lead.status !== value) { e.currentTarget.style.borderColor = 'var(--ice)'; e.currentTarget.style.color = 'var(--ash)'; } }}>
                                {config.label}
                            </button>
                        ))}
                        <button onClick={() => setShowDeleteConfirm(true)}
                            style={{ padding: '7px 14px', borderRadius: 'var(--r-btn)', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'all 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.background = '#fef2f2'; }}>
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                {/* Two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, alignItems: 'start' }}>

                    {/* ── Left: Lead info ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Contact details */}
                        <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 'var(--r-card)', padding: 24 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Contact details</div>
                            {[
                                { label: 'Phone', value: lead.phone, icon: '📱' },
                                { label: 'WhatsApp', value: lead.whatsapp_number, icon: '💬' },
                                { label: 'Source', value: lead.source, icon: '📌' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < 2 ? '1px solid var(--ice)' : 'none' }}>
                                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 10, color: 'var(--fog)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{item.label}</div>
                                        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, fontFamily: 'monospace' }}>{item.value || '—'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Requirements */}
                        {Object.keys(requirements).length > 0 && (
                            <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 'var(--r-card)', padding: 24 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Requirements</div>
                                {Object.entries(requirements).map(([key, value], i, arr) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--ice)' : 'none' }}>
                                        <span style={{ fontSize: 12, color: 'var(--fog)', textTransform: 'capitalize', fontWeight: 500 }}>{key}</span>
                                        <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* First message */}
                        {lead.message && (
                            <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 'var(--r-card)', padding: 24 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>First message</div>
                                <p style={{ fontSize: 13, color: 'var(--ash)', lineHeight: 1.7, padding: '14px', background: 'var(--mist)', borderRadius: 12, border: '1px solid var(--ice)', fontStyle: 'italic', margin: 0 }}>
                                    &ldquo;{lead.message}&rdquo;
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Conversation ── */}
                    <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 'var(--r-card)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        {/* Conversation header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ice)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Conversation</div>
                            <div style={{ display: 'flex', gap: 14, fontSize: 10, fontWeight: 600, color: 'var(--fog)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink)', display: 'inline-block' }} />AI Bot</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />You</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mist)', border: '1px solid var(--ice)', display: 'inline-block' }} />Customer</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 300, maxHeight: 440 }}>
                            {conversations.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
                                    <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', letterSpacing: 0.5, marginBottom: 6 }}>NO MESSAGES YET</div>
                                    <p style={{ fontSize: 12, color: 'var(--fog)' }}>Conversation appears here once the chatbot is connected</p>
                                </div>
                            ) : conversations.map((msg, i) => {
                                const style = getSenderStyle(msg.sender);
                                return (
                                    <div key={i} style={{ display: 'flex', justifyContent: style.justify }}>
                                        <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: style.borderRadius, background: style.bg, border: `1px solid ${style.border}` }}>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: style.labelColor, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {style.label}
                                            </div>
                                            <p style={{ fontSize: 13, color: style.textColor, lineHeight: 1.6, margin: 0 }}>
                                                {msg.message}
                                            </p>
                                            <div style={{ fontSize: 10, color: msg.sender === 'bot' ? 'var(--fog)' : 'var(--fog)', marginTop: 6, textAlign: 'right', opacity: 0.7 }}>
                                                {formatDate(msg.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={conversationEndRef} />
                        </div>

                        {/* Reply box */}
                        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--ice)', background: 'var(--mist)' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                                Reply as agent — sends to customer WhatsApp
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
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
                                        background: '#fff',
                                        border: '1.5px solid var(--ice)',
                                        borderRadius: 'var(--r-btn)',
                                        color: 'var(--ink)', fontSize: 13,
                                        fontFamily: 'var(--font-inter)',
                                        outline: 'none', resize: 'none',
                                        lineHeight: 1.5, transition: 'border-color 0.18s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--ice)'}
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={sending || !replyText.trim()}
                                    style={{
                                        padding: '10px 18px',
                                        background: sending || !replyText.trim() ? 'var(--mist)' : 'var(--ink)',
                                        border: 'none', borderRadius: 'var(--r-btn)',
                                        color: sending || !replyText.trim() ? 'var(--fog)' : '#fff',
                                        fontSize: 13, fontWeight: 700,
                                        cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                                        fontFamily: 'var(--font-inter)',
                                        transition: 'all 0.18s', whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => { if (!sending && replyText.trim()) e.currentTarget.style.opacity = '0.85'; }}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                    {sending ? '...' : '↑ Send'}
                                </button>
                            </div>
                        </div>
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