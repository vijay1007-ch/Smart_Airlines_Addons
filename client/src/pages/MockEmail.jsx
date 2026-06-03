import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MailOpen, ShieldCheck, ArrowRight } from 'lucide-react';

const MockEmail = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f4f7f6',
            padding: '2rem',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                background: '#ffffff',
                maxWidth: '600px',
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }}>
                {/* Email Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0052cc, #00e5ff)',
                    padding: '2rem',
                    textAlign: 'center' }}>
                    <MailOpen size={48} style={{ marginBottom: '1rem', opacity: 0.9 }} />
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>Smart Airline Support</h1>
                    <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Password Reset Request</p>
                </div>

                {/* Email Body */}
                <div style={{ padding: '3rem 2.5rem' }}>
                    <p style={{ fontSize: '1.1rem', color: '#333', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        Hello there,
                    </p>
                    <p style={{ fontSize: '1.05rem', color: '#555', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                        We received a request to reset the password for your Smart Airline account. You can reset your password by clicking the secure button below:
                    </p>

                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <button 
                            onClick={() => navigate('/reset-password')}
                            style={{
                                background: '#0052cc',
                                
                                padding: '1rem 2.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(0, 82, 204, 0.3)'
                            }}
                        >
                            Reset My Password <ArrowRight size={20} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <ShieldCheck size={24} color="#0052cc" />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                            If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
                        </p>
                    </div>
                </div>

                {/* Email Footer */}
                <div style={{
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                        © 2026 Smart Airline Platform. All rights reserved. <br/>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MockEmail;
