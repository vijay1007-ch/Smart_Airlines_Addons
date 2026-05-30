import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ApprovePayment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending'); // pending, approved, declined
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        // Read the pending payment details from localStorage
        const pendingPayment = JSON.parse(localStorage.getItem(`pending_payment_${orderId}`));
        if (pendingPayment) {
            setAmount(pendingPayment.amount);
        } else {
            setStatus('invalid');
        }
    }, [orderId]);

    const handleAccept = () => {
        setStatus('approved');
        localStorage.setItem(`payment_status_${orderId}`, 'approved');
        setTimeout(() => window.close(), 2000); // Attempt to close the tab after approval
    };

    const handleDecline = () => {
        setStatus('declined');
        localStorage.setItem(`payment_status_${orderId}`, 'declined');
        setTimeout(() => window.close(), 2000);
    };

    if (status === 'invalid') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)', color: 'white' }}>
                <h2>❌ Invalid or Expired Payment Link</h2>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)', color: 'white', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
                <h2 style={{ marginBottom: '10px' }}>Authorize Payment</h2>
                
                {status === 'pending' ? (
                    <>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                            You are requesting to pay <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{amount}</span> for Smart Airline Add-ons.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <button 
                                onClick={handleAccept}
                                style={{ background: 'linear-gradient(90deg, #2ed573, #2ecc71)', width: '100%' }}
                            >
                                ✅ Accept & Pay
                            </button>
                            <button 
                                onClick={handleDecline}
                                style={{ background: 'rgba(255, 65, 108, 0.1)', border: '1px solid #ff416c', color: '#ff416c', width: '100%', boxShadow: 'none' }}
                            >
                                ❌ Decline
                            </button>
                        </div>
                    </>
                ) : status === 'approved' ? (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ color: '#2ed573' }}>Payment Approved!</h2>
                        <p style={{ color: 'var(--text-muted)' }}>You can close this window and return to your main screen.</p>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
                        <h2 style={{ color: '#ff416c' }}>Payment Declined</h2>
                        <p style={{ color: 'var(--text-muted)' }}>You have declined this transaction. You can close this window.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ApprovePayment;
