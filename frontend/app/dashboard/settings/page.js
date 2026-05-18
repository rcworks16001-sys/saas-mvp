'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const S = {
    bg: '#0F1115', surface: '#161A22', surface2: '#1C2130',
    accent: '#4F8CFF', accentDark: '#3a7aef', border: '#2A3142',
    textPrimary: '#F5F7FA', textSecondary: '#9AA4B2', textMuted: '#5C6A7E',
};

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [greetingMessage, setGreetingMessage] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            const { config, organization } = response.data;
            setOrgName(organization.name);
            setWhatsappPhone(organization.phone || '');
            setGreetingMessage(config.greeting_message || '');
            setQuestions(config.questions || []);
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', {
                greetingMessage,
                questions,
                whatsappPhone
            });
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: questions.length + 1,
            question: '',
            key: `question_${questions.length + 1}`
        }]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px',
        background: S.surface2,
        border: `1.5px solid ${S.border}`,
        borderRadius: '10px',
        color: S.textPrimary, fontSize: '14px',
        fontFamily: 'var(--font-family)', outline: 'none',
        transition: 'all 180ms ease',
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
                    padding: '6px 14px',
                    background: 'transparent',
                    border: `1px solid ${S.border}`,
                    borderRadius: '8px',
                    color: S.textSecondary, fontSize: '13px',
                    fontWeight: 500, textDecoration: 'none',
                    transition: 'all 180ms ease'
                }}>
                    ← Back to Dashboard
                </Link>
            </nav>

            {/* Content */}
            <div style={{ padding: '28px 32px', maxWidth: '700px', margin: '0 auto' }}>

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{
                        fontSize: '20px', fontWeight: 700,
                        color: S.textPrimary, letterSpacing: '-0.02em',
                        marginBottom: '4px'
                    }}>
                        Chatbot Settings
                    </h1>
                    <p style={{ color: S.textMuted, fontSize: '13px' }}>
                        Customize how your WhatsApp chatbot talks to your customers
                    </p>
                </div>

                {/* Organization info */}
                <div style={{
                    background: S.surface, border: `1px solid ${S.border}`,
                    borderRadius: '14px', padding: '24px', marginBottom: '16px'
                }}>
                    <h3 style={{
                        fontSize: '12px', fontWeight: 700,
                        color: S.textMuted, letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: '16px'
                    }}>
                        Business Info
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block', fontSize: '12px', fontWeight: 600,
                            color: S.textSecondary, marginBottom: '8px'
                        }}>
                            Business Name
                        </label>
                        <input
                            type="text"
                            value={orgName}
                            disabled
                            style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block', fontSize: '12px', fontWeight: 600,
                            color: S.textSecondary, marginBottom: '8px'
                        }}>
                            Your WhatsApp Number (for lead notifications)
                        </label>
                        <input
                            type="text"
                            value={whatsappPhone}
                            onChange={e => setWhatsappPhone(e.target.value)}
                            placeholder="e.g. 917294034023 (include country code, no +)"
                            style={inputStyle}
                            onFocus={e => {
                                e.target.style.border = `1.5px solid ${S.accent}`;
                                e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`;
                            }}
                            onBlur={e => {
                                e.target.style.border = `1.5px solid ${S.border}`;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <p style={{ fontSize: '11px', color: S.textMuted, marginTop: '6px' }}>
                            You will receive a WhatsApp notification here when a new lead arrives
                        </p>
                    </div>
                </div>

                {/* Greeting message */}
                <div style={{
                    background: S.surface, border: `1px solid ${S.border}`,
                    borderRadius: '14px', padding: '24px', marginBottom: '16px'
                }}>
                    <h3 style={{
                        fontSize: '12px', fontWeight: 700,
                        color: S.textMuted, letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: '16px'
                    }}>
                        Greeting Message
                    </h3>
                    <label style={{
                        display: 'block', fontSize: '12px', fontWeight: 600,
                        color: S.textSecondary, marginBottom: '8px'
                    }}>
                        First message your chatbot sends
                    </label>
                    <textarea
                        value={greetingMessage}
                        onChange={e => setGreetingMessage(e.target.value)}
                        rows={3}
                        placeholder="e.g. Hello! Welcome to Sharma Properties. I am here to help you find your dream home."
                        style={{
                            ...inputStyle,
                            resize: 'vertical',
                            lineHeight: 1.6
                        }}
                        onFocus={e => {
                            e.target.style.border = `1.5px solid ${S.accent}`;
                            e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`;
                        }}
                        onBlur={e => {
                            e.target.style.border = `1.5px solid ${S.border}`;
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Questions */}
                <div style={{
                    background: S.surface, border: `1px solid ${S.border}`,
                    borderRadius: '14px', padding: '24px', marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: '16px'
                    }}>
                        <h3 style={{
                            fontSize: '12px', fontWeight: 700,
                            color: S.textMuted, letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                        }}>
                            Qualifying Questions
                        </h3>
                        <button
                            onClick={addQuestion}
                            style={{
                                padding: '5px 12px',
                                background: 'rgba(79,140,255,0.1)',
                                border: `1px solid rgba(79,140,255,0.2)`,
                                borderRadius: '7px',
                                color: S.accent, fontSize: '12px',
                                fontWeight: 600, cursor: 'pointer',
                                fontFamily: 'var(--font-family)'
                            }}
                        >
                            + Add Question
                        </button>
                    </div>

                    <p style={{
                        fontSize: '12px', color: S.textMuted,
                        marginBottom: '16px', lineHeight: 1.6
                    }}>
                        These questions are asked in order to qualify each lead. The answers are saved to the lead profile automatically.
                    </p>

                    {questions.map((q, i) => (
                        <div key={i} style={{
                            padding: '16px',
                            background: S.surface2,
                            border: `1px solid ${S.border}`,
                            borderRadius: '10px',
                            marginBottom: '10px'
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', marginBottom: '10px'
                            }}>
                                <span style={{
                                    fontSize: '11px', fontWeight: 700,
                                    color: S.textMuted, letterSpacing: '0.05em'
                                }}>
                                    QUESTION {i + 1}
                                </span>
                                <button
                                    onClick={() => removeQuestion(i)}
                                    style={{
                                        padding: '3px 8px',
                                        background: 'rgba(248,113,113,0.1)',
                                        border: `1px solid rgba(248,113,113,0.2)`,
                                        borderRadius: '5px',
                                        color: '#f87171', fontSize: '11px',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-family)'
                                    }}
                                >
                                    Remove
                                </button>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{
                                    display: 'block', fontSize: '11px',
                                    color: S.textMuted, marginBottom: '6px'
                                }}>
                                    Question text
                                </label>
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={e => updateQuestion(i, 'question', e.target.value)}
                                    placeholder="e.g. What is your budget?"
                                    style={inputStyle}
                                    onFocus={e => {
                                        e.target.style.border = `1.5px solid ${S.accent}`;
                                        e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`;
                                    }}
                                    onBlur={e => {
                                        e.target.style.border = `1.5px solid ${S.border}`;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block', fontSize: '11px',
                                    color: S.textMuted, marginBottom: '6px'
                                }}>
                                    Key (used to save the answer)
                                </label>
                                <input
                                    type="text"
                                    value={q.key}
                                    onChange={e => updateQuestion(i, 'key', e.target.value)}
                                    placeholder="e.g. budget"
                                    style={inputStyle}
                                    onFocus={e => {
                                        e.target.style.border = `1.5px solid ${S.accent}`;
                                        e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`;
                                    }}
                                    onBlur={e => {
                                        e.target.style.border = `1.5px solid ${S.border}`;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    {questions.length === 0 && (
                        <div style={{
                            textAlign: 'center', padding: '32px',
                            color: S.textMuted, fontSize: '13px'
                        }}>
                            No questions yet. Click "+ Add Question" to add one.
                        </div>
                    )}
                </div>

                {/* Save button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: '100%', padding: '13px',
                        background: saving ? S.surface2 : S.accent,
                        border: 'none', borderRadius: '10px',
                        color: 'white', fontSize: '14px', fontWeight: 600,
                        fontFamily: 'var(--font-family)',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        transition: 'all 180ms ease',
                        boxShadow: saving ? 'none' : `0 4px 18px rgba(79,140,255,0.3)`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px'
                    }}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>

            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}