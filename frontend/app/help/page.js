'use client';

import { useState } from 'react';
import Link from 'next/link';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

const Navbar = () => (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '64px', background: 'rgba(22,26,34,0.9)', borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Ourivo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                <span style={{ color: S.textPrimary }}>Our</span><span style={{ color: S.accent }}>ivo</span>
            </span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/login" style={{ padding: '7px 18px', background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '8px', color: S.textSecondary, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ padding: '7px 18px', background: S.accent, border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Start Free Trial</Link>
        </div>
    </nav>
);

const Footer = () => (
    <div style={{ borderTop: `1px solid ${S.border}`, padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: S.textMuted }}>© 2026 Ourivo. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
            {[['About', '/about'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontSize: '13px', color: S.textMuted, textDecoration: 'none' }}>{label}</Link>
            ))}
        </div>
    </div>
);

const FAQS = [
    {
        category: 'Getting Started',
        items: [
            {
                q: 'How do I get started with Ourivo?',
                a: 'Sign up for a free 14-day trial at ourivo.com/register. No credit card required. Once you create your account, go to Settings → Chatbot to set up your greeting message and qualifying questions.'
            },
            {
                q: 'Do I need any technical knowledge to use Ourivo?',
                a: 'No. Ourivo is designed to be set up in under 5 minutes without any technical knowledge. If you can use WhatsApp, you can use Ourivo.'
            },
            {
                q: 'How long is the free trial?',
                a: '14 days. You get full access to all features during the trial. No credit card is required to start.'
            },
        ]
    },
    {
        category: 'Chatbot & Leads',
        items: [
            {
                q: 'How does the AI chatbot work?',
                a: 'When a customer messages your WhatsApp number, our AI chatbot automatically responds, greets them, and asks qualifying questions one at a time. All answers are saved to your lead dashboard automatically.'
            },
            {
                q: 'Can I customize what the chatbot says?',
                a: 'Yes. Go to Settings → Chatbot. You can set a custom greeting message, add your own qualifying questions, set the tone (professional, friendly, formal), and add custom AI rules.'
            },
            {
                q: 'Will the chatbot answer questions about my business?',
                a: 'Yes. Fill in your business description, service locations, and working hours in Settings → Account. The chatbot uses this information to answer customer questions accurately.'
            },
            {
                q: 'What happens when a new lead comes in?',
                a: 'You get notified immediately — via WhatsApp message and email. The lead appears in your dashboard with their contact details, conversation history, and an automatic lead score (Hot, Warm, or Cold).'
            },
        ]
    },
    {
        category: 'Follow-ups',
        items: [
            {
                q: 'How does follow-up automation work?',
                a: 'Go to Dashboard → Follow-ups. You can set automatic follow-up messages that get sent on Day 1, Day 3, and Day 7 after a lead is captured. You can customize the timing and message for each.'
            },
            {
                q: 'Can I reply to leads directly from the dashboard?',
                a: 'Yes. Click on any lead in your dashboard and use the reply box at the bottom of the conversation. Your message gets sent directly to the customer\'s WhatsApp.'
            },
        ]
    },
    {
        category: 'Billing & Account',
        items: [
            {
                q: 'How much does Ourivo cost?',
                a: '₹1,999 per month after the 14-day free trial. No setup fees, no hidden charges.'
            },
            {
                q: 'Do you offer refunds?',
                a: 'We do not offer refunds. The 14-day free trial is designed to give you full access to evaluate the product before committing to a paid plan.'
            },
            {
                q: 'How do I cancel my account?',
                a: 'Go to Settings → Subscription → Delete Account. This will immediately cancel your subscription and permanently delete all your data. This action cannot be undone.'
            },
            {
                q: 'Is my data safe?',
                a: 'Yes. All data is encrypted in transit. We never sell your data or your customers\' data to anyone. See our Privacy Policy for full details.'
            },
        ]
    },
];

export default function HelpPage() {
    const [openItem, setOpenItem] = useState(null);

    return (
        <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'var(--font-family)', color: S.textPrimary }}>
            <Navbar />

            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 48px' }}>

                {/* Label */}
                <div style={{ marginBottom: '32px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: `2px solid ${S.accent}`, paddingBottom: '4px' }}>
                        Help Center
                    </span>
                </div>

                <h1 style={{ fontSize: '48px', fontWeight: 800, color: S.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
                    How can we help?
                </h1>
                <p style={{ fontSize: '16px', color: S.textSecondary, lineHeight: 1.9, marginBottom: '72px' }}>
                    Find answers to common questions below. If you can't find what you're looking for, we're just a message away.
                </p>

                <div style={{ height: '1px', background: S.border, marginBottom: '72px' }} />

                {/* FAQs */}
                {FAQS.map((section, si) => (
                    <div key={si} style={{ marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px' }}>
                            {section.category}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {section.items.map((item, ii) => {
                                const key = `${si}-${ii}`;
                                const isOpen = openItem === key;
                                return (
                                    <div key={ii} style={{ borderBottom: `1px solid ${S.border}` }}>
                                        <button onClick={() => setOpenItem(isOpen ? null : key)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)', textAlign: 'left', gap: '16px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 600, color: isOpen ? S.accent : S.textPrimary, transition: 'color 180ms ease', lineHeight: 1.5 }}>
                                                {item.q}
                                            </span>
                                            <span style={{ fontSize: '20px', color: S.textMuted, flexShrink: 0, transition: 'transform 180ms ease', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>+</span>
                                        </button>
                                        {isOpen && (
                                            <div style={{ paddingBottom: '20px', fontSize: '15px', color: S.textSecondary, lineHeight: 1.9 }}>
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div style={{ height: '1px', background: S.border, marginBottom: '72px' }} />

                {/* Still need help */}
                <div>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px' }}>
                        Still need help?
                    </h2>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link href="/contact" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: '16px', textDecoration: 'none', transition: 'all 180ms ease' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = S.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(79,140,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>✉️</div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: S.textPrimary, marginBottom: '4px' }}>Contact Us</div>
                                <div style={{ fontSize: '13px', color: S.textMuted }}>Send us a message</div>
                            </div>
                        </Link>

                        <a href="https://wa.me/917294034023" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: '16px', textDecoration: 'none', transition: 'all 180ms ease' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#25d366'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>💬</div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: S.textPrimary, marginBottom: '4px' }}>WhatsApp</div>
                                <div style={{ fontSize: '13px', color: S.textMuted }}>Chat with us directly</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
} 