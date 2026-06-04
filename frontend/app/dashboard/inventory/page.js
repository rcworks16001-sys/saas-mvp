'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const STATUS_CONFIG = {
    available: { label: 'Available', bg: 'var(--green)', color: 'var(--ink)' },
    sold: { label: 'Sold', bg: 'var(--ink)', color: '#fff' },
    rented: { label: 'Rented', bg: 'var(--mist)', color: 'var(--ash)' },
};

function SkeletonRow() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 1fr 1fr 0.8fr', padding: '16px 20px', borderBottom: '1px solid var(--ice)', alignItems: 'center', gap: 8 }}>
            {[['60%', 12], ['50%', 10], ['50%', 10], ['40%', 10], ['40%', 10], ['50%', 22], ['30%', 28]].map(([w, h], i) => (
                <div key={i} style={{ height: h, width: w, background: 'var(--ice)', borderRadius: 4, animation: 'shimmer 1.6s ease-in-out infinite' }} />
            ))}
        </div>
    );
}

export default function InventoryPage() {
    const router = useRouter();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [userName, setUserName] = useState('');
    const [billingStatus, setBillingStatus] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [lightbox, setLightbox] = useState(null); // { images: [], index: 0 }


    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        setUserName(Cookies.get('userName') || 'there');
        fetchProperties();
        fetchBillingStatus();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await api.get('/inventory');
            setProperties(response.data.properties);
        } catch (error) {
            toast.error('Failed to load inventory');
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

    const deleteProperty = async (id) => {
        setDeleting(id);
        try {
            await api.delete(`/inventory/${id}`);
            setProperties(prev => prev.filter(p => p.id !== id));
            toast.success('Property deleted');
        } catch {
            toast.error('Failed to delete property');
        } finally {
            setDeleting(null);
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('organizationId');
        Cookies.remove('userName');
        router.push('/login');
    };

    const filtered = properties.filter(p => {
        const matchesFilter = filter === 'all' || p.status === filter;
        const matchesSearch = search === '' ||
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.location?.toLowerCase().includes(search.toLowerCase()) ||
            String(p.bedrooms ?? '').toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const isActive = billingStatus?.status === 'active';
    const trialDaysLeft = billingStatus?.trialDaysRemaining;
    const showTrialBanner = billingStatus?.isTrialActive && trialDaysLeft <= 7;
    const showExpiredBanner = !billingStatus?.isTrialActive && !isActive && billingStatus !== null;

    const stats = [
        { label: 'Total listings', value: properties.length, icon: '🏢' },
        { label: 'Available', value: properties.filter(p => p.status === 'available').length, icon: '✅' },
        { label: 'Sold', value: properties.filter(p => p.status === 'sold').length, icon: '🏷' },
        { label: 'Rented', value: properties.filter(p => p.status === 'rented').length, icon: '🔑' },
    ];

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
        { label: 'Inventory', href: '/dashboard/inventory', icon: '🏢', active: true },
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
                    <Link href="/billing" style={{
                        padding: '6px 14px', borderRadius: 'var(--r-btn)',
                        background: isActive ? '#f0fdf4' : billingStatus?.isTrialActive ? '#fffbeb' : '#fef2f2',
                        border: `1px solid ${isActive ? '#bbf7d0' : billingStatus?.isTrialActive ? '#fde68a' : '#fecaca'}`,
                        color: isActive ? '#15803d' : billingStatus?.isTrialActive ? '#92400e' : '#b91c1c',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    }}>
                        {isActive ? '✓ Pro' : billingStatus?.isTrialActive ? `⏳ ${trialDaysLeft}d left` : '⚠️ Expired'}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 'var(--r-nav)', border: '1px solid var(--ice)', background: 'var(--mist)', cursor: 'pointer' }}
                        onClick={handleLogout} title="Sign out">
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ash)' }}>{userName.split(' ')[0]}</span>
                    </div>
                </div>
            </nav>

            {/* ── Banners ── */}
            {showTrialBanner && (
                <div style={{ background: 'var(--yellow)', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>⏳ Trial ends in <strong>{trialDaysLeft} days</strong>. Subscribe to keep access.</span>
                    <Link href="/billing" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none', padding: '4px 14px', border: '1.5px solid var(--ink)', borderRadius: 'var(--r-btn)' }}>Subscribe →</Link>
                </div>
            )}
            {showExpiredBanner && (
                <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#b91c1c', fontWeight: 500 }}>⚠️ Trial expired. Subscribe to restore full access.</span>
                    <Link href="/billing" style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', textDecoration: 'none', padding: '4px 14px', border: '1.5px solid #fecaca', borderRadius: 'var(--r-btn)' }}>Subscribe →</Link>
                </div>
            )}

            {/* ── Body ── */}
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
                        }}
                            onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = 'var(--mist)'; e.currentTarget.style.color = 'var(--ink)'; } }}
                            onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ash)'; } }}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
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

                {/* Main */}
                <main style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>

                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                            Property Listings
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.92, marginBottom: 6 }}>
                            INVENTORY.
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--ash)' }}>
                            Add listings by WhatsApp — e.g. "Add: 3BHK Velachery 45L semi-furnished"
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                        {stats.map((stat, i) => (
                            <div key={i} style={{
                                background: i === 1 ? 'var(--ink)' : '#fff',
                                border: `1px solid ${i === 1 ? 'transparent' : '#e8ecf4'}`,
                                borderRadius: 'var(--r-card)', padding: '20px 22px',
                                transition: 'all 0.22s',
                            }}
                                onMouseEnter={e => { if (i !== 1) { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                                onMouseLeave={e => { if (i !== 1) { e.currentTarget.style.borderColor = '#e8ecf4'; e.currentTarget.style.transform = 'none'; } }}
                            >
                                <div style={{ fontSize: 20, marginBottom: 14 }}>{stat.icon}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: i === 1 ? '#fff' : 'var(--ink)', letterSpacing: -2, lineHeight: 0.9, marginBottom: 6 }}>
                                    {loading ? '—' : stat.value}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fog)', letterSpacing: '0.03em' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 3, background: '#fff', border: '1px solid #e8ecf4', borderRadius: 12, padding: 4 }}>
                            {['all', 'available', 'sold', 'rented'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{
                                    padding: '6px 13px', borderRadius: 9, border: 'none',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    fontFamily: 'var(--font-inter)',
                                    background: filter === f ? 'var(--ink)' : 'transparent',
                                    color: filter === f ? '#fff' : 'var(--ash)',
                                    transition: 'all 0.15s', textTransform: 'capitalize',
                                }}>
                                    {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title, location, BHK..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                padding: '9px 14px', background: '#fff',
                                border: '1px solid #e8ecf4', borderRadius: 'var(--r-btn)',
                                color: 'var(--ink)', fontSize: 13,
                                fontFamily: 'var(--font-inter)', outline: 'none',
                                width: 260, transition: 'all 0.18s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                            onBlur={e => e.target.style.borderColor = '#e8ecf4'}
                        />
                    </div>

                    {/* Table */}
                    <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 0.8fr', padding: '12px 20px', background: 'var(--mist)', borderBottom: '1px solid var(--ice)' }}>
                            {['Property', 'Location', 'Price', 'Type', 'Area', 'Status', 'Update', ''].map(h => (
                                <div key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{h}</div>
                            ))}
                        </div>

                        {loading && [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}

                        {!loading && filtered.length === 0 && (
                            <div style={{ padding: '64px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 14 }}>🏢</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: 0.5, marginBottom: 8 }}>NO LISTINGS YET</div>
                                <p style={{ fontSize: 13, color: 'var(--fog)' }}>
                                    Send a WhatsApp message to your bot number to add a property
                                </p>
                                <div style={{ marginTop: 16, display: 'inline-block', background: 'var(--mist)', borderRadius: 10, padding: '10px 18px', fontSize: 12, color: 'var(--ash)', fontFamily: 'monospace' }}>
                                    Add: 3BHK Velachery 45L semi-furnished 1200sqft
                                </div>
                            </div>
                        )}

                        {!loading && filtered.map((property, i) => (
                            <div key={property.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 0.8fr',
                                padding: '15px 20px',
                                borderBottom: i < filtered.length - 1 ? '1px solid var(--ice)' : 'none',
                                alignItems: 'center',
                                transition: 'background 0.12s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--mist)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {property.images?.length > 0 ? (
                                            <img
                                                src={property.images[0]}
                                                alt={property.title}
                                                onClick={() => setLightbox({ images: property.images, index: 0 })}
                                                style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--ice)', cursor: 'pointer' }}
                                            />
                                        ) : (
                                            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                                🏢
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{property.title || '—'}</div>
                                            {property.furnishing && <div style={{ fontSize: 11, color: 'var(--fog)', marginTop: 2, textTransform: 'capitalize' }}>{property.furnishing}</div>}
                                            {property.images?.length > 1 && (
                                                <div style={{ fontSize: 10, color: 'var(--fog)', marginTop: 2 }}>+{property.images.length - 1} more photos</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--ash)' }}>{property.location || '—'}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{property.price ? (property.price >= 100 ? `₹${(property.price / 100).toFixed(2)} Cr` : `₹${property.price} L`) : '—'}</div>
                                <div style={{ fontSize: 12, color: 'var(--ash)' }}>{property.bedrooms ? `${property.bedrooms} BHK` : '—'}</div>
                                <div style={{ fontSize: 12, color: 'var(--ash)' }}>{property.area_sqft ? `${property.area_sqft} sqft` : '—'}</div>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '4px 11px', borderRadius: 20,
                                    fontSize: 11, fontWeight: 700,
                                    background: STATUS_CONFIG[property.status]?.bg,
                                    color: STATUS_CONFIG[property.status]?.color,
                                }}>
                                    {STATUS_CONFIG[property.status]?.label || property.status}
                                </span>

                                <select
                                    value={property.status}
                                    onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        setProperties(prev => prev.map(p => p.id === property.id ? { ...p, status: newStatus } : p));
                                        try {
                                            await api.patch(`/inventory/${property.id}`, { status: newStatus });
                                            toast.success('Status updated');
                                        } catch {
                                            toast.error('Failed to update');
                                            fetchProperties();
                                        }
                                    }}
                                    style={{
                                        padding: '6px 9px', background: 'var(--mist)',
                                        border: '1px solid var(--ice)', borderRadius: 'var(--r-btn)',
                                        color: 'var(--ash)', fontSize: 12,
                                        fontFamily: 'var(--font-inter)',
                                        cursor: 'pointer', outline: 'none',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--ice)'}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                        <option key={value} value={value}>{config.label}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => deleteProperty(property.id)}
                                    disabled={deleting === property.id}
                                    style={{
                                        padding: '6px 12px', borderRadius: 'var(--r-btn)',
                                        border: '1px solid #fecaca', background: 'transparent',
                                        color: '#ef4444', fontSize: 11, fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.15s',
                                        opacity: deleting === property.id ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {deleting === property.id ? '...' : 'Delete'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {!loading && (
                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fog)', textAlign: 'right' }}>
                            {filtered.length} of {properties.length} listings
                        </div>
                    )}

                    {/* Footer */}
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

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <img
                            src={lightbox.images[lightbox.index]}
                            alt="Property"
                            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain', display: 'block' }}
                        />

                        {/* Close */}
                        <button onClick={() => setLightbox(null)} style={{
                            position: 'absolute', top: -16, right: -16,
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--ink)', border: 'none',
                            color: '#fff', fontSize: 16, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>×</button>

                        {/* Prev */}
                        {lightbox.images.length > 1 && lightbox.index > 0 && (
                            <button onClick={() => setLightbox(prev => ({ ...prev, index: prev.index - 1 }))} style={{
                                position: 'absolute', left: -48, top: '50%', transform: 'translateY(-50%)',
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--ink)', border: 'none',
                                color: '#fff', fontSize: 18, cursor: 'pointer',
                            }}>‹</button>
                        )}

                        {/* Next */}
                        {lightbox.images.length > 1 && lightbox.index < lightbox.images.length - 1 && (
                            <button onClick={() => setLightbox(prev => ({ ...prev, index: prev.index + 1 }))} style={{
                                position: 'absolute', right: -48, top: '50%', transform: 'translateY(-50%)',
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--ink)', border: 'none',
                                color: '#fff', fontSize: 18, cursor: 'pointer',
                            }}>›</button>
                        )}

                        {/* Counter */}
                        {lightbox.images.length > 1 && (
                            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--fog)' }}>
                                {lightbox.index + 1} / {lightbox.images.length}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                input::placeholder { color: var(--fog); }
            `}</style>
        </div>
    );
}