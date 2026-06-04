'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const SCORE_CONFIG = {
    hot: { label: '🔥 Hot', bg: 'var(--yellow)', color: 'var(--ink)' },
    warm: { label: '✳ Warm', bg: 'var(--green)', color: 'var(--ink)' },
    cold: { label: '❄️ Cold', bg: 'var(--mist)', color: 'var(--ash)' },
};

const STATUS_CONFIG = {
    new: { label: 'New', color: 'var(--ink)', bg: 'var(--yellow)' },
    contacted: { label: 'Contacted', color: 'var(--ink)', bg: 'var(--mist)' },
    qualified: { label: 'Qualified', color: 'var(--ink)', bg: 'var(--green)' },
    site_visit: { label: 'Site Visit', color: 'var(--ink)', bg: 'var(--green)' },
    converted: { label: 'Converted', color: '#fff', bg: 'var(--ink)' },
    lost: { label: 'Lost', color: 'var(--fog)', bg: 'var(--mist)' },
};

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

// Skeleton row for loading state
function SkeletonRow() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 2fr 1.2fr 0.9fr 1.4fr', padding: '16px 20px', borderBottom: '1px solid var(--ice)', alignItems: 'center', gap: 8 }}>
            {[['70%', 12], ['60%', 10], ['80%', 10], ['50%', 22], ['40%', 10], ['90%', 28]].map(([w, h], i) => (
                <div key={i} style={{ height: h, width: w, background: 'var(--ice)', borderRadius: 4, animation: 'shimmer 1.6s ease-in-out infinite' }} />
            ))}
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [billingStatus, setBillingStatus] = useState(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        setUserName(Cookies.get('userName') || 'there');
        fetchLeads();
        fetchBillingStatus();
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

    const fetchBillingStatus = async () => {
        try {
            const response = await api.get('/billing/status');
            setBillingStatus(response.data);
        } catch { }
    };

    const updateStatus = async (leadId, newStatus) => {
        // Optimistic update
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        try {
            await api.patch(`/leads/${leadId}/status`, { status: newStatus });
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
            fetchLeads(); // revert on error
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

    const hotCount = leads.filter(l => l.score_label === 'hot').length;
    const isActive = billingStatus?.status === 'active';
    const trialDaysLeft = billingStatus?.trialDaysRemaining;
    const showTrialBanner = billingStatus?.isTrialActive && trialDaysLeft <= 7;
    const showExpiredBanner = !billingStatus?.isTrialActive && !isActive && billingStatus !== null;

    const stats = [
        { label: 'Total leads', value: leads.length, icon: '👥', accent: 'var(--ink)' },
        { label: 'Hot leads', value: leads.filter(l => l.score_label === 'hot').length, icon: '🔥', accent: 'var(--ink)' },
        { label: 'Warm leads', value: leads.filter(l => l.score_label === 'warm').length, icon: '✳', accent: 'var(--ink)' },
        { label: 'Converted', value: leads.filter(l => l.status === 'converted').length, icon: '✓', accent: 'var(--ink)' },
    ];

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: '⊞', active: true, badge: hotCount > 0 ? hotCount : null, badgeRed: true },
        { label: 'Inventory', href: '/dashboard/inventory', icon: '🏢' },
        { label: 'Follow-ups', href: '/dashboard/followups', icon: '🔄' },
    ];

    const configItems = [
        { label: 'Chatbot', href: '/dashboard/settings?tab=chatbot', icon: '🤖' },
        { label: 'Notifications', href: '/dashboard/settings?tab=notifications', icon: '🔔' },
        { label: 'Billing', href: '/billing', icon: '💳' },
        { label: 'Account', href: '/dashboard/settings?tab=account', icon: '👤' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ice)', fontFamily: 'var(--font-inter)' }}>

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

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Billing status pill */}
                    <Link href="/billing" style={{
                        padding: '6px 14px', borderRadius: 'var(--r-btn)',
                        background: isActive ? '#f0fdf4' : billingStatus?.isTrialActive ? '#fffbeb' : '#fef2f2',
                        border: `1px solid ${isActive ? '#bbf7d0' : billingStatus?.isTrialActive ? '#fde68a' : '#fecaca'}`,
                        color: isActive ? '#15803d' : billingStatus?.isTrialActive ? '#92400e' : '#b91c1c',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    }}>
                        {isActive ? '✓ Pro' : billingStatus?.isTrialActive ? `⏳ ${trialDaysLeft}d left` : '⚠️ Expired'}
                    </Link>

                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 'var(--r-nav)', border: '1px solid var(--ice)', background: 'var(--mist)', cursor: 'pointer' }}
                        onClick={handleLogout}
                        title="Sign out">
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ash)' }}>{userName.split(' ')[0]}</span>
                    </div>
                </div>
            </nav>

            {/* ── Trial banners ── */}
            {showTrialBanner && (
                <div style={{ background: 'var(--yellow)', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                        ⏳ Trial ends in <strong>{trialDaysLeft} days</strong>. Subscribe to keep access.
                    </span>
                    <Link href="/billing" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none', padding: '4px 14px', border: '1.5px solid var(--ink)', borderRadius: 'var(--r-btn)' }}>
                        Subscribe →
                    </Link>
                </div>
            )}
            {showExpiredBanner && (
                <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#b91c1c', fontWeight: 500 }}>
                        ⚠️ Trial expired. Subscribe to restore full access.
                    </span>
                    <Link href="/billing" style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', textDecoration: 'none', padding: '4px 14px', border: '1.5px solid #fecaca', borderRadius: 'var(--r-btn)' }}>
                        Subscribe →
                    </Link>
                </div>
            )}

            {/* ── Body: sidebar + content ── */}
            <div style={{ display: 'flex', maxWidth: 1360, margin: '0 auto', minHeight: 'calc(100vh - 62px)' }}>

                {/* Sidebar */}
                <aside style={{
                    width: 220, flexShrink: 0,
                    background: '#fff', borderRight: '1px solid #e8ecf4',
                    padding: '20px 14px',
                    position: 'sticky', top: 62,
                    height: 'calc(100vh - 62px)',
                    display: 'flex', flexDirection: 'column',
                    overflowY: 'auto',
                }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.14em', padding: '0 12px 6px' }}>Navigate</div>
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 'var(--r-nav)',
                            textDecoration: 'none', marginBottom: 1,
                            background: item.active ? 'var(--ink)' : 'transparent',
                            color: item.active ? '#fff' : 'var(--ash)',
                            fontSize: 13, fontWeight: item.active ? 700 : 500,
                            transition: 'all 0.15s',
                            position: 'relative',
                        }}
                            onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = 'var(--mist)'; e.currentTarget.style.color = 'var(--ink)'; } }}
                            onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ash)'; } }}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge && (
                                <span style={{ marginLeft: 'auto', background: item.badgeRed ? '#ef4444' : 'var(--ink)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20 }}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}

                    <div style={{ height: 1, background: 'var(--ice)', margin: '12px 0' }} />
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.14em', padding: '0 12px 6px' }}>Configure</div>
                    {configItems.map(item => (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 'var(--r-nav)',
                            textDecoration: 'none', marginBottom: 1,
                            color: 'var(--ash)', fontSize: 13, fontWeight: 500,
                            transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--mist)'; e.currentTarget.style.color = 'var(--ink)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ash)'; }}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    <div style={{ flex: 1 }} />

                    {/* Trial box */}
                    <div style={{ background: 'var(--ink)', borderRadius: 16, padding: 16, marginTop: 12 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', letterSpacing: 0.5, marginBottom: 4 }}>
                            {isActive ? 'PRO PLAN' : 'FREE TRIAL'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fog)', marginBottom: 12, lineHeight: 1.4 }}>
                            {isActive ? 'All features active' : `${trialDaysLeft ?? '—'} days remaining`}
                        </div>
                        {!isActive && (
                            <>
                                <div style={{ height: 3, background: '#222', borderRadius: 20, marginBottom: 12, overflow: 'hidden' }}>
                                    <div style={{ height: 3, width: `${Math.max(0, 100 - ((trialDaysLeft / 14) * 100))}%`, background: 'var(--green)', borderRadius: 20 }} />
                                </div>
                                <Link href="/billing" style={{ display: 'block', textAlign: 'center', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                                    Upgrade — ₹1,999/mo
                                </Link>
                            </>
                        )}
                    </div>
                </aside>

                {/* Main content */}
                <main style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>

                    {/* Page header */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                            Good morning, {userName.split(' ')[0]}
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.92, marginBottom: 6 }}>
                            LEAD PIPELINE.
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--ash)' }}>
                            All leads captured by your WhatsApp AI bot
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                        {stats.map((stat, i) => (
                            <div key={i} style={{
                                background: i === 1 ? 'var(--ink)' : '#fff',
                                border: `1px solid ${i === 1 ? 'transparent' : '#e8ecf4'}`,
                                borderRadius: 'var(--r-card)',
                                padding: '20px 22px',
                                cursor: 'default',
                                transition: 'all 0.22s',
                            }}
                                onMouseEnter={e => { if (i !== 1) { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                onMouseLeave={e => { if (i !== 1) { e.currentTarget.style.borderColor = '#e8ecf4'; e.currentTarget.style.transform = 'none'; } }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <span style={{ fontSize: 20 }}>{stat.icon}</span>
                                    {i === 1 && <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: 'var(--yellow)', color: 'var(--ink)' }}>CALL NOW</span>}
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: i === 1 ? '#fff' : 'var(--ink)', letterSpacing: -2, lineHeight: 0.9, marginBottom: 6 }}>
                                    {loading ? '—' : stat.value}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: i === 1 ? 'var(--fog)' : 'var(--fog)', letterSpacing: '0.03em' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 3, background: '#fff', border: '1px solid #e8ecf4', borderRadius: 12, padding: 4 }}>
                            {['all', 'new', 'contacted', 'qualified', 'site_visit', 'converted', 'lost'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{
                                    padding: '6px 13px', borderRadius: 9, border: 'none',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    fontFamily: 'var(--font-inter)',
                                    background: filter === f ? 'var(--ink)' : 'transparent',
                                    color: filter === f ? '#fff' : 'var(--ash)',
                                    transition: 'all 0.15s',
                                    textTransform: 'capitalize',
                                }}>
                                    {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Search by name, phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                padding: '9px 14px', background: '#fff',
                                border: '1px solid #e8ecf4', borderRadius: 'var(--r-btn)',
                                color: 'var(--ink)', fontSize: 13,
                                fontFamily: 'var(--font-inter)', outline: 'none',
                                width: 220, transition: 'all 0.18s',
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--ink)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e8ecf4'; }}
                        />
                    </div>

                    {/* Table */}
                    <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
                        {/* Table header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 2fr 1.2fr 0.9fr 1.4fr', padding: '12px 20px', background: 'var(--mist)', borderBottom: '1px solid var(--ice)' }}>
                            {['Lead', 'Phone', 'Message', 'Status', 'Time', 'Update'].map(h => (
                                <div key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{h}</div>
                            ))}
                        </div>

                        {/* Skeleton loading */}
                        {loading && [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}

                        {/* Empty state */}
                        {!loading && filteredLeads.length === 0 && (
                            <div style={{ padding: '64px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: 0.5, marginBottom: 8 }}>NO LEADS YET</div>
                                <p style={{ fontSize: 13, color: 'var(--fog)' }}>
                                    {filter !== 'all' ? 'Try a different filter' : 'Leads appear here once your bot captures them'}
                                </p>
                            </div>
                        )}

                        {/* Lead rows */}
                        {!loading && filteredLeads.map((lead, i) => (
                            <div key={lead.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1.4fr 2fr 1.2fr 0.9fr 1.4fr',
                                padding: '15px 20px',
                                borderBottom: i < filteredLeads.length - 1 ? '1px solid var(--ice)' : 'none',
                                alignItems: 'center',
                                transition: 'background 0.12s', cursor: 'default',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--mist)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Name */}
                                <div>
                                    <div
                                        onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                                        style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', display: 'inline-block', borderBottom: '1px solid transparent', transition: 'border-color 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                    >
                                        {lead.name || 'Unknown'}
                                    </div>
                                    {lead.score_label && (
                                        <span style={{ display: 'inline-flex', marginLeft: 8, alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: SCORE_CONFIG[lead.score_label]?.bg, color: SCORE_CONFIG[lead.score_label]?.color }}>
                                            {SCORE_CONFIG[lead.score_label]?.label}
                                        </span>
                                    )}
                                </div>

                                {/* Phone */}
                                <div style={{ fontSize: 12, color: 'var(--ash)', fontFamily: 'monospace' }}>{lead.phone}</div>

                                {/* Message */}
                                <div style={{ fontSize: 12, color: 'var(--fog)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                                    {lead.message || '—'}
                                </div>

                                {/* Status */}
                                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: STATUS_CONFIG[lead.status]?.bg, color: STATUS_CONFIG[lead.status]?.color }}>
                                    {STATUS_CONFIG[lead.status]?.label || lead.status}
                                </span>

                                {/* Time */}
                                <div style={{ fontSize: 11, color: 'var(--fog)', fontWeight: 500 }}>{timeAgo(lead.created_at)}</div>

                                {/* Update status */}
                                <select
                                    value={lead.status}
                                    onChange={e => updateStatus(lead.id, e.target.value)}
                                    style={{
                                        padding: '6px 9px', background: 'var(--mist)',
                                        border: '1px solid var(--ice)', borderRadius: 'var(--r-btn)',
                                        color: 'var(--ash)', fontSize: 12,
                                        fontFamily: 'var(--font-inter)',
                                        cursor: 'pointer', outline: 'none', width: '100%',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--ice)'}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                        <option key={value} value={value}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Count */}
                    {!loading && (
                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fog)', textAlign: 'right' }}>
                            {filteredLeads.length} of {leads.length} leads
                        </div>
                    )}

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
                </main>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                input::placeholder { color: var(--fog); }
                select option { background: #fff; color: var(--ink); }
            `}</style>
        </div>
    );
}