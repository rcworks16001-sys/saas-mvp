'use client';

import { useState, useEffect } from 'react';
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

export default function LeadDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [lead, setLead] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        fetchLead();
    }, []);

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

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: S.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-family)'
            }}>
                <div style={{
                    width: '24px', height: '24px',
                    border: `2px solid ${S.border}`,
                    borderTopColor: S.accent, borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!lead) return null;

    const requirements = lead.requirements || {};

    return (
        <div style={{
            minHeight: '100vh', background: S.bg,
            fontFamily: 'var(--font-family)', color: S.textPrimary
        }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px', height: '58px',
                background: S.surface,
                borderBottom: `1px solid ${S.border}`,
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: S.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 14px rgba(79,140,255,0.35)`
                    }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>W</span>
                    </div>
                    <span style={{ color: S.textPrimary, fontWeight: 600, fontSize: '14px' }}>
                        WhatsApp CRM
                    </span>
                </div>

                <Link href="/dashboard" style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px',
                    background: 'transparent',
                    border: `1px solid ${S.border}`,
                    borderRadius: '8px',
                    color: S.textSecondary, fontSize: '13px',
                    fontWeight: 500, textDecoration: 'none',
                    transition: 'all 180ms ease'
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = S.accent;
                        e.currentTarget.style.color = S.accent;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = S.border;
                        e.currentTarget.style.color = S.textSecondary;
                    }}
                >
                    ← Back to Dashboard
                </Link>
            </nav>

            {/* Content */}
            <div style={{ padding: '28px 32px', maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <h1 style={{
                                fontSize: '22px', fontWeight: 700,
                                color: S.textPrimary, letterSpacing: '-0.02em'
                            }}>
                                {lead.name || 'Unknown Lead'}
                            </h1>
                            <span style={{
                                padding: '3px 10px', borderRadius: '999px',
                                fontSize: '11px', fontWeight: 600,
                                color: STATUS_CONFIG[lead.status]?.color,
                                background: STATUS_CONFIG[lead.status]?.bg
                            }}>
                                {STATUS_CONFIG[lead.status]?.label}
                            </span>
                        </div>
                        <p style={{ color: S.textMuted, fontSize: '13px' }}>
                            Captured {formatDate(lead.created_at)} · via {lead.source}
                        </p>
                    </div>

                    {/* Status updater */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                            <button
                                key={value}
                                onClick={() => updateStatus(value)}
                                disabled={lead.status === value || updating}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    border: `1px solid ${lead.status === value ? config.color : S.border}`,
                                    background: lead.status === value ? config.bg : 'transparent',
                                    color: lead.status === value ? config.color : S.textMuted,
                                    fontSize: '12px', fontWeight: 600,
                                    cursor: lead.status === value ? 'default' : 'pointer',
                                    fontFamily: 'var(--font-family)',
                                    transition: 'all 180ms ease',
                                    opacity: updating ? 0.5 : 1
                                }}
                                onMouseEnter={e => {
                                    if (lead.status !== value) {
                                        e.currentTarget.style.borderColor = config.color;
                                        e.currentTarget.style.color = config.color;
                                        e.currentTarget.style.background = config.bg;
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (lead.status !== value) {
                                        e.currentTarget.style.borderColor = S.border;
                                        e.currentTarget.style.color = S.textMuted;
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>

                    {/* Left: Lead info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Contact details */}
                        <div style={{
                            background: S.surface, border: `1px solid ${S.border}`,
                            borderRadius: '14px', padding: '20px'
                        }}>
                            <h3 style={{
                                fontSize: '12px', fontWeight: 700,
                                color: S.textMuted, letterSpacing: '0.08em',
                                textTransform: 'uppercase', marginBottom: '16px'
                            }}>
                                Contact Details
                            </h3>

                            {[
                                { label: 'Phone', value: lead.phone, icon: '📱' },
                                { label: 'WhatsApp', value: lead.whatsapp_number, icon: '💬' },
                                { label: 'Source', value: lead.source, icon: '📌' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 0',
                                    borderBottom: i < 2 ? `1px solid ${S.border}` : 'none'
                                }}>
                                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '11px', color: S.textMuted, marginBottom: '2px' }}>
                                            {item.label}
                                        </div>
                                        <div style={{
                                            fontSize: '13px', color: S.textPrimary,
                                            fontWeight: 500, fontFamily: 'monospace'
                                        }}>
                                            {item.value || '—'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Requirements */}
                        {Object.keys(requirements).length > 0 && (
                            <div style={{
                                background: S.surface, border: `1px solid ${S.border}`,
                                borderRadius: '14px', padding: '20px'
                            }}>
                                <h3 style={{
                                    fontSize: '12px', fontWeight: 700,
                                    color: S.textMuted, letterSpacing: '0.08em',
                                    textTransform: 'uppercase', marginBottom: '16px'
                                }}>
                                    Requirements
                                </h3>
                                {Object.entries(requirements).map(([key, value], i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', padding: '8px 0',
                                        borderBottom: i < Object.keys(requirements).length - 1
                                            ? `1px solid ${S.border}` : 'none'
                                    }}>
                                        <span style={{
                                            fontSize: '12px', color: S.textMuted,
                                            textTransform: 'capitalize'
                                        }}>
                                            {key}
                                        </span>
                                        <span style={{
                                            fontSize: '13px', color: S.textPrimary,
                                            fontWeight: 600
                                        }}>
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* First message */}
                        {lead.message && (
                            <div style={{
                                background: S.surface, border: `1px solid ${S.border}`,
                                borderRadius: '14px', padding: '20px'
                            }}>
                                <h3 style={{
                                    fontSize: '12px', fontWeight: 700,
                                    color: S.textMuted, letterSpacing: '0.08em',
                                    textTransform: 'uppercase', marginBottom: '12px'
                                }}>
                                    First Message
                                </h3>
                                <p style={{
                                    fontSize: '13px', color: S.textSecondary,
                                    lineHeight: 1.7,
                                    padding: '12px',
                                    background: S.surface2,
                                    borderRadius: '10px',
                                    border: `1px solid ${S.border}`
                                }}>
                                    "{lead.message}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Conversation */}
                    <div style={{
                        background: S.surface, border: `1px solid ${S.border}`,
                        borderRadius: '14px', padding: '20px',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <h3 style={{
                            fontSize: '12px', fontWeight: 700,
                            color: S.textMuted, letterSpacing: '0.08em',
                            textTransform: 'uppercase', marginBottom: '16px'
                        }}>
                            Conversation History
                        </h3>

                        {conversations.length === 0 ? (
                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                padding: '40px 20px', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                                <p style={{ color: S.textSecondary, fontSize: '14px', fontWeight: 500 }}>
                                    No messages yet
                                </p>
                                <p style={{ color: S.textMuted, fontSize: '12px', marginTop: '4px' }}>
                                    Conversation will appear here once the chatbot is connected
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex', flexDirection: 'column', gap: '10px',
                                maxHeight: '500px', overflowY: 'auto',
                                paddingRight: '4px'
                            }}>
                                {conversations.map((msg, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'customer' ? 'flex-start' : 'flex-end'
                                    }}>
                                        <div style={{
                                            maxWidth: '75%',
                                            padding: '10px 14px',
                                            borderRadius: msg.sender === 'customer'
                                                ? '4px 14px 14px 14px'
                                                : '14px 4px 14px 14px',
                                            background: msg.sender === 'customer'
                                                ? S.surface2
                                                : `rgba(79,140,255,0.15)`,
                                            border: `1px solid ${msg.sender === 'customer' ? S.border : 'rgba(79,140,255,0.25)'}`,
                                        }}>
                                            <div style={{
                                                fontSize: '10px', fontWeight: 600,
                                                color: msg.sender === 'customer' ? S.textMuted : S.accent,
                                                marginBottom: '4px', textTransform: 'capitalize'
                                            }}>
                                                {msg.sender}
                                            </div>
                                            <p style={{
                                                fontSize: '13px', color: S.textSecondary,
                                                lineHeight: 1.6, margin: 0
                                            }}>
                                                {msg.message}
                                            </p>
                                            <div style={{
                                                fontSize: '10px', color: S.textMuted,
                                                marginTop: '6px', textAlign: 'right'
                                            }}>
                                                {formatDate(msg.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}