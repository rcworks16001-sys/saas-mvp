'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../lib/api';

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
        width: '100%', padding: '12px 16px',
        background: S.surface2, border: `1.5px solid ${S.border}`,
        borderRadius: '10px', color: S.textPrimary, fontSize: '15px',
        fontFamily: 'var(--font-family)', outline: 'none',
        transition: 'all 180ms ease', boxSizing: 'border-box',
    };

    const focusHandlers = {
        onFocus: e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`; },
        onBlur: e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }
    };

    return (
        <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'var(--font-family)', color: S.textPrimary }}>
            <Navbar />

            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 48px' }}>

                {/* Label */}
                <div style={{ marginBottom: '32px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: `2px solid ${S.accent}`, paddingBottom: '4px' }}>
                        Feedback
                    </span>
                </div>

                <h1 style={{ fontSize: '48px', fontWeight: 800, color: S.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
                    Tell us what you think.
                </h1>
                <p style={{ fontSize: '16px', color: S.textSecondary, lineHeight: 1.9, marginBottom: '72px' }}>
                    Your feedback directly shapes how we build Ourivo. Every response is read by our team.
                </p>

                <div style={{ height: '1px', background: S.border, marginBottom: '64px' }} />

                {sent ? (
                    <div style={{ textAlign: 'center', padding: '64px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🙏</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: S.textPrimary, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>Thank you!</h2>
                        <p style={{ fontSize: '15px', color: S.textSecondary, lineHeight: 1.8 }}>
                            Your feedback means a lot to us. We read every response and use it to make Ourivo better.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                        {/* Star Rating */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
                                Overall Rating
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHovered(star)}
                                        onMouseLeave={() => setHovered(0)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '40px', transition: 'transform 150ms ease', transform: hovered >= star || rating >= star ? 'scale(1.1)' : 'scale(1)' }}>
                                        <span style={{ color: hovered >= star || rating >= star ? '#fbbf24' : S.border, transition: 'color 150ms ease' }}>★</span>
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p style={{ fontSize: '13px', color: S.textMuted, marginTop: '8px' }}>
                                    {['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'][rating]}
                                </p>
                            )}
                        </div>

                        <div style={{ height: '1px', background: S.border }} />

                        {/* Overall Experience */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
                                Overall Experience
                            </label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {EXPERIENCES.map(exp => (
                                    <button key={exp} onClick={() => setExperience(exp)} style={{ padding: '10px 20px', borderRadius: '999px', border: `1.5px solid ${experience === exp ? S.accent : S.border}`, background: experience === exp ? 'rgba(79,140,255,0.1)' : 'transparent', color: experience === exp ? S.accent : S.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all 180ms ease' }}>
                                        {exp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '1px', background: S.border }} />

                        {/* What they liked */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                                What did you like?
                            </label>
                            <textarea value={liked} onChange={e => setLiked(e.target.value)} rows={4} placeholder="Tell us what's working well..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} {...focusHandlers} />
                        </div>

                        {/* Suggestions */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                                Suggestions for improvement
                            </label>
                            <textarea value={suggestions} onChange={e => setSuggestions(e.target.value)} rows={4} placeholder="What could we do better? Any features you'd love to see?" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} {...focusHandlers} />
                        </div>

                        <div style={{ height: '1px', background: S.border }} />

                        {/* Optional info */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: S.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Your details <span style={{ color: S.textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                            </label>
                            <p style={{ fontSize: '13px', color: S.textMuted, marginBottom: '20px' }}>Only if you'd like us to follow up with you.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: S.textMuted, marginBottom: '8px' }}>Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} {...focusHandlers} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: S.textMuted, marginBottom: '8px' }}>Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} {...focusHandlers} />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} disabled={sending} style={{ padding: '15px', background: sending ? S.surface2 : `linear-gradient(135deg, ${S.accent}, #6366f1)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-family)', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 180ms ease', boxShadow: sending ? 'none' : '0 4px 20px rgba(79,140,255,0.3)' }}>
                            {sending ? 'Submitting...' : 'Submit Feedback →'}
                        </button>
                    </div>
                )}
            </div>

            <Footer />
            <style>{`input::placeholder, textarea::placeholder { color: #5C6A7E; }`}</style>
        </div>
    );
}