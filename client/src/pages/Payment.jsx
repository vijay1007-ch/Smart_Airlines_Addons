import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentFailed, setPaymentFailed] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Retrieve total price from cart summary or fallback to cart total
    const cart = JSON.parse(localStorage.getItem('airline_cart') || '[]');
    const summary = JSON.parse(localStorage.getItem('airline_cart_summary') || '{}');
    const totalPrice = summary.total !== undefined ? summary.total : cart.reduce((sum, item) => sum + item.price, 0);

    useEffect(() => {
        let interval;
        if (isProcessing && orderId) {
            // Poll the backend API every 1.5 seconds to check if Admin accepted the payment
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${getApiUrl()}/orders/pending/${orderId}/status`);
                    if (res.status !== 200) return;
                    const data = res.data;
                    const status = data.status;
                    
                    if (status === 'approved') {
                        clearInterval(interval);
                        setIsProcessing(false);
                        setIsSuccess(true);
                    
                    // Save to history
                    const history = JSON.parse(localStorage.getItem('airline_history') || '[]');
                    const newOrder = {
                        orderId: 'ORD-' + orderId.split('-')[1], // Use the generated ID
                        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                        items: cart,
                        total: totalPrice
                    };
                    localStorage.setItem('airline_history', JSON.stringify([newOrder, ...history]));

                    // Sync with backend so Admin can see it
                    try {
                        const user = JSON.parse(localStorage.getItem('user'));
                        axios.post(`${getApiUrl()}/orders`, {
                            id: newOrder.orderId,
                            customerName: user ? user.name : "Guest",
                            items: cart,
                            amount: totalPrice,
                            status: "Approved"
                        });

                        // Check if any cart item is a seat upgrade, and approve it
                        const upgradeItem = cart.find(item => item.type === 'upgrade');
                        if (upgradeItem && upgradeItem.upgradeId) {
                            axios.put(`${getApiUrl()}/upgrades/${upgradeItem.upgradeId}/approve`);
                        }

                        // Check if they bought a Shuu Pass
                        const shuuPassItem = cart.find(item => item.name === 'Shuu Pass');
                        if (shuuPassItem && user && user.email) {
                            axios.put(`${getApiUrl()}/auth/profile`, {
                                email: user.email,
                                hasShuuPass: true,
                                shuuPassDate: new Date().toISOString()
                            }).then(r => {
                                if (r.data.user) localStorage.setItem('user', JSON.stringify(r.data.user));
                            }).catch(err => console.error(err));
                        }

                        // Increment special coupon usage if applied
                        if (summary.appliedCoupon && summary.appliedCoupon.toUpperCase().replace(/\s/g, '') === 'ANSHUANNAYYA') {
                            const usageKey = 'usage_anshu_annayya_' + (user?.email || 'guest');
                            const currentUsage = parseInt(localStorage.getItem(usageKey) || '0', 10);
                            localStorage.setItem(usageKey, currentUsage + 1);
                        }

                        // Send Receipt Email
                        if (user && user.email) {
                            axios.post(`${getApiUrl()}/orders/receipt`, {
                                email: user.email,
                                name: user.name,
                                status: "success",
                                items: cart,
                                total: totalPrice,
                                paymentMethod: paymentMethod
                            });
                        }
                    } catch(err) {
                        console.error("Failed to sync with server", err);
                    }

                    // Clear cart and backend pending queue
                    localStorage.removeItem('airline_cart');
                    localStorage.removeItem('airline_cart_summary');
                    try {
                        axios.delete(`${getApiUrl()}/orders/pending/${orderId}`);
                    } catch(e) {}

                    setTimeout(() => navigate('/history'), 3000);
                } else if (status === 'declined') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    setPaymentFailed(true);

                    // Send Failed Receipt Email
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user && user.email) {
                        axios.post(`${getApiUrl()}/orders/receipt`, {
                            email: user.email,
                            name: user.name,
                            status: "failed",
                            items: cart,
                            total: totalPrice,
                            paymentMethod: paymentMethod,
                            reason: "Declined by administrator."
                        }).catch(err => console.error(err));
                    }

                    try {
                        axios.delete(`${getApiUrl()}/orders/pending/${orderId}`);
                    } catch(e) {}
                }
            } catch (err) {
                console.error("Failed to poll payment status", err);
            }
        }, 1500);
        }
        return () => clearInterval(interval);
    }, [isProcessing, orderId, cart, totalPrice, navigate]);

    const handlePayment = async (e) => {
        if (e) e.preventDefault();
        setIsProcessing(true);
        setPaymentFailed(false);

        // Generate a unique order ID for this transaction session
        const newOrderId = 'TXN-' + Math.floor(Math.random() * 1000000);
        setOrderId(newOrderId);

        // Send pending payment request to backend so it works across different browsers/devices
        try {
            await axios.post(`${getApiUrl()}/orders/pending`, { orderId: newOrderId, amount: totalPrice });
        } catch (err) {
            console.error("Failed to send pending payment to server", err);
        }
    };

    const renderPaymentMethodSelection = () => (
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Select Payment Method</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
                Amount to Pay: <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{totalPrice}</span>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <button 
                    onClick={() => setPaymentMethod('card')}
                    style={{ gridColumn: 'span 2', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)', boxShadow: 'none', padding: '15px' }}
                >
                    💳 Credit / Debit Card
                </button>
                <button 
                    onClick={() => setPaymentMethod('PhonePe')}
                    style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)', boxShadow: 'none', padding: '15px' }}
                >
                    📱 PhonePe
                </button>
                <button 
                    onClick={() => setPaymentMethod('Google Pay')}
                    style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)', boxShadow: 'none', padding: '15px' }}
                >
                    🇬 Google Pay
                </button>
                <button 
                    onClick={() => setPaymentMethod('FamPay')}
                    style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)', boxShadow: 'none', padding: '15px' }}
                >
                    🔥 FamPay
                </button>
                <button 
                    onClick={() => setPaymentMethod('Other UPI')}
                    style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)', boxShadow: 'none', padding: '15px' }}
                >
                    🏦 Other UPI
                </button>
            </div>
            
            <button 
                onClick={() => navigate('/cart')} 
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: '25px', boxShadow: 'none' }}
            >
                ← Return to Cart
            </button>
        </div>
    );

    const renderCardForm = () => (
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2 style={{ margin: 0 }}>Secure Checkout</h2>
                <button 
                    onClick={() => { setPaymentMethod(null); setPaymentFailed(false); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', padding: 0, boxShadow: 'none', width: 'auto' }}
                >
                    Change Method
                </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Paying by Credit/Debit Card</p>

            <form onSubmit={handlePayment}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name on Card</label>
                    <input type="text" placeholder="John Doe" required style={{ margin: 0 }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Card Number</label>
                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" required maxLength="19" style={{ margin: 0 }} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Expiry</label>
                        <input type="text" placeholder="MM/YY" required maxLength="5" style={{ margin: 0 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>CVC</label>
                        <input type="password" placeholder="XXX" required maxLength="3" style={{ margin: 0 }} />
                    </div>
                </div>

                {paymentFailed && (
                    <div style={{ background: 'rgba(255, 65, 108, 0.2)', border: '1px solid #ff416c', color: 'white', padding: '10px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
                        ❌ Payment Verification Failed or Declined.
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isProcessing || totalPrice === 0}
                    style={{ 
                        width: '100%', 
                        background: isProcessing ? 'var(--border-light)' : 'var(--gradient-primary)',
                        color: '#ffffff',
                        opacity: totalPrice === 0 ? 0.5 : 1
                    }}
                >
                    {isProcessing ? 'Verifying...' : `Pay ₹${totalPrice}`}
                </button>
            </form>
        </div>
    );

    const renderQuickPay = (provider) => {
        const upiURI = `upi://pay?pa=9866606967@hdfc&pn=Smart%20Airline&am=${totalPrice}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiURI)}`;

        return (
            <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '10px' }}>Pay with {provider}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
                    Scan this QR Code using your <strong>{provider}</strong> app to pay <strong style={{color: 'var(--accent-cyan)', fontSize: '1.2rem'}}>₹{totalPrice}</strong>.
                </p>
                
                <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '30px' }}>
                    <img src={qrUrl} alt="UPI QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                </div>

                {paymentFailed && (
                    <div style={{ background: 'rgba(255, 65, 108, 0.2)', border: '1px solid #ff416c', color: 'white', padding: '10px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
                        ❌ Payment Verification Failed or Declined.
                    </div>
                )}
                
                <button 
                    onClick={() => handlePayment()} 
                    disabled={isProcessing || totalPrice === 0}
                    style={{ 
                        width: '100%', 
                        background: isProcessing ? 'var(--border-light)' : 'var(--gradient-primary)',
                        color: '#ffffff',
                        marginBottom: '20px'
                    }}
                >
                    {isProcessing ? 'Waiting for approval...' : `I have paid ₹${totalPrice}`}
                </button>
                
                <button 
                    onClick={() => { setPaymentMethod(null); setPaymentFailed(false); }} 
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', boxShadow: 'none' }}
                >
                    Change Method
                </button>
            </div>
        );
    };

    const renderSmsSimulation = () => (
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', textAlign: 'center', border: '2px solid #2ed573' }}>
            <h2 style={{ marginBottom: '10px', color: '#2ed573' }}>📲 Request Sent to Admin!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                A secure approval request has been sent to the Administrator.
            </p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '25px', textAlign: 'left' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#aaa' }}>Admin Instruction:</p>
                <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--accent-cyan)' }}>
                    "Please navigate to your Admin Dashboard. You will see a new Live Payment Authorization for ₹{totalPrice}. Click 'Accept' to process this payment."
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ margin: 0, color: 'var(--accent-cyan)' }}>Waiting for the Admin to approve...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <UserSidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                
                {isSuccess ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '500px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h1 style={{ color: 'var(--accent-cyan)' }}>Payment Successful!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Thank you for your purchase. Your add-ons have been confirmed for your flight.</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '20px' }}>Redirecting to your history...</p>
                    </div>
                ) : isProcessing ? (
                    renderSmsSimulation()
                ) : !paymentMethod ? (
                    renderPaymentMethodSelection()
                ) : paymentMethod === 'card' ? (
                    renderCardForm()
                ) : (
                    renderQuickPay(paymentMethod)
                )}
            </div>
        </div>
    );
};

export default Payment;
