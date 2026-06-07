'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0F1115',
            padding: '24px',
        }}>
            <SignUp
                routing="hash"
                appearance={{
                    variables: {
                        colorPrimary: '#4F8CFF',
                        colorBackground: '#161A22',
                        colorText: '#F5F7FA',
                        colorTextSecondary: '#9AA4B2',
                        colorInputBackground: '#1C2130',
                        colorInputText: '#F5F7FA',
                        colorDanger: '#f87171',
                        colorSuccess: '#34d399',
                        borderRadius: '10px',
                        fontFamily: 'Inter, sans-serif',
                    },
                    elements: {
                        card: {
                            backgroundColor: '#161A22',
                            border: '1px solid #2A3142',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                        },
                        headerTitle: { color: '#F5F7FA' },
                        headerSubtitle: { color: '#9AA4B2' },
                        formButtonPrimary: {
                            backgroundColor: '#4F8CFF',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                        },
                        footerActionLink: { color: '#4F8CFF' },
                    },
                }}
            />
        </div>
    );
}