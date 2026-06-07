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

export default function TermsPage() {
    const sections = [
        {
            title: 'Acceptance of Terms',
            content: `By creating an account and using Ourivo, you agree to these terms. If you do not agree, do not use the service.`
        },
        {
            title: 'What Ourivo Is',
            content: `Ourivo is a SaaS platform that helps businesses automate lead capture, qualification, and follow-up. We provide the tools — you are responsible for how you use them and what your chatbot says to your customers.`
        },
        {
            title: 'What Ourivo Is Not',
            content: `Ourivo is not a marketing agency. We do not guarantee leads, sales, or business outcomes. The quality of results depends on how you configure and use the platform.`
        },
        {
            title: 'Your Account',
            content: `You are responsible for:\n\n• Keeping your login credentials secure\n• All activity that happens under your account\n• Ensuring the information you provide is accurate\n• Complying with all applicable laws in your use of the platform\n\nOne account per business. You may not share, sell, or transfer your account to another person or business.`
        },
        {
            title: 'Subscription and Payment',
            content: `Ourivo is a paid subscription service at ₹1,999/month after a 14-day free trial. Payment is processed securely through Razorpay.\n\nSubscriptions renew automatically each month. You can cancel at any time by deleting your account or contacting support@ourivo.com.`
        },
        {
            title: 'Refund Policy',
            content: `We do not offer refunds. The 14-day free trial gives you full access to evaluate the product before paying. Once a payment is processed, it is non-refundable.`
        },
        {
            title: 'Fair Use',
            content: `There are no limits on the number of leads or messages. We ask that you use the platform for legitimate business purposes only.`
        },
        {
            title: 'Prohibited Use',
            content: `You may not use Ourivo to:\n\n• Send spam or unsolicited messages\n• Harass, deceive, or defraud customers\n• Collect data without customer consent\n• Violate any applicable law or regulation\n• Impersonate another business or individual`
        },
        {
            title: 'Misuse and Account Termination',
            content: `If we determine that your account is being used for spam, fraud, harassment, or any other prohibited activity, we will permanently delete your account without notice. No refund will be issued in such cases.\n\nWe reserve the right to terminate any account at our discretion if it violates these terms.`
        },
        {
            title: 'Service Availability',
            content: `We aim for high availability but do not guarantee 100% uptime. We are not liable for losses caused by service interruptions, technical issues, or third-party service failures.`
        },
        {
            title: 'Limitation of Liability',
            content: `Ourivo's liability is limited to the amount you paid in the last billing cycle. We are not responsible for indirect losses, lost revenue, or lost leads resulting from use or inability to use the service.`
        },
        {
            title: 'Changes to Terms',
            content: `We may update these terms from time to time. We will notify you by email for significant changes. Continued use of the service after changes means you accept the updated terms.`
        },
        {
            title: 'Governing Law',
            content: `These terms are governed by the laws of India. Any disputes will be resolved in the courts of Bangalore, Karnataka.`
        },
        {
            title: 'Contact',
            content: `For any questions about these terms: legal@ourivo.com`
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
                        Terms & Conditions
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
                    Simple, honest terms.
                </h1>
                <p
                    style={{
                        fontSize: '16px',
                        color: 'var(--ash)',
                        lineHeight: 1.8,
                        marginBottom: '16px',
                    }}
                >
                    No legal jargon. Just a clear explanation of what you can expect from us and what we expect from you.
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