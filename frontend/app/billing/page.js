'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../lib/api';

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
            const orderResponse = await api.post('/billing/order');
            const { orderId, amount, currency, keyId } = orderResponse.data;

            const options = {
                key: keyId,
                amount,
                currency,
                name: 'Ourivo',
                description: 'Pro Plan — Monthly Subscription',
                order_id: orderId,
                handler: async (response) => {
                    try {
                        await api.post('/billing/verify', {
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
                theme: { color: '#000000' },
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
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--ice)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #e8ecf4',
                        borderTopColor: 'var(--ink)',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const isActive = billingStatus?.status === 'active';

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--ice)',
                fontFamily: 'var(--font-body)',
                color: 'var(--ink)',
            }}
        >

            {/* Navbar */}
            <nav
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    height: '58px',
                    background: 'var(--white)',
                    borderBottom: '1px solid #e8ecf4',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Image
                        src="/logo.png"
                        alt="Ourivo"
                        width={34}
                        height={34}
                        style={{ borderRadius: 8 }}
                    />
                    <span
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 22,
                            color: 'var(--ink)',
                            letterSpacing: 1.5,
                        }}
                    >
                        OURIVO
                    </span>
                </div>
                <Link
                    href="/dashboard"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: 'transparent',
                        border: '1px solid #e8ecf4',
                        borderRadius: 'var(--r-btn)',
                        color: 'var(--ash)',
                        fontSize: '13px',
                        fontWeight: 500,
                        textDecoration: 'none',
                    }}
                >
                    {'← Back to Dashboard'}
                </Link>
            </nav>

            <div style={{ padding: '48px 32px', maxWidth: '600px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1
                        style={{
                            fontSize: '28px',
                            fontWeight: 500,
                            color: 'var(--ink)',
                            marginBottom: '8px',
                            letterSpacing: '0.08em',
                            fontFamily: 'var(--font-display)',
                            textTransform: 'uppercase',
                        }}
                    >
                        Billing & Subscription
                    </h1>
                    <p style={{ color: 'var(--ash)', fontSize: '15px' }}>
                        {isActive
                            ? 'Your subscription is active.'
                            : 'Start capturing leads 24/7 with the Pro plan.'}
                    </p>
                </div>

                {/* Trial banner */}
                {billingStatus?.isTrialActive && (
                    <div
                        style={{
                            background: 'var(--white)',
                            border: '1px solid #e8ecf4',
                            borderRadius: 'var(--r-card)',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>⏳</span>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                                Free Trial Active
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--ash)', marginTop: '2px' }}>
                                {billingStatus.trialDaysRemaining} days remaining. Subscribe before your trial ends to keep access.
                            </div>
                        </div>
                    </div>
                )}

                {/* Trial expired banner */}
                {!billingStatus?.isTrialActive && !isActive && (
                    <div
                        style={{
                            background: 'var(--white)',
                            border: '1px solid #e8ecf4',
                            borderRadius: 'var(--r-card)',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                                Trial Expired
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--ash)', marginTop: '2px' }}>
                                Subscribe now to restore access to your dashboard and leads.
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan card */}
                <div
                    style={{
                        background: 'var(--white)',
                        border: isActive ? '1px solid #c4e8d5' : '1px solid #e8ecf4',
                        borderRadius: 'var(--r-card)',
                        padding: '28px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '24px',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                                Pro Plan
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--fog)', marginTop: '4px' }}>
                                Everything you need to never miss a lead
                            </div>
                        </div>
                        {isActive && (
                            <span
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#15803d',
                                    background: '#ecfdf3',
                                }}
                            >
                                Active
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 600, color: 'var(--ink)' }}>
                            ₹1,999
                        </span>
                        <span style={{ fontSize: '14px', color: 'var(--fog)', marginLeft: '6px' }}>
                            / month
                        </span>
                    </div>

                    {[
                        'WhatsApp AI chatbot — 24/7 lead capture',
                        'Lead dashboard with full conversation history',
                        'Instant WhatsApp notifications on new leads',
                        'Unlimited leads',
                        'Chatbot customization',
                    ].map((feature, i) => (
                        <div
                            key={i}
                            style={{
                                fontSize: '13px',
                                color: 'var(--ash)',
                                padding: '6px 0',
                                borderBottom: i < 4 ? '1px solid #e8ecf4' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <span style={{ fontSize: '12px' }}>✓</span>
                            <span>{feature}</span>
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
                                borderRadius: 'var(--r-btn)',
                                border: 'none',
                                background: paying ? 'var(--mist)' : 'var(--ink)',
                                color: 'var(--white)',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: paying ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-body)',
                            }}
                        >
                            {paying ? 'Opening payment...' : 'Subscribe Now — ₹1,999/month'}
                        </button>
                    )}

                    {isActive && (
                        <div
                            style={{
                                marginTop: '24px',
                                padding: '12px',
                                background: '#ecfdf3',
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontSize: '13px',
                                color: '#15803d',
                                fontWeight: 500,
                            }}
                        >
                            ✓ Subscription active — all features unlocked
                        </div>
                    )}
                </div>

                <p
                    style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        color: 'var(--fog)',
                        lineHeight: 1.6,
                    }}
                >
                    Payments are processed securely via Razorpay.
                    Cancel anytime by contacting support.
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}