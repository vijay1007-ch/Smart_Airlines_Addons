import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Bell, CreditCard, Wallet, Calendar, Building, Landmark, ChevronRight, ShieldCheck, Award, CheckCircle, Plane, Briefcase, CalendarDays, Shield, Gift, Download, Share2, Lock } from 'lucide-react';

const imageMap = {
    'Extra Baggage': '/images/baggage_addon.png',
    'Seat Upgrade': '/images/seat_upgrade.png',
    'Lounge Access': '/images/lounge_access.png',
    'WiFi Access': '/images/wifi_addon.png',
    'In-flight Meal': '/images/inflight_meal.png',
    'Wine & Beverages': '/images/wine_beverage.png',
    'Priority Boarding': '/images/priority_boarding.png',
    'Travel Insurance': '/images/travel_insurance.png',
    'Extra Legroom': '/images/extra_legroom.png',
    'Comfort Kit': '/images/comfort_kit.png',
    'Airport Transfer': '/images/airport_transfer.png',
    'Pet in Cabin': '/images/pet_cabin.png',
};

const Payment = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentFailed, setPaymentFailed] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [summary, setSummary] = useState({});

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('airline_cart') || '[]');
        const storedSummary = JSON.parse(localStorage.getItem('airline_cart_summary') || '{}');
        setCart(storedCart);
        setSummary(storedSummary);
        
        // Group items for display
        const grouped = [];
        storedCart.forEach(item => {
            const existing = grouped.find(g => g.name === item.name);
            if (existing) {
                existing.quantity += 1;
            } else {
                grouped.push({ ...item, quantity: 1 });
            }
        });
        setCart(grouped);

        const price = storedSummary.total !== undefined ? storedSummary.total : storedCart.reduce((sum, item) => sum + item.price, 0);
        setTotalPrice(price);
    }, []);

    useEffect(() => {
        let interval;
        if (isProcessing && orderId) {
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
                    
                        const rawCart = JSON.parse(localStorage.getItem('airline_cart') || '[]');
                        const history = JSON.parse(localStorage.getItem('airline_history') || '[]');
                        const newOrder = {
                            orderId: 'ORD-' + orderId.split('-')[1],
                            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                            items: rawCart,
                            total: totalPrice
                        };
                        localStorage.setItem('airline_history', JSON.stringify([newOrder, ...history]));

                        try {
                            axios.post(`${getApiUrl()}/orders`, {
                                id: newOrder.orderId,
                                customerName: user ? user.name : "Guest",
                                items: rawCart,
                                amount: totalPrice,
                                status: "Approved"
                            });

                            const upgradeItem = rawCart.find(item => item.type === 'upgrade');
                            if (upgradeItem && upgradeItem.upgradeId) {
                                axios.put(`${getApiUrl()}/upgrades/${upgradeItem.upgradeId}/approve`);
                            }

                            const shuuPassItem = rawCart.find(item => item.name === 'Shuu Pass');
                            if (shuuPassItem && user && user.email) {
                                axios.put(`${getApiUrl()}/auth/profile`, {
                                    email: user.email,
                                    hasShuuPass: true,
                                    shuuPassDate: new Date().toISOString()
                                }).then(r => {
                                    if (r.data.user) localStorage.setItem('user', JSON.stringify(r.data.user));
                                }).catch(err => console.error(err));
                            }

                            if (user && user.email) {
                                axios.post(`${getApiUrl()}/orders/receipt`, {
                                    email: user.email,
                                    name: user.name,
                                    status: "success",
                                    items: rawCart,
                                    total: totalPrice,
                                    paymentMethod: paymentMethod
                                });
                            }
                        } catch(err) {
                            console.error("Failed to sync with server", err);
                        }

                        localStorage.removeItem('airline_cart');
                        localStorage.removeItem('airline_cart_summary');
                        try {
                            axios.delete(`${getApiUrl()}/orders/pending/${orderId}`);
                        } catch(e) {}
                    } else if (status === 'declined') {
                        clearInterval(interval);
                        setIsProcessing(false);
                        setPaymentFailed(true);

                        const rawCart = JSON.parse(localStorage.getItem('airline_cart') || '[]');
                        if (user && user.email) {
                            axios.post(`${getApiUrl()}/orders/receipt`, {
                                email: user.email,
                                name: user.name,
                                status: "failed",
                                items: rawCart,
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
    }, [isProcessing, orderId, totalPrice, navigate, paymentMethod, user]);

    const handlePayment = async (e) => {
        if (e) e.preventDefault();
        setIsProcessing(true);
        setPaymentFailed(false);

        const newOrderId = 'TXN-' + Math.floor(Math.random() * 1000000);
        setOrderId(newOrderId);

        try {
            await axios.post(`${getApiUrl()}/orders/pending`, { orderId: newOrderId, amount: totalPrice });
        } catch (err) {
            console.error("Failed to send pending payment to server", err);
        }
    };

    // Calculate details for Order Summary UI
    const baseTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const hasShuuPass = summary.total !== undefined && baseTotal > summary.total;
    const discountAmount = hasShuuPass ? baseTotal - summary.total : 0;
    
    // Total item count for cart icon
    const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const renderStepper = () => (
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px 30px', borderRadius: '12px', gap: '20px', width: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-teal)', color: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>1</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-teal)' }}>Cart</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Review items</span>
                </div>
            </div>
            
            <div style={{ width: '40px', height: '1px', borderTop: '1px dashed rgba(255,255,255,0.2)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isSuccess ? 'var(--accent-teal)' : 'var(--accent-cyan)', color: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>2</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: isSuccess ? 'var(--accent-teal)' : 'var(--accent-cyan)' }}>Payment</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Make payment</span>
                </div>
            </div>
            
            <div style={{ width: '40px', height: '1px', borderTop: '1px dashed rgba(255,255,255,0.2)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: isSuccess ? 1 : 0.5 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isSuccess ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)', color: isSuccess ? '#000' : '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>3</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: isSuccess ? 'var(--accent-cyan)' : '#fff' }}>Confirmation</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Get your ticket</span>
                </div>
            </div>
        </div>
    );

    const renderPaymentForm = () => (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Left Column: Payment Methods & Details */}
            <div style={{ flex: '1', display: 'flex', gap: '2rem' }}>
                
                {/* Payment Methods */}
                <div style={{ width: '250px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Choose Payment Method</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                            { id: 'upi', name: 'UPI', icon: Landmark, desc: 'Pay using any UPI app' },
                            { id: 'netbanking', name: 'Net Banking', icon: Building, desc: 'All major banks supported' },
                            { id: 'wallets', name: 'Wallets', icon: Wallet, desc: 'Paytm, PhonePe, Amazon Pay' },
                            { id: 'emi', name: 'EMI / Pay Later', icon: Calendar, desc: 'Easy installments' },
                        ].map(method => (
                            <div 
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                style={{ 
                                    padding: '15px', borderRadius: '12px', cursor: 'pointer',
                                    border: paymentMethod === method.id ? '1px solid var(--accent-teal)' : '1px solid rgba(255,255,255,0.05)',
                                    background: paymentMethod === method.id ? 'rgba(20, 184, 166, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                                    display: 'flex', alignItems: 'center', gap: '15px'
                                }}
                            >
                                <method.icon color={paymentMethod === method.id ? 'var(--accent-teal)' : 'var(--text-muted)'} size={24} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', color: paymentMethod === method.id ? '#fff' : 'var(--text-muted)', fontWeight: paymentMethod === method.id ? 'bold' : 'normal' }}>{method.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{method.desc}</div>
                                </div>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: paymentMethod === method.id ? '4px solid var(--accent-teal)' : '1px solid rgba(255,255,255,0.2)', background: paymentMethod === method.id ? '#fff' : 'transparent' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card Details Form */}
                <div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px' }}>
                    {paymentMethod === 'card' ? (
                        <>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Enter Card Details</h3>
                            <form onSubmit={handlePayment}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Card Number</label>
                                    <input type="text" placeholder="1234 5678 9012 3456" required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 15px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cardholder Name</label>
                                        <input type="text" placeholder="Name on card" required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 15px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expiry Date</label>
                                        <input type="text" placeholder="MM / YY" required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 15px', borderRadius: '8px', color: '#fff', outline: 'none', textAlign: 'center' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CVV</label>
                                        <input type="password" placeholder="123" required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 15px', borderRadius: '8px', color: '#fff', outline: 'none', textAlign: 'center' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-teal)' }} />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Save card securely for faster payments</span>
                                </div>

                                {paymentFailed && (
                                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                                        Payment Verification Failed or Declined. Please try again.
                                    </div>
                                )}

                                {isProcessing && (
                                    <div style={{ background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)', color: 'var(--accent-teal)', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                                        <strong>Admin Authorization Required.</strong><br/>
                                        Waiting for administrator to approve this transaction...
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={isProcessing}
                                    style={{ 
                                        width: '100%', background: isProcessing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(to right, #0d9488, #14b8a6)', 
                                        border: 'none', color: '#fff', padding: '15px', borderRadius: '8px', 
                                        fontSize: '1.1rem', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                                    }}
                                >
                                    {isProcessing ? 'Processing...' : <><Lock size={18} /> Pay Securely ₹{totalPrice.toFixed(2)}</>}
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                    Your payment information is safe and encrypted
                                </div>
                            </form>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📱</div>
                            <h3 style={{ margin: '0 0 10px 0' }}>Redirecting to {paymentMethod.toUpperCase()}</h3>
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>
                                Please complete the payment of <strong>₹{totalPrice.toFixed(2)}</strong> on your device.
                            </p>
                            <button 
                                onClick={handlePayment}
                                disabled={isProcessing}
                                style={{ background: 'var(--accent-teal)', border: 'none', color: '#000', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                {isProcessing ? 'Waiting for admin approval...' : 'Simulate Payment Success'}
                            </button>
                            
                            {isProcessing && (
                                <p style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', marginTop: '20px', textAlign: 'center' }}>
                                    A request has been sent to the Admin Dashboard. Please accept it there.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div style={{ width: '350px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.1rem', margin: '0 0 20px 0' }}>Order Summary</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                        {cart.map((item, idx) => {
                            const rawName = item.name.split('(')[0].trim();
                            const bgImage = imageMap[rawName] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400';
                            return (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '6px', overflow: 'hidden' }}>
                                            <img src={bgImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem' }}>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>₹{item.price * item.quantity}</div>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span>Subtotal</span>
                        <span>₹{baseTotal.toFixed(2)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--accent-teal)', fontSize: '0.85rem' }}>
                            <span>Shuu Pass Savings ⓘ</span>
                            <span>-₹{discountAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <div style={{ 
                        background: 'url("https://images.unsplash.com/photo-1531366936337-7c912a458b68?auto=format&fit=crop&q=80&w=400") center/cover',
                        borderRadius: '12px', padding: '15px', position: 'relative', overflow: 'hidden', marginTop: '10px'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(15,23,42,0.9), rgba(20,184,166,0.3))' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>Total Amount</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '5px' }}>₹{totalPrice.toFixed(2)}</div>
                            <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Inclusive of all taxes</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderConfirmation = () => {
        const d = new Date();
        d.setDate(d.getDate() + 14); // 2 weeks from now
        const flightDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        return (
            <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', border: '2px solid var(--accent-teal)', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(20, 184, 166, 0.3)' }}>
                        <CheckCircle color="var(--accent-teal)" size={40} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Booking Confirmed!</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your booking was successful. We hope you have a pleasant journey. <Plane size={18} style={{ verticalAlign: 'middle', color: 'var(--accent-cyan)' }} /></p>
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        {/* Main Ticket */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '30px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #0d9488, #14b8a6, #3b82f6)' }} />
                            
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Smart Airlines</div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div>
                                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>HYD</div>
                                    <div style={{ color: 'var(--text-muted)' }}>Hyderabad</div>
                                </div>
                                <Plane size={32} color="var(--accent-teal)" />
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>DEL</div>
                                    <div style={{ color: 'var(--text-muted)' }}>Delhi</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Date</div>
                                    <div style={{ fontWeight: 'bold' }}>📅 {flightDate}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Flight</div>
                                    <div style={{ fontWeight: 'bold' }}>✈ SA 1023</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Seat</div>
                                    <div style={{ fontWeight: 'bold' }}>💺 12A</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Booking ID</div>
                                    <div style={{ fontWeight: 'bold' }}>🎫 ORD-{orderId?.split('-')[1] || '9726347'}</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                A confirmation email has been sent to<br/>
                                <span style={{ color: 'var(--accent-teal)' }}>{user ? user.email : 'guest@example.com'}</span>
                            </div>
                        </div>

                        {/* Action Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '2rem' }}>
                            {[
                                { title: 'Add More Comfort', desc: 'Explore add-ons to enhance your journey.', btn: 'Browse Add-ons', icon: Briefcase, color: '#a855f7', link: '/catalogue' },
                                { title: 'Manage Booking', desc: 'View or modify your upcoming trip.', btn: 'Manage Trips', icon: CalendarDays, color: '#3b82f6', link: '/history' },
                                { title: 'Travel Insurance', desc: 'Stay protected with our comprehensive plans.', btn: 'Explore Insurance', icon: Shield, color: '#10b981', link: '/catalogue' },
                                { title: 'Earn SkyPoints', desc: 'You earned 120 SkyPoints for this booking!', btn: 'View SkyPoints', icon: Gift, color: '#f43f5e', link: '/skypoints' },
                            ].map((card, i) => (
                                <div key={i} style={{ background: 'rgba(15, 23, 42, 0.4)', border: `1px solid rgba(255,255,255,0.05)`, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', background: `rgba(255,255,255,0.05)`, borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
                                        <card.icon color={card.color} size={24} />
                                    </div>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>{card.title}</h4>
                                    <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>{card.desc}</p>
                                    <button onClick={() => navigate(card.link)} style={{ background: 'transparent', border: `1px solid ${card.color}`, color: card.color, padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', width: '100%' }}>{card.btn}</button>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <h3 style={{ color: '#fff', marginBottom: '5px' }}>Thank you for choosing Smart Airlines.</h3>
                            <p style={{ color: 'var(--accent-teal)' }}>We look forward to flying with you again! ♥</p>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div style={{ width: '320px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Booking Summary</h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>👤 Passenger</div>
                            <div style={{ fontWeight: 'bold' }}>{user ? user.name : 'Guest User'}</div>
                        </div>

                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '15px 0' }} />

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>✈ Journey</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>HYD</span>
                                <span style={{ color: 'var(--text-muted)' }}>→</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>DEL</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>
                                <span>Hyderabad</span>
                                <span>Delhi</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{flightDate} • 08:45 AM</div>
                        </div>

                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '15px 0' }} />

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#a855f7', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>📋 Flight Details</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Flight Number</span>
                                <span>SA 1023</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Gate</span>
                                <span>B12</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Boarding Time</span>
                                <span>08:45 AM</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Seat</span>
                                <span>12A</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '15px 0' }} />

                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>💳 Payment</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Paid</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-teal)' }}>₹{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <button style={{ width: '100%', background: 'var(--accent-teal)', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> Download Boarding Pass
                        </button>
                        
                        <button style={{ width: '100%', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <Share2 size={16} /> Share Booking
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#fff' }}>
            <UserSidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 50%), radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 50%)' }}>
                
                {/* Top Navigation / Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    {!isSuccess && (
                        <div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>Secure Payment</h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Choose your preferred payment method and complete your booking.</p>
                        </div>
                    )}
                    {isSuccess && <div></div> /* Empty div to push right elements */}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {!isSuccess && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', 
                                background: 'rgba(255,255,255,0.05)', 
                                padding: '8px 15px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <ShoppingCart size={18} color="var(--accent-cyan)" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>My Cart</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{totalPrice.toFixed(2)}</div>
                                </div>
                                <div style={{ background: 'var(--accent-teal)', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    {totalItemCount}
                                </div>
                            </div>
                        )}
                        {isSuccess && (
                            <button onClick={() => navigate('/history')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={16} /> View My Trips
                            </button>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Bell size={20} color="var(--text-muted)" />
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                        </div>
                        
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>

                {/* Central Content */}
                {isSuccess ? (
                    renderConfirmation()
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                            {renderStepper()}
                        </div>
                        {renderPaymentForm()}
                        
                        {/* Trust Badges */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                                <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                    <ShieldCheck color="var(--accent-teal)" size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>Secure Payments</h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>100% safe & encrypted transactions.</p>
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                                <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                    <Award color="var(--accent-teal)" size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>Best Price Guarantee</h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get the best prices for all add-ons.</p>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}></div>
                            <div style={{ flex: 1 }}></div>
                        </div>
                    </>
                )}
                
            </div>
        </div>
    );
};

export default Payment;
