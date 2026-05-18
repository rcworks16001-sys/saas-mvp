'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

export default function BillingPage() {
    const router = useRouter();
    const [billingStatus, setBillingStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        fetchBillingStatus();
        loadRazorpay();
    }, []);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const fetchBillingStatus = async () => {
        try {
            const response = await api.get('/billing/status');
            setBillingStatus(response.data);
        } catch (error) {
            toast.error('Failed to load billing info');
            if (error.response?.status === 401) router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setPaying(true);
        try {
            await loadRazorpay();

            // Create order
            const orderResponse = await api.post('/billing/create-order');
            const { orderId, amount, currency, keyId } = orderResponse.data;

            const options = {
                key: keyId,
                amount,
                currency,
                name: 'WhatsApp CRM',
                description: 'Pro Plan — Monthly Subscription',
                order_id: orderId,
                handler: async (response) => {
                    try {
                        await api.post('/billing/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.success('Payment successful! Welcome to Pro.');
                        fetchBillingStatus();
                    } catch (error) {
                        toast.error('Payment verification failed. Contact support.');
                    }
                },
                prefill: {},
                theme: { color: '#4F8CFF' },
                modal: {
                    ondismiss: () => setPaying(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            toast.error('Failed to initiate payment');
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: S.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
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

    const isActive = billingStatus?.status === 'active';

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
                    fontWeight: 500, textDecoration: 'none'
                }}>
                    ← Back to Dashboard
                </Link>
            </nav>

            <div style={{ padding: '48px 32px', maxWidth: '600px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '28px', fontWeight: 700,
                        color: S.textPrimary, marginBottom: '8px',
                        letterSpacing: '-0.02em'
                    }}>
                        Billing & Subscription
                    </h1>
                    <p style={{ color: S.textSecondary, fontSize: '15px' }}>
                        {isActive
                            ? 'Your subscription is active.'
                            : 'Start capturing leads 24/7 with the Pro plan.'}
                    </p>
                </div>

                {/* Trial banner */}
                {billingStatus?.isTrialActive && (
                    <div style={{
                        background: 'rgba(79,140,255,0.08)',
                        border: `1px solid rgba(79,140,255,0.25)`,
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '24px',
                        display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <span style={{ fontSize: '20px' }}>⏳</span>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: S.accent }}>
                                Free Trial Active
                            </div>
                            <div style={{ fontSize: '13px', color: S.textSecondary, marginTop: '2px' }}>
                                {billingStatus.trialDaysRemaining} days remaining. Subscribe before your trial ends to keep access.
                            </div>
                        </div>
                    </div>
                )}

                {/* Trial expired banner */}
                {!billingStatus?.isTrialActive && !isActive && (
                    <div style={{
                        background: 'rgba(248,113,113,0.08)',
                        border: `1px solid rgba(248,113,113,0.25)`,
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '24px',
                        display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f87171' }}>
                                Trial Expired
                            </div>
                            <div style={{ fontSize: '13px', color: S.textSecondary, marginTop: '2px' }}>
                                Subscribe now to restore access to your dashboard and leads.
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan card */}
                <div style={{
                    background: S.surface,
                    border: `1px solid ${isActive ? 'rgba(52,211,153,0.3)' : S.border}`,
                    borderRadius: '16px',
                    padding: '28px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: '24px'
                    }}>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: S.textPrimary }}>
                                Pro Plan
                            </div>
                            <div style={{ fontSize: '13px', color: S.textMuted, marginTop: '4px' }}>
                                Everything you need to never miss a lead
                            </div>
                        </div>
                        {isActive && (
                            <span style={{
                                padding: '4px 12px', borderRadius: '999px',
                                fontSize: '12px', fontWeight: 600,
                                color: '#34d399', background: 'rgba(52,211,153,0.12)'
                            }}>
                                Active
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 700, color: S.textPrimary }}>
                            ₹1,999
                        </span>
                        <span style={{ fontSize: '14px', color: S.textMuted, marginLeft: '6px' }}>
                            / month
                        </span>
                    </div>

                    {[
                        '✓ WhatsApp AI chatbot — 24/7 lead capture',
                        '✓ Lead dashboard with full conversation history',
                        '✓ Instant WhatsApp notifications on new leads',
                        '✓ Unlimited leads',
                        '✓ Chatbot customization',
                    ].map((feature, i) => (
                        <div key={i} style={{
                            fontSize: '13px', color: S.textSecondary,
                            padding: '6px 0',
                            borderBottom: i < 4 ? `1px solid ${S.border}` : 'none'
                        }}>
                            {feature}
                        </div>
                    ))}

                    {!isActive && (
                        <button
                            onClick={handlePayment}
                            disabled={paying}
                            style={{
                                width: '100%',
                                marginTop: '24px',
                                padding: '14px',
                                borderRadius: '10px',
                                border: 'none',
                                background: paying ? S.border : S.accent,
                                color: 'white',
                                fontSize: '15px', fontWeight: 700,
                                cursor: paying ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-family)',
                                transition: 'all 180ms ease'
                            }}
                        >
                            {paying ? 'Opening payment...' : 'Subscribe Now — ₹1,999/month'}
                        </button>
                    )}

                    {isActive && (
                        <div style={{
                            marginTop: '24px', padding: '12px',
                            background: 'rgba(52,211,153,0.08)',
                            borderRadius: '8px', textAlign: 'center',
                            fontSize: '13px', color: '#34d399', fontWeight: 500
                        }}>
                            ✓ Subscription active — all features unlocked
                        </div>
                    )}
                </div>

                <p style={{
                    textAlign: 'center', fontSize: '12px',
                    color: S.textMuted, lineHeight: 1.6
                }}>
                    Payments are processed securely via Razorpay.
                    Cancel anytime by contacting support.
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}