import React, { useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, ArrowRight, PlaneTakeoff, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${getApiUrl()}/auth/forgot-password`, {
                email,
                clientOrigin: window.location.origin
            });

            if (response.status === 200 || response.status === 201) {
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                alert(error.response.data.message || "Something went wrong.");
            } else {
                alert("Failed to connect to the server.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-page">
            <Navbar />
            <div className="forgot-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'rgba(53, 215, 211, 0.12)', border: '1px solid rgba(53, 215, 211, 0.24)',
                        marginBottom: '1rem'
                    }}>
                        <PlaneTakeoff size={28} color="#35d7d3" />
                    </div>
                    <h2>Reset Password</h2>
                    <p>
                        {!isSubmitted
                            ? "Enter your email address and we'll send you a link to reset your password."
                            : "Email sent successfully!"}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="forgot-btn"
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                ) : (
                    <div className="success-box">
                        <CheckCircle2 size={56} color="#35d7d3" style={{ margin: '0 auto 1rem auto' }} />
                        <p>
                            We've sent a real password reset link to <strong>{email}</strong>. Please check your personal inbox!
                        </p>
                    </div>
                )}

                <div className="bottom-link">
                    Remember your password?{" "}
                    <span onClick={() => navigate('/login')}>
                        Log in
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
