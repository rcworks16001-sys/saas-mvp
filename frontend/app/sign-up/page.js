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
                        colorTextSecondary: '#C5CDD8',
                        colorInputBackground: '#1C2130',
                        colorInputText: '#F5F7FA',
                        colorDanger: '#f87171',
                        colorSuccess: '#34d399',
                        borderRadius: '10px',
                        fontFamily: 'Inter, sans-serif',
                        colorWarning: '#F59E0B',
                    },
                    elements: {
                        card: {
                            backgroundColor: '#161A22',
                            border: '1px solid #2A3142',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                            formFieldWarningText: { color: '#FFA500' },
                            formFieldHintText: { color: '#C5CDD8' },
                            identityPreviewText: { color: '#C5CDD8' },
                        },
                        headerTitle: { color: '#F5F7FA' },
                        headerSubtitle: { color: '#C5CDD8' },
                        formFieldLabel: { color: '#E0E4EA' },
                        formButtonPrimary: {
                            backgroundColor: '#4F8CFF',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                        },
                        footerActionLink: { color: '#4F8CFF' },
                        footerActionText: { color: '#C5CDD8' },
                        otpCodeFieldInput: {
                            backgroundColor: '#2A3142',
                            color: '#F5F7FA',
                            border: '1.5px solid #4F8CFF',
                        },
                    },
                }}
            />
        </div>
    );
}