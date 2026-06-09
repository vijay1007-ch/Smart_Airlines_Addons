import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [cartItems, setCartItems] = useState([]);
    const [flightSelection, setFlightSelection] = useState('upcoming');
    const [couponInput, setCouponInput] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    
    useEffect(() => {
        const saved = localStorage.getItem('airline_cart');
        if (saved) {
            setCartItems(JSON.parse(saved));
        }
    }, []);

    const handleRemove = (id) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('airline_cart', JSON.stringify(updatedCart));
    };

    const handleClearCart = () => {
        setCartItems([]);
        localStorage.removeItem('airline_cart');
        localStorage.removeItem('airline_cart_summary');
    };

    const baseTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const shuuPassPrice = cartItems.find(item => item.name === 'Shuu Pass')?.price || 0;
    
    // Check if user has active Shuu pass from profile
    let hasActiveShuuPass = false;
    if (user && user.hasShuuPass) {
        if (user.shuuPassDate) {
            const passDate = new Date(user.shuuPassDate);
            const oneYearLater = new Date(passDate.setFullYear(passDate.getFullYear() + 1));
            if (new Date() <= oneYearLater) {
                hasActiveShuuPass = true;
            }
        } else {
            // Fallback if date wasn't saved properly
            hasActiveShuuPass = true;
        }
    }
    const history = JSON.parse(localStorage.getItem('airline_history') || '[]');
    const hasHistoryShuuPass = history.some(order => order.items.some(i => i.name === 'Shuu Pass'));
    const isShuuPassActive = hasActiveShuuPass || hasHistoryShuuPass || cartItems.some(item => item.name === 'Shuu Pass');

    const discountableAmount = baseTotal;
    
    let shuuDiscountPercent = 0;
    if (isShuuPassActive) {
        shuuDiscountPercent = 22;
    }

    const shuuDiscountAmount = (discountableAmount * shuuDiscountPercent) / 100;
    const extraCouponDiscountAmount = ((discountableAmount - shuuDiscountAmount) * couponDiscount) / 100;
    const totalDiscount = shuuDiscountAmount + extraCouponDiscountAmount;
    const finalPrice = Math.round(baseTotal - totalDiscount);

    const handleApplyCoupon = () => {
        if (!couponInput) {
            setCouponDiscount(0);
            setCouponError('');
            return;
        }
        
        const normalizedInput = couponInput.toUpperCase().replace(/\s/g, '');

        if (normalizedInput === 'ANSHUANNAYYA') {
            const usageKey = 'usage_anshu_annayya_' + (user?.email || 'guest');
            const currentUsage = parseInt(localStorage.getItem(usageKey) || '0', 10);
            if (currentUsage >= 10) {
                setCouponDiscount(0);
                setCouponError('This coupon has reached its maximum usage limit (10).');
            } else {
                setCouponDiscount(99.99);
                setCouponError(`Valid for ${10 - currentUsage} more uses!`);
            }
        } else if (normalizedInput === 'WELCOME10') {
            setCouponDiscount(10);
            setCouponError('');
        } else if (normalizedInput === 'FLY20') {
            setCouponDiscount(20);
            setCouponError('');
        } else {
            setCouponDiscount(0);
            setCouponError('Invalid coupon code');
        }
    };

    const handleCheckout = () => {
        localStorage.setItem('airline_cart_summary', JSON.stringify({ 
            total: finalPrice,
            appliedCoupon: couponDiscount > 0 ? couponInput : null
        }));
        navigate('/payment');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <UserSidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="title" style={{ textAlign: 'center' }}>Your Cart</h1>
                
                {cartItems.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <h2 style={{ color: 'var(--text-muted)' }}>Your cart is empty</h2>
                        <p>Browse the catalogue to add premium services to your journey.</p>
                        <button onClick={() => navigate('/catalogue')} style={{ marginTop: '20px', width: 'auto', padding: '10px 30px' }}>
                            Go to Catalogue
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {cartItems.map((item, index) => (
                                <div key={item.id} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '20px',
                                    borderBottom: index < cartItems.length - 1 ? '1px solid var(--border-light)' : 'none',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.details}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <h3 style={{ margin: 0, color: 'var(--accent-cyan)' }}>₹{item.price}</h3>
                                        <button 
                                            onClick={() => handleRemove(item.id)}
                                            style={{ 
                                                background: 'rgba(255, 65, 108, 0.1)', 
                                                border: '1px solid rgba(255, 65, 108, 0.3)',
                                                color: '#ff416c',
                                                padding: '8px 15px',
                                                boxShadow: 'none',
                                                width: 'auto'
                                            }}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Flight Selection */}
                        <div className="card" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Select Flight</h3>
                                <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select the flight for these addons.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select 
                                    value={flightSelection}
                                    onChange={(e) => setFlightSelection(e.target.value)}
                                    style={{ 
                                        padding: '10px 15px', 
                                        background: 'var(--bg-main)', 
                                        color: 'var(--text-main)', 
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <option value="upcoming">Upcoming Flight (AI-202)</option>
                                    <option value="ongoing">Ongoing Flight (AI-105)</option>
                                </select>
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="card" style={{ marginTop: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>Apply Coupon</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    placeholder="Enter coupon code (e.g. WELCOME10)" 
                                    style={{ flex: 1, margin: 0, padding: '12px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)',  borderRadius: '8px' }}
                                />
                                <button onClick={handleApplyCoupon} style={{ width: 'auto', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>Apply</button>
                            </div>
                            {couponError && <p style={{ color: '#ff416c', margin: '10px 0 0 0', fontSize: '0.9rem' }}>{couponError}</p>}
                            {couponDiscount > 0 && <p style={{ color: '#2ed573', margin: '10px 0 0 0', fontSize: '0.9rem' }}>Coupon applied: {couponDiscount}% off!</p>}
                        </div>

                        <div className="card" style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                                <span>Subtotal</span>
                                <span>₹{baseTotal}</span>
                            </div>
                            
                            {isShuuPassActive && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#0077ff' }}>
                                    <span>Shuu Pass Discount ({shuuDiscountPercent}%)</span>
                                    <span>-₹{Math.round(shuuDiscountAmount)}</span>
                                </div>
                            )}

                            {couponDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#2ed573' }}>
                                    <span>Coupon Discount ({couponDiscount}%)</span>
                                    <span>-₹{Math.round(extraCouponDiscountAmount)}</span>
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid var(--border-light)', margin: '15px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>Total Amount</h2>
                                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Including all taxes and fees.</p>
                                </div>
                                <h1 className="title" style={{ margin: 0, fontSize: '2.5rem' }}>₹{finalPrice}</h1>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                            <button 
                                onClick={handleClearCart}
                                style={{ 
                                    background: 'var(--bg-main)', 
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-light)', 
                                    boxShadow: 'none',
                                    flex: 1
                                }}>
                                Clear Cart
                            </button>
                            <button 
                                onClick={handleCheckout}
                                style={{ flex: 2, background: 'var(--gradient-primary)', color: '#ffffff', border: 'none' }}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
