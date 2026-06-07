'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => (
    <nav
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 48px',
            height: '64px',
            background: 'var(--white)',
            borderBottom: '1px solid #e8ecf4',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}
    >
        <Link
            href="/"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
            }}
        >
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
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
                href="/sign-in"
                style={{
                    padding: '7px 18px',
                    background: 'transparent',
                    border: '1px solid #e8ecf4',
                    borderRadius: 'var(--r-btn)',
                    color: 'var(--ash)',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                }}
            >
                Sign in
            </Link>
            <Link
                href="/sign-up"
                style={{
                    padding: '9px 20px',
                    background: 'var(--ink)',
                    borderRadius: 'var(--r-btn)',
                    color: 'var(--white)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    border: '1px solid var(--ink)',
                }}
            >
                Start Free Trial
            </Link>
        </div>
    </nav>
);

const Footer = () => (
    <div
        style={{
            borderTop: '1px solid #e8ecf4',
            padding: '24px 48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--white)',
        }}
    >
        <span style={{ fontSize: '13px', color: 'var(--fog)' }}>
            © 2026 Ourivo. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '20px' }}>
            {[
                ['About', '/about'],
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
                ['Contact', '/contact'],
            ].map(([label, href]) => (
                <Link
                    key={href}
                    href={href}
                    style={{
                        fontSize: '13px',
                        color: 'var(--ash)',
                        textDecoration: 'none',
                    }}
                >
                    {label}
                </Link>
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
                a: 'Sign up for a free 14-day trial at ourivo.com/sign-up. No credit card required. Once you create your account, go to Settings → Chatbot to set up your greeting message and qualifying questions.'
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
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--ice)',
                fontFamily: 'var(--font-body)',
                color: 'var(--ink)',
            }}
        >
            <Navbar />

            <div
                style={{
                    maxWidth: '720px',
                    margin: '0 auto',
                    padding: '80px 48px',
                }}
            >

                {/* Label */}
                <div style={{ marginBottom: '32px' }}>
                    <span
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--ash)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            borderBottom: '2px solid var(--ash)',
                            paddingBottom: '4px',
                        }}
                    >
                        Help Center
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: '48px',
                        fontWeight: 500,
                        color: 'var(--ink)',
                        letterSpacing: '0.06em',
                        lineHeight: 1.05,
                        marginBottom: '16px',
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase',
                    }}
                >
                    How can we help?
                </h1>
                <p
                    style={{
                        fontSize: '16px',
                        color: 'var(--ash)',
                        lineHeight: 1.8,
                        marginBottom: '72px',
                    }}
                >
                    Find answers to common questions below. If you can't find what you're looking for, we're just a message away.
                </p>

                <div
                    style={{
                        height: '1px',
                        background: '#e8ecf4',
                        marginBottom: '72px',
                    }}
                />

                {/* FAQs */}
                {FAQS.map((section, si) => (
                    <div key={si} style={{ marginBottom: '64px' }}>
                        <h2
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--ash)',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                marginBottom: '24px',
                                fontFamily: 'var(--font-display)',
                            }}
                        >
                            {section.category}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {section.items.map((item, ii) => {
                                const key = `${si}-${ii}`;
                                const isOpen = openItem === key;
                                return (
                                    <div
                                        key={ii}
                                        style={{
                                            borderBottom: '1px solid #e8ecf4',
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenItem(isOpen ? null : key)
                                            }
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '20px 0',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontFamily: 'var(--font-body)',
                                                textAlign: 'left',
                                                gap: '16px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '15px',
                                                    fontWeight: 600,
                                                    color: 'var(--ink)',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {item.q}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '20px',
                                                    color: 'var(--fog)',
                                                    flexShrink: 0,
                                                    display: 'inline-block',
                                                }}
                                            >
                                                {isOpen ? '−' : '+'}
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div
                                                style={{
                                                    paddingBottom: '20px',
                                                    fontSize: '15px',
                                                    color: 'var(--ash)',
                                                    lineHeight: 1.9,
                                                }}
                                            >
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div
                    style={{
                        height: '1px',
                        background: '#e8ecf4',
                        marginBottom: '72px',
                    }}
                />

                {/* Still need help */}
                <div>
                    <h2
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--ash)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            marginBottom: '24px',
                            fontFamily: 'var(--font-display)',
                        }}
                    >
                        Still need help?
                    </h2>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link
                            href="/contact"
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '20px',
                                background: 'var(--white)',
                                border: '1px solid #e8ecf4',
                                borderRadius: 'var(--r-card)',
                                textDecoration: 'none',
                            }}
                        >
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'var(--mist)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '22px',
                                    flexShrink: 0,
                                }}
                            >
                                ✉️
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'var(--ink)',
                                        marginBottom: '4px',
                                    }}
                                >
                                    Contact Us
                                </div>
                                <div
                                    style={{
                                        fontSize: '13px',
                                        color: 'var(--fog)',
                                    }}
                                >
                                    Send us a message
                                </div>
                            </div>
                        </Link>

                        <a
                            href="https://wa.me/917294034023"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '20px',
                                background: 'var(--white)',
                                border: '1px solid #e8ecf4',
                                borderRadius: 'var(--r-card)',
                                textDecoration: 'none',
                            }}
                        >
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'var(--mist)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '22px',
                                    flexShrink: 0,
                                }}
                            >
                                💬
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'var(--ink)',
                                        marginBottom: '4px',
                                    }}
                                >
                                    WhatsApp
                                </div>
                                <div
                                    style={{
                                        fontSize: '13px',
                                        color: 'var(--fog)',
                                    }}
                                >
                                    Chat with us directly
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
} 