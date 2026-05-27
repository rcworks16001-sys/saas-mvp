'use client';

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
                href="/login"
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
                href="/register"
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

export default function PrivacyPage() {
    const sections = [
        {
            title: 'Who We Are',
            content: `Ourivo is a software platform that helps businesses capture and manage customer leads. If you have any questions about this policy, contact us at privacy@ourivo.com.`
        },
        {
            title: 'What We Collect',
            content: `When you sign up and use Ourivo, we collect:\n\n• Your name, email address, and phone number\n• Your business name and business information you provide\n• Lead data captured through your chatbot (names, phone numbers, messages from your customers)\n• Payment information processed through Razorpay (we never see or store your card details)\n• Usage data — how you interact with the dashboard`
        },
        {
            title: 'How We Use It',
            content: `We use your data only to provide and improve the Ourivo service:\n\n• To run your chatbot and capture leads on your behalf\n• To send you notifications when new leads arrive\n• To process your subscription payment\n• To send transactional emails (OTP, lead notifications)\n• To improve the product based on how it is used`
        },
        {
            title: 'What We Don\'t Do',
            content: `We will never sell your data or your customers' data to anyone.\n\nWe will never share your information with third parties for advertising.\n\nWe will never use your leads' data for any purpose other than delivering the service to you.`
        },
        {
            title: 'Who We Share Data With',
            content: `We use a small number of trusted services to operate:\n\n• Razorpay — payment processing\n• Resend — transactional email delivery\n• Meta (WhatsApp API) — to send and receive messages on your behalf\n• Railway — cloud hosting for our backend\n• Vercel — hosting for our frontend\n\nEach of these services has their own privacy policy and handles data responsibly.`
        },
        {
            title: 'How Long We Keep It',
            content: `We keep your data for as long as your account is active. When you delete your account, all your data — leads, conversations, settings — is permanently deleted from our systems within 24 hours.`
        },
        {
            title: 'Your Rights',
            content: `You have the right to:\n\n• Access all data we hold about you\n• Delete your account and all associated data at any time (Settings → Subscription → Delete Account)\n• Request a copy of your data by emailing privacy@ourivo.com`
        },
        {
            title: 'Data Security',
            content: `All data is encrypted in transit (HTTPS). Passwords are hashed and never stored in plain text. We do not store payment card details. Access to our database is restricted and protected.`
        },
        {
            title: 'Changes to This Policy',
            content: `If we make significant changes to this policy, we will notify you by email. The latest version is always available at ourivo.com/privacy.`
        },
        {
            title: 'Contact',
            content: `For any privacy concerns: privacy@ourivo.com`
        },
    ];

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

            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 48px' }}>

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
                        Privacy Policy
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
                    Your data is yours.
                </h1>
                <p
                    style={{
                        fontSize: '16px',
                        color: 'var(--ash)',
                        lineHeight: 1.8,
                        marginBottom: '16px',
                    }}
                >
                    We believe in complete transparency about what we collect, how we use it, and what we will never do with it.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--fog)', marginBottom: '72px' }}>Last updated: May 2026</p>

                <div style={{ height: '1px', background: '#e8ecf4', marginBottom: '72px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                    {sections.map((section, i) => (
                        <div key={i}>
                            <h2
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: 'var(--ash)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    marginBottom: '16px',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                {String(i + 1).padStart(2, '0')}. {section.title}
                            </h2>
                            <div style={{ fontSize: '15px', color: 'var(--ash)', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                                {section.content}
                            </div>
                            {i < sections.length - 1 && (
                                <div style={{ height: '1px', background: '#e8ecf4', marginTop: '56px' }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}