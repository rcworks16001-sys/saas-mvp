'use client';

import { useState, useEffect, useRef } from 'react';
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

const QUESTION_SUGGESTIONS = [
    { question: 'What is your budget?', key: 'budget' },
    { question: 'Which area or locality are you looking in?', key: 'area' },
    { question: 'How many BHK do you need?', key: 'bhk' },
    { question: 'What is your timeline to purchase?', key: 'timeline' },
    { question: 'Do you need a home loan?', key: 'loan_required' },
    { question: 'Are you interested in a site visit?', key: 'site_visit_interest' },
    { question: 'What type of property are you looking for?', key: 'property_type' },
    { question: 'Is this for self-use or investment?', key: 'purpose' },
];

const NAV_ITEMS = [
    { id: 'Account', label: 'Account', icon: '👤', desc: 'Business info & profile' },
    { id: 'Chatbot', label: 'Chatbot', icon: '🤖', desc: 'Questions & AI rules' },
    { id: 'Notifications', label: 'Notifications', icon: '🔔', desc: 'Alerts & channels' },
    { id: 'Subscription', label: 'Subscription', icon: '💳', desc: 'Plan & billing' },
];

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('Account');
    const [animating, setAnimating] = useState(false);
    const [sandboxOpen, setSandboxOpen] = useState(false);
    const [sandboxMessages, setSandboxMessages] = useState([]);
    const [sandboxInput, setSandboxInput] = useState('');
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const sandboxEndRef = useRef(null);

    const [orgName, setOrgName] = useState('');
    const [description, setDescription] = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [serviceLocations, setServiceLocations] = useState('');
    const [website, setWebsite] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [orgEmail, setOrgEmail] = useState('');
    const [greetingMessage, setGreetingMessage] = useState('');
    const [questions, setQuestions] = useState([]);
    const [aiRules, setAiRules] = useState('');
    const [tone, setTone] = useState('professional');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [billingStatus, setBillingStatus] = useState(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) { router.push('/login'); return; }
        fetchSettings();
        fetchBilling();
    }, []);

    useEffect(() => {
        sandboxEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sandboxMessages]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            const { config, organization } = response.data;
            setOrgName(organization.name || '');
            setOrgEmail(organization.email || '');
            setWhatsappPhone(organization.phone || '');
            setDescription(organization.description || '');
            setWorkingHours(organization.working_hours || '9 AM - 6 PM');
            setServiceLocations(organization.service_locations || '');
            setWebsite(organization.website || '');
            setEmailNotifications(organization.email_notifications ?? true);
            setGreetingMessage(config.greeting_message || '');
            setQuestions(config.questions || []);
            setAiRules(config.ai_rules || '');
            setTone(config.tone || 'professional');
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchBilling = async () => {
        try {
            const response = await api.get('/billing/status');
            setBillingStatus(response.data);
        } catch (error) { }
    };

    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        try {
            await api.delete('/auth/delete-account');
            toast.success('Account deleted');
            Cookies.remove('token');
            Cookies.remove('organizationId');
            Cookies.remove('userName');
            router.push('/');
        } catch (error) {
            toast.error('Failed to delete account');
            setDeletingAccount(false);
            setShowDeleteAccount(false);
        }
    };

    const switchTab = (tab) => {
        if (tab === activeTab || animating) return;
        setAnimating(true);
        setTimeout(() => {
            setActiveTab(tab);
            setAnimating(false);
        }, 220);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', {
                greetingMessage, questions, whatsappPhone,
                description, workingHours, serviceLocations,
                website, emailNotifications, aiRules, tone
            });
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const generateKey = (questionText) => {
        return questionText.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim().split(/\s+/).slice(0, 2).join('_') || `question_${Date.now()}`;
    };

    const updateQuestion = (index, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], question: value, key: generateKey(value) };
        setQuestions(updated);
    };

    const addQuestion = () => {
        setQuestions([...questions, { id: questions.length + 1, question: '', key: `question_${questions.length + 1}` }]);
    };

    const addSuggestedQuestion = (suggestion) => {
        if (questions.some(q => q.key === suggestion.key)) { toast.error('Already added'); return; }
        setQuestions([...questions, { id: questions.length + 1, ...suggestion }]);
        setShowSuggestions(false);
        toast.success('Question added');
    };

    const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

    const handleSandboxSend = () => {
        if (!sandboxInput.trim()) return;
        const userMsg = sandboxInput.trim();
        const currentMessages = [...sandboxMessages, { sender: 'user', text: userMsg }];
        setSandboxMessages(currentMessages);
        setSandboxInput('');
        setTimeout(() => {
            const userCount = currentMessages.filter(m => m.sender === 'user').length;
            const followNext = questions[userCount];
            let botReply;
            if (userCount === 1) {
                botReply = greetingMessage || 'Hello! How can I help you?';
                if (questions[0]) botReply += `\n\n${questions[0].question}`;
            } else if (followNext) {
                botReply = followNext.question;
            } else {
                botReply = 'Thank you! I have captured all your details. Our team will contact you shortly.';
            }
            setSandboxMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
        }, 700);
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px',
        background: S.surface2, border: `1.5px solid ${S.border}`,
        borderRadius: '10px', color: S.textPrimary, fontSize: '14px',
        fontFamily: 'var(--font-family)', outline: 'none',
        transition: 'all 180ms ease', boxSizing: 'border-box',
    };

    const focusHandlers = {
        onFocus: e => { e.target.style.border = `1.5px solid ${S.accent}`; e.target.style.boxShadow = `0 0 0 3px rgba(79,140,255,0.12)`; },
        onBlur: e => { e.target.style.border = `1.5px solid ${S.border}`; e.target.style.boxShadow = 'none'; }
    };

    const sectionStyle = {
        background: S.surface, border: `1px solid ${S.border}`,
        borderRadius: '16px', padding: '24px', marginBottom: '16px'
    };

    const SaveButton = ({ label }) => (
        <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: '13px',
            background: saving ? S.surface2 : `linear-gradient(135deg, ${S.accent}, #6366f1)`,
            border: 'none', borderRadius: '12px',
            color: 'white', fontSize: '14px', fontWeight: 700,
            fontFamily: 'var(--font-family)',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 200ms ease',
            boxShadow: saving ? 'none' : `0 4px 24px rgba(79,140,255,0.35)`,
        }}>
            {saving ? '⏳ Saving...' : `✓ ${label || 'Save Changes'}`}
        </button>
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '24px', height: '24px', border: `2px solid ${S.border}`, borderTopColor: S.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'var(--font-family)', color: S.textPrimary }}>

            {/* Delete Account Modal */}
            {showDeleteAccount && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: S.surface, border: `1px solid rgba(239,68,68,0.3)`, borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: S.textPrimary, marginBottom: '8px' }}>Delete your account?</h3>
                        <p style={{ fontSize: '13px', color: S.textSecondary, lineHeight: 1.7, marginBottom: '8px' }}>This will permanently delete:</p>
                        <div style={{ fontSize: '13px', color: S.textMuted, marginBottom: '24px', lineHeight: 1.8 }}>
                            • All your leads and conversations<br />
                            • Your chatbot settings<br />
                            • Your account and login<br />
                            • Subscription cancelled — no more charges
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowDeleteAccount(false)} disabled={deletingAccount} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1px solid ${S.border}`, background: 'transparent', color: S.textSecondary, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                                Cancel
                            </button>
                            <button onClick={handleDeleteAccount} disabled={deletingAccount} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontSize: '13px', fontWeight: 600, cursor: deletingAccount ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family)', opacity: deletingAccount ? 0.6 : 1 }}>
                                {deletingAccount ? 'Deleting...' : 'Yes, Delete Everything'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sandbox panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '360px',
                background: S.surface, borderLeft: `1px solid ${S.border}`,
                zIndex: 200, display: 'flex', flexDirection: 'column',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
                transform: sandboxOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(79,140,255,0.05)' }}>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: S.textPrimary }}>🧪 Chatbot Sandbox</div>
                        <div style={{ fontSize: '11px', color: S.textMuted, marginTop: '2px' }}>Preview your chatbot as a lead would see it</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setSandboxMessages([]); setSandboxInput(''); }} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '6px', color: S.textMuted, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>Reset</button>
                        <button onClick={() => setSandboxOpen(false)} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '6px', color: S.textMuted, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>✕</button>
                    </div>
                </div>
                <div style={{ margin: '12px 16px 0', padding: '10px 14px', background: 'rgba(79,140,255,0.06)', border: `1px solid rgba(79,140,255,0.15)`, borderRadius: '8px', fontSize: '11px', color: S.textSecondary, lineHeight: 1.6 }}>
                    💡 Type a message to simulate how a real lead experiences your chatbot. Try saying "Hi" to start.
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sandboxMessages.length === 0 && (
                        <div style={{ textAlign: 'center', color: S.textMuted, fontSize: '12px', marginTop: '40px', lineHeight: 1.8 }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                            Send a message to start the simulation
                        </div>
                    )}
                    {sandboxMessages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: msg.sender === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: msg.sender === 'user' ? 'rgba(79,140,255,0.2)' : S.surface2, border: `1px solid ${msg.sender === 'user' ? 'rgba(79,140,255,0.3)' : S.border}`, fontSize: '13px', color: S.textSecondary, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: msg.sender === 'user' ? S.accent : '#a78bfa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {msg.sender === 'user' ? 'Lead' : 'Bot'}
                                </div>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={sandboxEndRef} />
                </div>
                <div style={{ padding: '12px 16px', borderTop: `1px solid ${S.border}`, display: 'flex', gap: '8px' }}>
                    <input type="text" value={sandboxInput} onChange={e => setSandboxInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSandboxSend()} placeholder="Type as a lead..." style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
                    <button onClick={handleSandboxSend} style={{ padding: '8px 14px', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)', whiteSpace: 'nowrap' }}>Send</button>
                </div>
            </div>

            {/* Navbar */}
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '58px', background: S.surface, borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="/logo.png" alt="Ourivo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <span style={{ fontWeight: 800, fontSize: '16px', fontFamily: 'Georgia, serif' }}>
                        <span style={{ color: S.textPrimary }}>Our</span><span style={{ color: S.accent }}>ivo</span>
                    </span>
                </div>
                <Link href="/dashboard" style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${S.border}`, borderRadius: '8px', color: S.textSecondary, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                    {'← Back to Dashboard'}
                </Link>
            </nav>

            {/* Main layout */}
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>

                {/* Left Sidebar */}
                <div style={{ width: '240px', background: S.surface, borderRight: `1px solid ${S.border}`, padding: '24px 12px', flexShrink: 0, position: 'sticky', top: '58px', height: 'calc(100vh - 58px)', overflowY: 'auto' }}>
                    <div style={{ padding: '0 8px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: S.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Settings</div>
                    </div>

                    {NAV_ITEMS.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => switchTab(item.id)} style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 12px', borderRadius: '10px', border: 'none',
                                background: isActive ? 'linear-gradient(135deg, rgba(79,140,255,0.15), rgba(99,102,241,0.1))' : 'transparent',
                                cursor: 'pointer', fontFamily: 'var(--font-family)',
                                marginBottom: '4px', textAlign: 'left',
                                transition: 'all 200ms ease',
                                outline: isActive ? `1px solid rgba(79,140,255,0.2)` : 'none',
                                position: 'relative', overflow: 'hidden'
                            }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = S.surface2; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {isActive && (
                                    <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: `linear-gradient(180deg, ${S.accent}, #6366f1)`, borderRadius: '0 4px 4px 0' }} />
                                )}
                                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: isActive ? S.textPrimary : S.textSecondary, transition: 'all 200ms ease' }}>{item.label}</div>
                                    <div style={{ fontSize: '11px', color: S.textMuted, marginTop: '1px' }}>{item.desc}</div>
                                </div>
                            </button>
                        );
                    })}

                    {activeTab === 'Chatbot' && (
                        <div style={{ marginTop: '20px', padding: '0 4px' }}>
                            <div style={{ height: '1px', background: S.border, marginBottom: '16px' }} />
                            <button onClick={() => setSandboxOpen(!sandboxOpen)} style={{ width: '100%', padding: '10px 12px', background: sandboxOpen ? 'rgba(79,140,255,0.12)' : 'rgba(79,140,255,0.06)', border: `1px solid rgba(79,140,255,0.2)`, borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-family)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 200ms ease' }}>
                                <span style={{ fontSize: '16px' }}>🧪</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: S.accent }}>Test Chatbot</div>
                                    <div style={{ fontSize: '10px', color: S.textMuted, marginTop: '1px' }}>Open sandbox</div>
                                </div>
                                <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 6px', background: 'rgba(79,140,255,0.15)', borderRadius: '4px', color: S.accent, fontWeight: 700 }}>LIVE</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Content area */}
                <div style={{ flex: 1, padding: '32px 40px', maxWidth: '720px' }}>
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(79,140,255,0.2), rgba(99,102,241,0.15))', border: `1px solid rgba(79,140,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                {NAV_ITEMS.find(n => n.id === activeTab)?.icon}
                            </div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: S.textPrimary, letterSpacing: '-0.02em' }}>{activeTab}</h1>
                        </div>
                        <p style={{ color: S.textMuted, fontSize: '13px', marginLeft: '50px' }}>
                            {NAV_ITEMS.find(n => n.id === activeTab)?.desc}
                        </p>
                    </div>

                    <div style={{ animation: animating ? 'slideOut 0.22s ease forwards' : 'slideIn 0.3s ease forwards' }}>

                        {/* ACCOUNT TAB */}
                        {activeTab === 'Account' && (
                            <div>
                                <div style={sectionStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '16px' }}>🏢</span>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: S.textPrimary }}>Business Information</h3>
                                    </div>
                                    <p style={{ fontSize: '12px', color: S.textMuted, marginBottom: '20px', lineHeight: 1.6, paddingLeft: '24px' }}>
                                        Used by your AI chatbot to answer questions about your business accurately.
                                    </p>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Business Name</label>
                                        <input type="text" value={orgName} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                                        <p style={{ fontSize: '11px', color: S.textMuted, marginTop: '4px' }}>Contact support to change your business name</p>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Business Description</label>
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                            placeholder="e.g. We are a premium real estate agency in Bangalore specializing in residential properties."
                                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} {...focusHandlers} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Working Hours</label>
                                            <input type="text" value={workingHours} onChange={e => setWorkingHours(e.target.value)} placeholder="e.g. 9 AM - 6 PM, Mon-Sat" style={inputStyle} {...focusHandlers} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Website (optional)</label>
                                            <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. www.sharmaproperties.com" style={inputStyle} {...focusHandlers} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Service Locations</label>
                                        <input type="text" value={serviceLocations} onChange={e => setServiceLocations(e.target.value)}
                                            placeholder="e.g. Whitefield, Electronic City, Sarjapur Road"
                                            style={inputStyle} {...focusHandlers} />
                                        <p style={{ fontSize: '11px', color: S.textMuted, marginTop: '4px' }}>Areas where you operate</p>
                                    </div>
                                </div>
                                <SaveButton label="Save Account Settings" />
                            </div>
                        )}

                        {/* CHATBOT TAB */}
                        {activeTab === 'Chatbot' && (
                            <div>
                                <div style={sectionStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '16px' }}>👋</span>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: S.textPrimary }}>Greeting Message</h3>
                                    </div>
                                    <textarea value={greetingMessage} onChange={e => setGreetingMessage(e.target.value)} rows={3}
                                        placeholder="e.g. Hello! Welcome to Sharma Properties. I am here to help you find your dream home."
                                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} {...focusHandlers} />
                                </div>

                                <div style={sectionStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '16px' }}>❓</span>
                                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: S.textPrimary }}>Qualifying Questions</h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setShowSuggestions(!showSuggestions)} style={{ padding: '5px 12px', background: 'rgba(167,139,250,0.1)', border: `1px solid rgba(167,139,250,0.2)`, borderRadius: '7px', color: '#a78bfa', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                                                💡 Suggestions
                                            </button>
                                            <button onClick={addQuestion} style={{ padding: '5px 12px', background: 'rgba(79,140,255,0.1)', border: `1px solid rgba(79,140,255,0.2)`, borderRadius: '7px', color: S.accent, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '12px', color: S.textMuted, marginBottom: '16px', lineHeight: 1.6 }}>
                                        Asked one at a time. Answers are saved automatically to the lead profile.
                                    </p>

                                    {showSuggestions && (
                                        <div style={{ background: 'rgba(167,139,250,0.05)', border: `1px solid rgba(167,139,250,0.15)`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                                            <p style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600, marginBottom: '12px' }}>💡 Real estate questions — click to add</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {QUESTION_SUGGESTIONS.map((s, i) => (
                                                    <button key={i} onClick={() => addSuggestedQuestion(s)} style={{ padding: '6px 14px', background: 'rgba(167,139,250,0.08)', border: `1px solid rgba(167,139,250,0.2)`, borderRadius: '999px', color: S.textSecondary, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all 180ms ease' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.18)'; e.currentTarget.style.color = '#a78bfa'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; e.currentTarget.style.color = S.textSecondary; }}>
                                                        + {s.question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {questions.map((q, i) => (
                                        <div key={i} style={{ padding: '14px 16px', background: S.surface2, border: `1px solid ${S.border}`, borderRadius: '10px', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 700 }}>
                                                        {i + 1}
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: S.textMuted }}>Question {i + 1}</span>
                                                </div>
                                                <button onClick={() => removeQuestion(i)} style={{ padding: '3px 8px', background: 'rgba(248,113,113,0.1)', border: `1px solid rgba(248,113,113,0.2)`, borderRadius: '5px', color: '#f87171', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>Remove</button>
                                            </div>
                                            <input type="text" value={q.question} onChange={e => updateQuestion(i, e.target.value)} placeholder="e.g. What is your budget?" style={inputStyle} {...focusHandlers} />
                                            <p style={{ fontSize: '11px', color: S.textMuted, marginTop: '6px' }}>
                                                Key: <code style={{ color: S.accent, background: 'rgba(79,140,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{q.key}</code>
                                            </p>
                                        </div>
                                    ))}

                                    {questions.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '32px', color: S.textMuted, fontSize: '13px' }}>
                                            No questions yet. Use suggestions or add your own.
                                        </div>
                                    )}
                                </div>

                                <div style={sectionStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '16px' }}>🛡️</span>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: S.textPrimary }}>AI Response Rules</h3>
                                    </div>
                                    <p style={{ fontSize: '12px', color: S.textMuted, marginBottom: '16px', lineHeight: 1.6 }}>
                                        Set guardrails — what to avoid, how to behave, and what tone to use.
                                    </p>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Tone</label>
                                        <select value={tone} onChange={e => setTone(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="professional">Professional</option>
                                            <option value="friendly">Friendly & Casual</option>
                                            <option value="formal">Formal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Custom Rules (one per line)</label>
                                        <textarea value={aiRules} onChange={e => setAiRules(e.target.value)} rows={5}
                                            placeholder={`e.g.\nNever discuss competitor pricing\nAlways ask budget before recommending properties\nNever promise availability without checking\nKeep replies short and clear`}
                                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }} {...focusHandlers} />
                                    </div>
                                </div>

                                <SaveButton label="Save Chatbot Settings" />
                            </div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'Notifications' && (
                            <div>
                                <div style={sectionStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '16px' }}>📱</span>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: S.textPrimary }}>Notification Channels</h3>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>WhatsApp Notification Number</label>
                                        <input type="text" value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)}
                                            placeholder="e.g. 917294034023 (include country code, no +)"
                                            style={inputStyle} {...focusHandlers} />
                                        <p style={{ fontSize: '11px', color: S.textMuted, marginTop: '4px' }}>You will receive a WhatsApp message here when a new lead arrives</p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.textSecondary, marginBottom: '8px' }}>Email Notifications</label>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: S.surface2, border: `1px solid ${S.border}`, borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', color: S.textPrimary, fontWeight: 500 }}>Send email on new lead</div>
                                                <div style={{ fontSize: '11px', color: S.textMuted, marginTop: '2px' }}>Sent to: {orgEmail || 'your registered email'}</div>
                                            </div>
                                            <div onClick={() => setEmailNotifications(!emailNotifications)} style={{ width: '44px', height: '24px', background: emailNotifications ? `linear-gradient(135deg, ${S.accent}, #6366f1)` : S.border, borderRadius: '999px', cursor: 'pointer', position: 'relative', transition: 'all 250ms ease' }}>
                                                <div style={{ position: 'absolute', top: '3px', left: emailNotifications ? '22px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={sectionStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '16px' }}>⚡</span>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: S.textPrimary }}>Notification Triggers</h3>
                                    </div>
                                    {[
                                        { label: 'New lead captured', desc: 'When a new person messages your WhatsApp', active: true },
                                        { label: 'Hot lead detected', desc: 'Coming soon — when AI scores a lead as high intent', active: false },
                                        { label: 'Follow-up due', desc: 'Coming soon — when a lead needs follow-up', active: false },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? `1px solid ${S.border}` : 'none' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', color: S.textPrimary, fontWeight: 500 }}>{item.label}</div>
                                                <div style={{ fontSize: '11px', color: S.textMuted, marginTop: '2px' }}>{item.desc}</div>
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: item.active ? 'rgba(52,211,153,0.1)' : 'rgba(92,106,126,0.1)', color: item.active ? '#34d399' : S.textMuted }}>
                                                {item.active ? '● Active' : 'Soon'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <SaveButton label="Save Notification Settings" />
                            </div>
                        )}

                        {/* SUBSCRIPTION TAB */}
                        {activeTab === 'Subscription' && (
                            <div>
                                <div style={{ ...sectionStyle, background: billingStatus?.status === 'active' ? 'linear-gradient(135deg, rgba(52,211,153,0.05), rgba(79,140,255,0.05))' : 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(239,68,68,0.03))', border: `1px solid ${billingStatus?.status === 'active' ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 700, color: S.textPrimary, marginBottom: '4px' }}>
                                                {billingStatus?.status === 'active' ? '✨ Pro Plan' : '🕐 Free Trial'}
                                            </div>
                                            <div style={{ fontSize: '13px', color: S.textMuted }}>
                                                {billingStatus?.isTrialActive
                                                    ? `${billingStatus.trialDaysRemaining} days remaining`
                                                    : billingStatus?.status === 'active'
                                                        ? 'All features unlocked'
                                                        : 'Trial has expired'}
                                            </div>
                                        </div>
                                        <span style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, color: billingStatus?.status === 'active' ? '#34d399' : '#f59e0b', background: billingStatus?.status === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)' }}>
                                            {billingStatus?.status === 'active' ? 'ACTIVE' : 'TRIAL'}
                                        </span>
                                    </div>
                                    {billingStatus?.status !== 'active' && (
                                        <a href="/billing" style={{ display: 'block', textAlign: 'center', padding: '13px', background: `linear-gradient(135deg, ${S.accent}, #6366f1)`, borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(79,140,255,0.35)' }}>
                                            Upgrade to Pro — ₹1,999/month →
                                        </a>
                                    )}
                                </div>

                                {billingStatus?.status === 'active' && (
                                    <div style={sectionStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '16px' }}>🔧</span>
                                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: S.textPrimary }}>Manage Subscription</h3>
                                        </div>
                                        <p style={{ fontSize: '13px', color: S.textMuted, lineHeight: 1.7 }}>
                                            To cancel or request a refund, contact us at <span style={{ color: S.accent }}>support@ourivo.com</span>
                                        </p>
                                    </div>
                                )}

                                {/* Danger Zone */}
                                <div style={{ ...sectionStyle, border: `1px solid rgba(239,68,68,0.2)`, background: 'rgba(239,68,68,0.03)', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '16px' }}>⚠️</span>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>Danger Zone</h3>
                                    </div>
                                    <p style={{ fontSize: '13px', color: S.textMuted, lineHeight: 1.7, marginBottom: '16px' }}>
                                        Permanently delete your account and all data. This cannot be undone. Your subscription will be cancelled immediately with no further charges.
                                    </p>
                                    <button onClick={() => setShowDeleteAccount(true)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#f87171', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all 180ms ease' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}>
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-20px); } }
                input::placeholder { color: #5C6A7E; }
                textarea::placeholder { color: #5C6A7E; }
                select option { background: #161A22; color: #F5F7FA; }
            `}</style>
        </div>
    );
}