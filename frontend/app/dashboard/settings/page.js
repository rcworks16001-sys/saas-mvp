'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

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

const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--mist)',
    border: '1.5px solid var(--ice)',
    borderRadius: 'var(--r-btn)',
    color: 'var(--ink)', fontSize: '14px',
    fontFamily: 'var(--font-inter)', outline: 'none',
    transition: 'all 0.18s', boxSizing: 'border-box',
};

const focusHandlers = {
    onFocus: e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; },
    onBlur: e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; },
};

const sectionStyle = {
    background: '#fff',
    border: '1px solid #e8ecf4',
    borderRadius: 20,
    padding: '24px',
    marginBottom: '16px',
};

export default function SettingsPage() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
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
        if (!isLoaded) return;
        if (!isSignedIn) { router.push('/sign-in'); return; }
        fetchSettings();
        fetchBilling();
    }, [isLoaded, isSignedIn]);

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
        } catch {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchBilling = async () => {
        try {
            const response = await api.get('/billing/status');
            setBillingStatus(response.data);
        } catch { }
    };

    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        try {
            await api.delete('/auth/delete-account');
            toast.success('Account deleted');
            await signOut();
            router.push('/');
        } catch {
            toast.error('Failed to delete account');
            setDeletingAccount(false);
            setShowDeleteAccount(false);
        }
    };

    const switchTab = (tab) => {
        if (tab === activeTab || animating) return;
        setAnimating(true);
        setTimeout(() => { setActiveTab(tab); setAnimating(false); }, 200);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', {
                greetingMessage, questions, whatsappPhone,
                description, workingHours, serviceLocations,
                website, emailNotifications, aiRules, tone,
            });
            toast.success('Settings saved');
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const generateKey = (questionText) =>
        questionText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 2).join('_') || `question_${Date.now()}`;

    const updateQuestion = (index, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], question: value, key: generateKey(value) };
        setQuestions(updated);
    };

    const addQuestion = () => setQuestions([...questions, { id: questions.length + 1, question: '', key: `question_${questions.length + 1}` }]);

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

    const SaveButton = ({ label }) => (
        <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: '13px',
            background: saving ? 'var(--mist)' : 'var(--ink)',
            border: 'none', borderRadius: 'var(--r-btn)',
            color: saving ? 'var(--fog)' : '#fff',
            fontSize: '14px', fontWeight: 700,
            fontFamily: 'var(--font-inter)',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.18s',
        }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
            {saving ? '⏳ Saving...' : `✓ ${label || 'Save Changes'}`}
        </button>
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--ice)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 24, height: 24, border: '2px solid var(--ice)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--fog)', letterSpacing: 1 }}>LOADING...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ice)', fontFamily: 'var(--font-inter)', color: 'var(--ink)' }}>

            {/* ── Delete Account Modal ── */}
            {showDeleteAccount && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 'var(--r-card)', padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
                        <div style={{ width: 48, height: 48, background: '#fef2f2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 16px' }}>⚠️</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 0.5, color: 'var(--ink)', marginBottom: 10 }}>DELETE ACCOUNT?</h3>
                        <p style={{ fontSize: 13, color: 'var(--ash)', lineHeight: 1.7, marginBottom: 8 }}>This will permanently delete:</p>
                        <div style={{ fontSize: 13, color: 'var(--fog)', marginBottom: 24, lineHeight: 1.9, textAlign: 'left', background: 'var(--mist)', borderRadius: 12, padding: '14px 18px' }}>
                            • All your leads and conversations<br />
                            • Your chatbot settings<br />
                            • Your account and login<br />
                            • Subscription cancelled — no more charges
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowDeleteAccount(false)} disabled={deletingAccount}
                                style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-btn)', border: '1.5px solid var(--ice)', background: 'transparent', color: 'var(--ash)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                                Cancel
                            </button>
                            <button onClick={handleDeleteAccount} disabled={deletingAccount}
                                style={{ flex: 1, padding: '12px', borderRadius: 'var(--r-btn)', border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: deletingAccount ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-inter)', opacity: deletingAccount ? 0.6 : 1 }}>
                                {deletingAccount ? 'Deleting...' : 'Yes, Delete Everything'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sandbox panel (slides from right) ── */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
                background: '#fff', borderLeft: '1px solid #e8ecf4',
                zIndex: 200, display: 'flex', flexDirection: 'column',
                transform: sandboxOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {/* Sandbox header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ice)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--mist)' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', letterSpacing: 0.5 }}>CHATBOT SANDBOX</div>
                        <div style={{ fontSize: 11, color: 'var(--fog)', marginTop: 2 }}>Preview as a lead would see it</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setSandboxMessages([]); setSandboxInput(''); }}
                            style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, background: 'transparent', border: '1px solid var(--ice)', borderRadius: 6, color: 'var(--ash)', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>Reset</button>
                        <button onClick={() => setSandboxOpen(false)}
                            style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, background: 'transparent', border: '1px solid var(--ice)', borderRadius: 6, color: 'var(--ash)', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>✕</button>
                    </div>
                </div>
                <div style={{ margin: '12px 16px 0', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 11, color: 'var(--ash)', lineHeight: 1.6 }}>
                    💡 Type a message to simulate how a lead experiences your bot. Try saying &ldquo;Hi&rdquo; to start.
                </div>
                {/* Sandbox messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sandboxMessages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--fog)', fontSize: 12, marginTop: 40, lineHeight: 1.8 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                            Send a message to start the simulation
                        </div>
                    )}
                    {sandboxMessages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: msg.sender === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: msg.sender === 'user' ? 'var(--mist)' : 'var(--ink)', border: `1px solid ${msg.sender === 'user' ? 'var(--ice)' : 'var(--ink)'}`, fontSize: 13, color: msg.sender === 'user' ? 'var(--ink)' : '#fff', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: msg.sender === 'user' ? 'var(--fog)' : 'var(--green)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {msg.sender === 'user' ? 'Lead' : 'Bot'}
                                </div>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={sandboxEndRef} />
                </div>
                {/* Sandbox input */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--ice)', background: 'var(--mist)', display: 'flex', gap: 8 }}>
                    <input type="text" value={sandboxInput} onChange={e => setSandboxInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSandboxSend()} placeholder="Type as a lead..."
                        style={{ ...inputStyle, padding: '9px 12px', fontSize: 13 }}
                        onFocus={e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; }}
                        onBlur={e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; }}
                    />
                    <button onClick={handleSandboxSend}
                        style={{ padding: '9px 16px', background: 'var(--ink)', border: 'none', borderRadius: 'var(--r-btn)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
                        Send
                    </button>
                </div>
            </div>

            {/* ── Navbar ── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                height: 62, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 32px',
                background: '#fff', borderBottom: '1px solid #e8ecf4',
            }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <Image src="/logo.png" alt="Ourivo" width={34} height={34} style={{ borderRadius: 8 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', letterSpacing: 1.5 }}>OURIVO</span>
                </Link>
                <Link href="/dashboard"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r-btn)', border: '1.5px solid var(--ice)', color: 'var(--ash)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ice)'; e.currentTarget.style.color = 'var(--ash)'; }}>
                    ← Back to Dashboard
                </Link>
            </nav>

            {/* ── Main layout ── */}
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 62px)' }}>

                {/* Settings sidebar */}
                <aside style={{
                    width: 240, flexShrink: 0,
                    background: '#fff', borderRight: '1px solid #e8ecf4',
                    padding: '24px 14px',
                    position: 'sticky', top: 62,
                    height: 'calc(100vh - 62px)',
                    overflowY: 'auto',
                }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.14em', padding: '0 10px 10px' }}>Settings</div>

                    {NAV_ITEMS.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => switchTab(item.id)} style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 12px', borderRadius: 'var(--r-nav)', border: 'none',
                                background: isActive ? 'var(--ink)' : 'transparent',
                                cursor: 'pointer', fontFamily: 'var(--font-inter)',
                                marginBottom: 2, textAlign: 'left',
                                transition: 'all 0.18s', position: 'relative',
                            }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--mist)'; } }}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'var(--ash)', transition: 'color 0.18s' }}>{item.label}</div>
                                    <div style={{ fontSize: 10, color: isActive ? 'var(--fog)' : 'var(--fog)', marginTop: 1 }}>{item.desc}</div>
                                </div>
                            </button>
                        );
                    })}

                    {/* Sandbox trigger — only on Chatbot tab */}
                    {activeTab === 'Chatbot' && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ice)' }}>
                            <button onClick={() => setSandboxOpen(!sandboxOpen)} style={{
                                width: '100%', padding: '11px 12px',
                                background: sandboxOpen ? 'var(--green)' : 'var(--mist)',
                                border: `1.5px solid ${sandboxOpen ? 'var(--green)' : 'var(--ice)'}`,
                                borderRadius: 'var(--r-nav)', cursor: 'pointer',
                                fontFamily: 'var(--font-inter)',
                                display: 'flex', alignItems: 'center', gap: 10,
                                transition: 'all 0.18s',
                            }}>
                                <span style={{ fontSize: 16 }}>🧪</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>Test Chatbot</div>
                                    <div style={{ fontSize: 10, color: 'var(--fog)', marginTop: 1 }}>Open sandbox</div>
                                </div>
                                <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 7px', background: 'var(--ink)', borderRadius: 4, color: '#fff', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE</span>
                            </button>
                        </div>
                    )}
                </aside>

                {/* Content area */}
                <main style={{ flex: 1, padding: '32px 40px', maxWidth: 720 }}>

                    {/* Section heading */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                            <div style={{ width: 40, height: 40, background: 'var(--ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                {NAV_ITEMS.find(n => n.id === activeTab)?.icon}
                            </div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)', letterSpacing: -1, lineHeight: 0.95 }}>
                                {activeTab.toUpperCase()}.
                            </h1>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ash)', marginLeft: 54 }}>
                            {NAV_ITEMS.find(n => n.id === activeTab)?.desc}
                        </p>
                    </div>

                    <div style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateX(12px)' : 'none', transition: 'all 0.2s' }}>

                        {/* ── ACCOUNT TAB ── */}
                        {activeTab === 'Account' && (
                            <div>
                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>🏢 Business Information</div>
                                    <p style={{ fontSize: 12, color: 'var(--fog)', marginBottom: 20, lineHeight: 1.6 }}>
                                        Used by your AI chatbot to answer questions about your business accurately.
                                    </p>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Business Name</label>
                                        <input type="text" value={orgName} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                                        <p style={{ fontSize: 11, color: 'var(--fog)', marginTop: 4 }}>Contact support to change your business name</p>
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Business Description</label>
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                            placeholder="e.g. We are a premium real estate agency in Bangalore specialising in residential properties."
                                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} {...focusHandlers} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Working Hours</label>
                                            <input type="text" value={workingHours} onChange={e => setWorkingHours(e.target.value)} placeholder="e.g. 9 AM - 6 PM, Mon-Sat" style={inputStyle} {...focusHandlers} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Website (optional)</label>
                                            <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. www.sharmaproperties.com" style={inputStyle} {...focusHandlers} />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Service Locations</label>
                                        <input type="text" value={serviceLocations} onChange={e => setServiceLocations(e.target.value)}
                                            placeholder="e.g. Whitefield, Electronic City, Sarjapur Road"
                                            style={inputStyle} {...focusHandlers} />
                                        <p style={{ fontSize: 11, color: 'var(--fog)', marginTop: 4 }}>Areas where you operate</p>
                                    </div>
                                </div>
                                <SaveButton label="Save Account Settings" />
                            </div>
                        )}

                        {/* ── CHATBOT TAB ── */}
                        {activeTab === 'Chatbot' && (
                            <div>
                                {/* Greeting */}
                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>👋 Greeting Message</div>
                                    <textarea value={greetingMessage} onChange={e => setGreetingMessage(e.target.value)} rows={3}
                                        placeholder="e.g. Hello! Welcome to Sharma Properties. I am here to help you find your dream home."
                                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} {...focusHandlers} />
                                </div>

                                {/* Questions */}
                                <div style={sectionStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>❓ Qualifying Questions</div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setShowSuggestions(!showSuggestions)}
                                                style={{ padding: '5px 12px', background: 'var(--green)', border: 'none', borderRadius: 'var(--r-btn)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                                                💡 Suggestions
                                            </button>
                                            <button onClick={addQuestion}
                                                style={{ padding: '5px 12px', background: 'var(--ink)', border: 'none', borderRadius: 'var(--r-btn)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--fog)', marginBottom: 16, lineHeight: 1.6 }}>
                                        Asked one at a time. Answers are saved automatically to the lead profile.
                                    </p>

                                    {showSuggestions && (
                                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 12 }}>Real estate questions — click to add</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {QUESTION_SUGGESTIONS.map((s, i) => (
                                                    <button key={i} onClick={() => addSuggestedQuestion(s)}
                                                        style={{ padding: '6px 14px', background: 'var(--green)', border: 'none', borderRadius: 20, color: 'var(--ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'opacity 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                        + {s.question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {questions.map((q, i) => (
                                        <div key={i} style={{ padding: '14px 16px', background: 'var(--mist)', border: '1px solid var(--ice)', borderRadius: 14, marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, color: '#fff' }}>
                                                        {i + 1}
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fog)' }}>Question {i + 1}</span>
                                                </div>
                                                <button onClick={() => removeQuestion(i)}
                                                    style={{ padding: '3px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#b91c1c', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>
                                                    Remove
                                                </button>
                                            </div>
                                            <input type="text" value={q.question} onChange={e => updateQuestion(i, e.target.value)} placeholder="e.g. What is your budget?" style={inputStyle} {...focusHandlers} />
                                            <p style={{ fontSize: 11, color: 'var(--fog)', marginTop: 6 }}>
                                                Key: <code style={{ color: 'var(--ink)', background: 'var(--ice)', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{q.key}</code>
                                            </p>
                                        </div>
                                    ))}

                                    {questions.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: 32, color: 'var(--fog)', fontSize: 13 }}>
                                            No questions yet. Use suggestions or add your own.
                                        </div>
                                    )}
                                </div>

                                {/* AI Rules */}
                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>🛡️ AI Response Rules</div>
                                    <p style={{ fontSize: 12, color: 'var(--fog)', marginBottom: 16, lineHeight: 1.6 }}>
                                        Set guardrails — what to avoid, how to behave, and what tone to use.
                                    </p>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tone</label>
                                        <select value={tone} onChange={e => setTone(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
                                            onFocus={e => { e.target.style.border = '1.5px solid var(--ink)'; e.target.style.background = '#fff'; }}
                                            onBlur={e => { e.target.style.border = '1.5px solid var(--ice)'; e.target.style.background = 'var(--mist)'; }}>
                                            <option value="professional">Professional</option>
                                            <option value="friendly">Friendly & Casual</option>
                                            <option value="formal">Formal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Custom Rules (one per line)</label>
                                        <textarea value={aiRules} onChange={e => setAiRules(e.target.value)} rows={5}
                                            placeholder={`e.g.\nNever discuss competitor pricing\nAlways ask budget before recommending properties\nNever promise availability without checking\nKeep replies short and clear`}
                                            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }} {...focusHandlers} />
                                    </div>
                                </div>

                                <SaveButton label="Save Chatbot Settings" />
                            </div>
                        )}

                        {/* ── NOTIFICATIONS TAB ── */}
                        {activeTab === 'Notifications' && (
                            <div>
                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>📱 Notification Channels</div>

                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>WhatsApp Notification Number</label>
                                        <input type="text" value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)}
                                            placeholder="e.g. 917294034023 (include country code, no +)"
                                            style={inputStyle} {...focusHandlers} />
                                        <p style={{ fontSize: 11, color: 'var(--fog)', marginTop: 4 }}>You will receive a WhatsApp message here when a new lead arrives</p>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fog)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Notifications</label>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--mist)', border: '1px solid var(--ice)', borderRadius: 14 }}>
                                            <div>
                                                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>Send email on new lead</div>
                                                <div style={{ fontSize: 11, color: 'var(--fog)', marginTop: 2 }}>Sent to: {orgEmail || 'your registered email'}</div>
                                            </div>
                                            {/* Toggle */}
                                            <div onClick={() => setEmailNotifications(!emailNotifications)}
                                                style={{ width: 44, height: 24, background: emailNotifications ? 'var(--ink)' : 'var(--ice)', borderRadius: 999, cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                                                <div style={{ position: 'absolute', top: 3, left: emailNotifications ? 22 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>⚡ Notification Triggers</div>
                                    {[
                                        { label: 'New lead captured', desc: 'When a new person messages your WhatsApp', active: true },
                                        { label: 'Hot lead detected', desc: 'Coming soon — when AI scores a lead as high intent', active: false },
                                        { label: 'Follow-up due', desc: 'Coming soon — when a lead needs follow-up', active: false },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < 2 ? '1px solid var(--ice)' : 'none' }}>
                                            <div>
                                                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{item.label}</div>
                                                <div style={{ fontSize: 11, color: 'var(--fog)', marginTop: 2 }}>{item.desc}</div>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: item.active ? 'var(--green)' : 'var(--mist)', color: item.active ? 'var(--ink)' : 'var(--fog)' }}>
                                                {item.active ? '● Active' : 'Soon'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <SaveButton label="Save Notification Settings" />
                            </div>
                        )}

                        {/* ── SUBSCRIPTION TAB ── */}
                        {activeTab === 'Subscription' && (
                            <div>
                                {/* Plan status */}
                                <div style={{ ...sectionStyle, background: billingStatus?.status === 'active' ? '#f0fdf4' : 'var(--yellow)', border: `1px solid ${billingStatus?.status === 'active' ? '#bbf7d0' : 'transparent'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', letterSpacing: -0.5, lineHeight: 1, marginBottom: 4 }}>
                                                {billingStatus?.status === 'active' ? '✨ PRO PLAN' : '⏳ FREE TRIAL'}
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--ash)' }}>
                                                {billingStatus?.isTrialActive
                                                    ? `${billingStatus.trialDaysRemaining} days remaining`
                                                    : billingStatus?.status === 'active'
                                                        ? 'All features unlocked'
                                                        : 'Trial has expired'}
                                            </div>
                                        </div>
                                        <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: billingStatus?.status === 'active' ? 'var(--green)' : 'var(--ink)', color: billingStatus?.status === 'active' ? 'var(--ink)' : '#fff', letterSpacing: '0.05em' }}>
                                            {billingStatus?.status === 'active' ? 'ACTIVE' : 'TRIAL'}
                                        </span>
                                    </div>
                                    {billingStatus?.status !== 'active' && (
                                        <Link href="/billing" style={{ display: 'block', textAlign: 'center', padding: 13, background: 'var(--ink)', borderRadius: 'var(--r-btn)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: -0.2 }}>
                                            Upgrade to Pro — ₹1,999/month →
                                        </Link>
                                    )}
                                </div>

                                {billingStatus?.status === 'active' && (
                                    <div style={sectionStyle}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>🔧 Manage Subscription</div>
                                        <p style={{ fontSize: 13, color: 'var(--ash)', lineHeight: 1.7 }}>
                                            To cancel or request a refund, contact us at{' '}
                                            <a href="mailto:support@ourivo.com" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
                                                support@ourivo.com
                                            </a>
                                        </p>
                                    </div>
                                )}

                                {/* Danger Zone */}
                                <div style={{ ...sectionStyle, background: '#fef2f2', border: '1px solid #fecaca', marginTop: 16 }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>⚠️ Danger Zone</div>
                                    <p style={{ fontSize: 13, color: 'var(--ash)', lineHeight: 1.7, marginBottom: 16 }}>
                                        Permanently delete your account and all data. Cannot be undone. Subscription cancelled immediately — no further charges.
                                    </p>
                                    <button onClick={() => setShowDeleteAccount(true)}
                                        style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #fecaca', borderRadius: 'var(--r-btn)', color: '#b91c1c', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-inter)', transition: 'all 0.18s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#fecaca'; }}>
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mini footer */}
                    <div style={{ borderTop: '1px solid var(--ice)', marginTop: 48, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--fog)' }}>© 2025 Ourivo</span>
                        <div style={{ display: 'flex', gap: 20 }}>
                            {[['Help', '/help'], ['Feedback', '/feedback'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
                                <Link key={href} href={href} style={{ fontSize: 12, color: 'var(--fog)', textDecoration: 'none', transition: 'color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--fog)'}>
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: var(--fog); }
                textarea::placeholder { color: var(--fog); }
                select option { background: #fff; color: var(--ink); }
            `}</style>
        </div>
    );
}