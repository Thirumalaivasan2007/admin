import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

const AdminLogin = ({ onLoginSuccess }) => {
    const [step, setStep] = useState('login'); // login, otp
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5001/api'
        : 'https://zylron-agent-ai.onrender.com/api';

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            
            if (response.data && response.data.requires2FA) {
                // Trigger OTP
                await axios.post(`${API_BASE_URL}/auth/send-otp`, { email, type: 'login' });
                setStep('otp');
            } else if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const verifyRes = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp });
            
            if (verifyRes.data && verifyRes.data.success) {
                const finalRes = await axios.post(`${API_BASE_URL}/auth/login-verify`, { email });
                if (finalRes.data && finalRes.data.token) {
                    localStorage.setItem('user', JSON.stringify(finalRes.data));
                    onLoginSuccess();
                }
            } else {
                setError('Invalid security code.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--bg-main)',
            fontFamily: "'Outfit', sans-serif"
        }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                        borderRadius: '15px',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                    }}>
                        <ShieldCheck color="#fff" size={32} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Admin <span className="cyan-glow">Portal</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>{step === 'login' ? 'Neural Command Center Access' : 'Security Identity Verification'}</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}

                {step === 'login' ? (
                    <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="email" 
                                placeholder="Admin Email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 12px 12px 40px', color: '#fff', fontSize: '15px' }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="password" 
                                placeholder="Master Password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 12px 12px 40px', color: '#fff', fontSize: '15px' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ 
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '12px', 
                                padding: '14px', 
                                fontWeight: '600', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                marginTop: '10px'
                            }}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Authorize Session <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="text" 
                                placeholder="6-Digit Security Code" 
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 12px 12px 40px', color: '#fff', fontSize: '15px', letterSpacing: '4px', textAlign: 'center' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ 
                                background: 'linear-gradient(90deg, var(--secondary), var(--primary))', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '12px', 
                                padding: '14px', 
                                fontWeight: '600', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                marginTop: '10px'
                            }}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Verify Identity <ArrowRight size={20} /></>
                            )}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setStep('login')}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '30px' }}>
                    ZYLRON NEURAL LINK • END-TO-END ENCRYPTED
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
