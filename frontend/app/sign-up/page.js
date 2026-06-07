'use client';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F5F7FA',
            padding: '24px',
        }}>
            <SignUp routing="hash" appearance={{
                variables: {
                    colorPrimary: '#0F1115',
                    colorBackground: '#FFFFFF',
                    colorText: '#0F1115',
                    colorTextSecondary: '#555C6A',
                    colorInputBackground: '#FFFFFF',
                    colorInputText: '#0F1115',
                    colorDanger: '#ef4444',
                    colorWarning: '#d97706',
                    borderRadius: '32px',
                    fontFamily: 'Inter, sans-serif',
                },
                elements: {
                    card: {
                        backgroundColor: '#FFFFFF',
                        borderRadius: '32px',
                        boxShadow: 'none',
                        border: '1.5px solid #E5E7EB',
                    },
                    headerTitle: {
                        color: '#0F1115',
                        fontFamily: '"Bebas Neue", sans-serif',
                        fontSize: '28px',
                        letterSpacing: '0.04em',
                    },
                    headerSubtitle: { color: '#555C6A' },
                    formFieldLabel: { color: '#0F1115', fontWeight: '500' },
                    formButtonPrimary: {
                        backgroundColor: '#0F1115',
                        color: '#FFFFFF',
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                    },
                    footerActionLink: { color: '#0F1115', fontWeight: '700', textDecoration: 'underline' },
                    footerActionText: { color: '#555C6A' },
                    formFieldWarningText: { color: '#d97706' },
                    formFieldHintText: { color: '#555C6A' },
                    identityPreviewText: { color: '#555C6A' },
                    otpCodeFieldInput: {
                        backgroundColor: '#F5F7FA',
                        color: '#0F1115',
                        border: '1.5px solid #0F1115',
                    },
                },
            }} />
        </div>
    );
}