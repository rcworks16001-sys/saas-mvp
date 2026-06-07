'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '../../lib/api';

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

const EXPERIENCES = ['Excellent', 'Good', 'Average', 'Poor'];

export default function FeedbackPage() {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [experience, setExperience] = useState('');
    const [liked, setLiked] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { toast.error('Please select a star rating'); return; }
        if (!experience) { toast.error('Please select your overall experience'); return; }

        setSending(true);
        try {
            await api.post('/contact/feedback', { rating, experience, liked, suggestions, name, email });
            setSent(true);
            toast.success('Thank you for your feedback!');
        } catch (error) {
            toast.error('Failed to submit. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'var(--mist)',
        border: '1px solid var(--ice)',
        borderRadius: 'var(--r-btn)',
        color: 'var(--ink)',
        fontSize: '15px',
        fontFamily: 'var(--font-body)',
        outline: 'none',
        transition: 'border-color 120ms ease',
        boxSizing: 'border-box',
    };

    const focusHandlers = {
        onFocus: e => {
            e.target.style.border = '1px solid var(--ink)';
        },
        onBlur: e => {
            e.target.style.border = '1px solid var(--ice)';
        }
    };

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

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 48px' }}>

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
                        Feedback
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
                    Tell us what you think.
                </h1>
                <p
                    style={{
                        fontSize: '16px',
                        color: 'var(--ash)',
                        lineHeight: 1.8,
                        marginBottom: '72px',
                    }}
                >
                    Your feedback directly shapes how we build Ourivo. Every response is read by our team.
                </p>

                <div
                    style={{
                        height: '1px',
                        background: '#e8ecf4',
                        marginBottom: '64px',
                    }}
                />

                {sent ? (
                    <div style={{ textAlign: 'center', padding: '64px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🙏</div>
                        <h2
                            style={{
                                fontSize: '24px',
                                fontWeight: 500,
                                color: 'var(--ink)',
                                marginBottom: '12px',
                                fontFamily: 'var(--font-display)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Thank you!
                        </h2>
                        <p style={{ fontSize: '15px', color: 'var(--ash)', lineHeight: 1.8 }}>
                            Your feedback means a lot to us. We read every response and use it to make Ourivo better.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                        {/* Star Rating */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: 'var(--ash)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    marginBottom: '20px',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                Overall Rating
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHovered(star)}
                                        onMouseLeave={() => setHovered(0)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            fontSize: '40px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color:
                                                    hovered >= star ||
                                                        rating >= star
                                                        ? '#fbbf24'
                                                        : '#e8ecf4',
                                            }}
                                        >
                                            ★
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p style={{ fontSize: '13px', color: 'var(--fog)', marginTop: '8px' }}>
                                    {['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'][rating]}
                                </p>
                            )}
                        </div>

                        <div style={{ height: '1px', background: '#e8ecf4' }} />

                        {/* Overall Experience */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: 'var(--ash)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    marginBottom: '20px',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                Overall Experience
                            </label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {EXPERIENCES.map(exp => (
                                    <button
                                        key={exp}
                                        onClick={() => setExperience(exp)}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '999px',
                                            border: experience === exp
                                                ? '1px solid var(--ink)'
                                                : '1px solid #e8ecf4',
                                            background:
                                                experience === exp
                                                    ? 'var(--ink)'
                                                    : 'transparent',
                                            color:
                                                experience === exp
                                                    ? 'var(--white)'
                                                    : 'var(--ash)',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-body)',
                                        }}
                                    >
                                        {exp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '1px', background: '#e8ecf4' }} />

                        {/* What they liked */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: 'var(--ash)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    marginBottom: '12px',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                What did you like?
                            </label>
                            <textarea value={liked} onChange={e => setLiked(e.target.value)} rows={4} placeholder="Tell us what's working well..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} {...focusHandlers} />
                        </div>

                        {/* Suggestions */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: 'var(--ash)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    marginBottom: '12px',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                Suggestions for improvement
                            </label>
                            <textarea value={suggestions} onChange={e => setSuggestions(e.target.value)} rows={4} placeholder="What could we do better? Any features you'd love to see?" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} {...focusHandlers} />
                        </div>

                        <div style={{ height: '1px', background: '#e8ecf4' }} />

                        {/* Optional info */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: 'var(--ash)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    marginBottom: '8px',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                Your details{' '}
                                <span
                                    style={{
                                        color: 'var(--fog)',
                                        fontWeight: 400,
                                        textTransform: 'none',
                                        letterSpacing: 0,
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    (optional)
                                </span>
                            </label>
                            <p style={{ fontSize: '13px', color: 'var(--fog)', marginBottom: '20px' }}>Only if you'd like us to follow up with you.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--fog)', marginBottom: '8px' }}>Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} {...focusHandlers} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--fog)', marginBottom: '8px' }}>Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} {...focusHandlers} />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={sending}
                            style={{
                                padding: '15px',
                                background: sending ? 'var(--mist)' : 'var(--ink)',
                                border: 'none',
                                borderRadius: 'var(--r-btn)',
                                color: 'var(--white)',
                                fontSize: '15px',
                                fontWeight: 600,
                                fontFamily: 'var(--font-body)',
                                cursor: sending ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {sending ? 'Submitting...' : 'Submit Feedback →'}
                        </button>
                    </div>
                )}
            </div>

            <Footer />
            <style>{`input::placeholder, textarea::placeholder { color: var(--fog); }`}</style>
        </div>
    );
}