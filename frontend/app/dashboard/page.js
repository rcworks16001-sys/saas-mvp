'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const S = {
    bg: '#0F1115',
    surface: '#161A22',
    surface2: '#1C2130',
    accent: '#4F8CFF',
    border: '#2A3142',
    textPrimary: '#F5F7FA',
    textSecondary: '#9AA4B2',
    textMuted: '#5C6A7E',
};

const STATUS_CONFIG = {
    new: { label: 'New', color: '#4F8CFF', bg: 'rgba(79,140,255,0.12)' },
    contacted: { label: 'Contacted', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    qualified: { label: 'Qualified', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    site_visit: { label: 'Site Visit', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    converted: { label: 'Converted', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    lost: { label: 'Lost', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

export default function DashboardPage() {
    const router = useRouter();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        setUserName(Cookies.get('userName') || 'there');
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data.leads);
        } catch (error) {
            toast.error('Failed to load leads');
            if (error.response?.status === 401) router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (leadId, newStatus) => {
        try {
            await api.patch(`/leads/${leadId}/status`, { status: newStatus });
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('organizationId');
        Cookies.remove('userName');
        router.push('/login');
    };

    const filteredLeads = leads.filter(lead => {
        const matchesFilter = filter === 'all' || lead.status === filter;
        const matchesSearch = search === '' ||
            lead.name?.toLowerCase().includes(search.toLowerCase()) ||
            lead.phone?.includes(search) ||
            lead.message?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = [
        { label: 'Total Leads', value: leads.length, color: S.accent, icon: '👥' },
        { label: 'New Today', value: leads.filter(l => l.status === 'new').length, color: '#a78bfa', icon: '✨' },
        { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, color: '#34d399', icon: '⚡' },
        { label: 'Converted', value: leads.filter(l => l.status === 'converted').length, color: '#fbbf24', icon: '🏆' },
    ];

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: S.bg,
            fontFamily: 'var(--font-family)',
            color: S.textPrimary
        }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px', height: '58px',
                background: S.surface,
                borderBottom: `1px solid ${S.border}`,
                position: 'sticky', top: 0, zIndex: 100,
                backdropFilter: 'blur(12px)'
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
                    <span style={{
                        marginLeft: '8px', padding: '2px 8px',
                        background: 'rgba(79,140,255,0.1)',
                        border: `1px solid rgba(79,140,255,0.2)`,
                        borderRadius: '999px',
                        fontSize: '10px', fontWeight: 600,
                        color: S.accent, letterSpacing: '0.05em'
                    }}>BETA</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '5px 12px',
                        background: S.surface2,
                        border: `1px solid ${S.border}`,
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${S.accent}, #818cf8)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700, color: 'white'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: S.textSecondary, fontSize: '13px', fontWeight: 500 }}>
                            {userName.split(' ')[0]}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '6px 14px',
                            background: 'transparent',
                            border: `1px solid ${S.border}`,
                            borderRadius: '8px',
                            color: S.textMuted,
                            fontSize: '12px', fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'var(--font-family)',
                            transition: 'all 180ms ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)';
                            e.currentTarget.style.color = '#f87171';
                            e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = S.border;
                            e.currentTarget.style.color = S.textMuted;
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Page content */}
            <div style={{ padding: '28px 32px', maxWidth: '1240px', margin: '0 auto' }}>

                {/* Page header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{
                        fontSize: '20px', fontWeight: 700,
                        color: S.textPrimary, letterSpacing: '-0.02em',
                        marginBottom: '3px'
                    }}>
                        Lead Dashboard
                    </h1>
                    <p style={{ color: S.textMuted, fontSize: '13px' }}>
                        All leads captured by your WhatsApp chatbot
                    </p>
                </div>

                {/* Stats grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px', marginBottom: '24px'
                }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{
                            padding: '18px 20px',
                            background: S.surface,
                            border: `1px solid ${S.border}`,
                            borderRadius: '13px',
                            transition: 'all 200ms ease',
                            cursor: 'default'
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(79,140,255,0.25)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = S.border;
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', marginBottom: '10px'
                            }}>
                                <span style={{ fontSize: '18px' }}>{stat.icon}</span>
                                <span style={{
                                    fontSize: '11px', fontWeight: 600,
                                    color: S.textMuted, letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    {stat.label}
                                </span>
                            </div>
                            <div style={{
                                fontSize: '30px', fontWeight: 700,
                                color: stat.color, letterSpacing: '-0.03em'
                            }}>
                                {loading ? '—' : stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px', gap: '12px', flexWrap: 'wrap'
                }}>
                    {/* Filter pills */}
                    <div style={{
                        display: 'flex', gap: '4px',
                        background: S.surface,
                        border: `1px solid ${S.border}`,
                        borderRadius: '10px', padding: '3px'
                    }}>
                        {['all', 'new', 'contacted', 'qualified', 'site_visit', 'converted', 'lost'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: '5px 12px', borderRadius: '7px',
                                border: 'none', fontSize: '12px', fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'var(--font-family)',
                                transition: 'all 180ms ease',
                                background: filter === f ? S.accent : 'transparent',
                                color: filter === f ? 'white' : S.textMuted,
                                textTransform: 'capitalize',
                                letterSpacing: '0.01em'
                            }}>
                                {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by name, phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            padding: '8px 14px',
                            background: S.surface,
                            border: `1px solid ${S.border}`,
                            borderRadius: '9px',
                            color: S.textPrimary, fontSize: '13px',
                            fontFamily: 'var(--font-family)', outline: 'none',
                            width: '220px', transition: 'all 180ms ease'
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = S.accent;
                            e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.1)`;
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = S.border;
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Table */}
                <div style={{
                    background: S.surface,
                    border: `1px solid ${S.border}`,
                    borderRadius: '14px', overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.4fr 2fr 1.2fr 0.9fr 1.4fr',
                        padding: '11px 20px',
                        borderBottom: `1px solid ${S.border}`,
                        background: S.surface2
                    }}>
                        {['Name', 'Phone', 'Message', 'Status', 'Time', 'Update'].map((h, i) => (
                            <div key={i} style={{
                                fontSize: '10px', fontWeight: 700,
                                color: S.textMuted,
                                letterSpacing: '0.08em', textTransform: 'uppercase'
                            }}>{h}</div>
                        ))}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ padding: '56px 20px', textAlign: 'center' }}>
                            <div style={{
                                width: '22px', height: '22px',
                                border: `2px solid ${S.border}`,
                                borderTopColor: S.accent,
                                borderRadius: '50%',
                                animation: 'spin 0.7s linear infinite',
                                margin: '0 auto 12px'
                            }} />
                            <p style={{ color: S.textMuted, fontSize: '13px' }}>Loading leads...</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && filteredLeads.length === 0 && (
                        <div style={{ padding: '56px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                            <p style={{ color: S.textSecondary, fontSize: '14px', fontWeight: 500 }}>
                                No leads found
                            </p>
                            <p style={{ color: S.textMuted, fontSize: '12px', marginTop: '4px' }}>
                                {filter !== 'all' ? 'Try a different filter' : 'Leads appear here once captured'}
                            </p>
                        </div>
                    )}

                    {/* Rows */}
                    {!loading && filteredLeads.map((lead, i) => (
                        <div key={lead.id} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1.4fr 2fr 1.2fr 0.9fr 1.4fr',
                            padding: '14px 20px',
                            borderBottom: i < filteredLeads.length - 1
                                ? `1px solid ${S.border}` : 'none',
                            transition: 'background 180ms ease',
                            alignItems: 'center'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = S.surface2}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Name */}
                            <div
                                onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                                style={{
                                    fontSize: '13px', fontWeight: 600,
                                    color: S.textPrimary, marginBottom: '2px',
                                    cursor: 'pointer', transition: 'color 180ms ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = S.accent}
                                onMouseLeave={e => e.currentTarget.style.color = S.textPrimary}
                            >
                                {lead.name || 'Unknown'}
                            </div>

                            {/* Phone */}
                            <div style={{
                                fontSize: '12px', color: S.textSecondary,
                                fontFamily: 'monospace', letterSpacing: '0.02em'
                            }}>
                                {lead.phone}
                            </div>

                            {/* Message */}
                            <div style={{
                                fontSize: '12px', color: S.textMuted,
                                overflow: 'hidden', textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap', paddingRight: '12px'
                            }}>
                                {lead.message || '—'}
                            </div>

                            {/* Status */}
                            <div>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '3px 9px', borderRadius: '999px',
                                    fontSize: '11px', fontWeight: 600,
                                    color: STATUS_CONFIG[lead.status]?.color || S.textMuted,
                                    background: STATUS_CONFIG[lead.status]?.bg || 'rgba(148,163,184,0.1)',
                                    letterSpacing: '0.02em'
                                }}>
                                    {STATUS_CONFIG[lead.status]?.label || lead.status}
                                </span>
                            </div>

                            {/* Time */}
                            <div style={{ fontSize: '11px', color: S.textMuted }}>
                                {timeAgo(lead.created_at)}
                            </div>

                            {/* Dropdown */}
                            <select
                                value={lead.status}
                                onChange={e => updateStatus(lead.id, e.target.value)}
                                style={{
                                    padding: '5px 9px',
                                    background: S.surface2,
                                    border: `1px solid ${S.border}`,
                                    borderRadius: '7px',
                                    color: S.textSecondary,
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-family)',
                                    cursor: 'pointer', outline: 'none',
                                    width: '100%', transition: 'all 180ms ease'
                                }}
                                onFocus={e => e.target.style.borderColor = S.accent}
                                onBlur={e => e.target.style.borderColor = S.border}
                            >
                                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                    <option key={value} value={value}
                                        style={{ background: S.surface2, color: S.textPrimary }}>
                                        {config.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                {/* Count */}
                {!loading && (
                    <div style={{
                        marginTop: '12px', fontSize: '12px',
                        color: S.textMuted, textAlign: 'right'
                    }}>
                        {filteredLeads.length} of {leads.length} leads
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #161A22; color: #F5F7FA; }
        input::placeholder { color: #5C6A7E; }
      `}</style>
        </div>
    );
}