import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Bell, Crown, ShieldCheck, Award, Trash2, Minus, Plus, CreditCard, Lock } from 'lucide-react';

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

const Cart = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [cartItems, setCartItems] = useState([]);
    const [couponInput, setCouponInput] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    
    useEffect(() => {
        const saved = localStorage.getItem('airline_cart');
        if (saved) {
            // Group items by name
            const items = JSON.parse(saved);
            const grouped = [];
            items.forEach(item => {
                const existing = grouped.find(g => g.name === item.name);
                if (existing) {
                    existing.quantity += 1;
                    existing.ids.push(item.id);
                } else {
                    grouped.push({ ...item, quantity: 1, ids: [item.id] });
                }
            });
            setCartItems(grouped);
        }
    }, []);

    const saveCartToStorage = (updatedGrouped) => {
        // Expand grouped back to individual items for localstorage to maintain compatibility
        const expanded = [];
        updatedGrouped.forEach(group => {
            for(let i=0; i<group.quantity; i++) {
                expanded.push({
                    id: group.ids[i] || Date.now() + i,
                    name: group.name,
                    price: group.price,
                    details: group.details
                });
            }
        });
        localStorage.setItem('airline_cart', JSON.stringify(expanded));
    };

    const handleUpdateQuantity = (name, delta) => {
        const updated = cartItems.map(item => {
            if (item.name === name) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updated);
        saveCartToStorage(updated);
    };

    const handleRemove = (name) => {
        const updated = cartItems.filter(item => item.name !== name);
        setCartItems(updated);
        saveCartToStorage(updated);
    };

    const baseTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Check if user has active Shuu pass
    let hasActiveShuuPass = false;
    if (user && user.hasShuuPass) {
        if (user.shuuPassDate) {
            const passDate = new Date(user.shuuPassDate);
            const oneYearLater = new Date(passDate.setFullYear(passDate.getFullYear() + 1));
            if (new Date() <= oneYearLater) {
                hasActiveShuuPass = true;
            }
        } else {
            hasActiveShuuPass = true;
        }
    }
    const history = JSON.parse(localStorage.getItem('airline_history') || '[]');
    const hasHistoryShuuPass = history.some(order => order.items && order.items.some(i => i.name === 'Shuu Pass'));
    const isShuuPassActive = hasActiveShuuPass || hasHistoryShuuPass || cartItems.some(item => item.name === 'Shuu Pass');

    const discountableAmount = baseTotal;
    
    let shuuDiscountPercent = 0;
    if (isShuuPassActive) {
        shuuDiscountPercent = 20; // Using 20% to match mockup
    }

    const shuuDiscountAmount = (discountableAmount * shuuDiscountPercent) / 100;
    const extraCouponDiscountAmount = ((discountableAmount - shuuDiscountAmount) * couponDiscount) / 100;
    const totalDiscount = shuuDiscountAmount + extraCouponDiscountAmount;
    const finalPrice = baseTotal - totalDiscount;

    const handleApplyCoupon = () => {
        if (!couponInput) {
            setCouponDiscount(0);
            setCouponError('');
            return;
        }
        
        const normalizedInput = couponInput.toUpperCase().replace(/\s/g, '');

        if (normalizedInput === 'WELCOME10') {
            setCouponDiscount(10);
            setCouponError('');
        } else if (normalizedInput === 'FLY20') {
            setCouponDiscount(20);
            setCouponError('');
        } else if (normalizedInput === 'ANSHUANNAYYA') {
            setCouponDiscount(100);
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

    const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#fff' }}>
            <UserSidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 50%), radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 50%)' }}>
                
                {/* Top Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <ShoppingCart size={28} color="var(--accent-cyan)" />
                        <div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>Your Cart</h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Review your selected add-ons before checkout.</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button 
                            onClick={() => navigate('/catalogue')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 16px', borderRadius: '8px',
                                color: '#fff', cursor: 'pointer', fontSize: '0.9rem'
                            }}
                        >
                            <ChevronLeft size={16} /> Continue Shopping
                        </button>
                        
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px', 
                            background: 'rgba(255,255,255,0.05)', 
                            padding: '8px 15px', borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <ShoppingCart size={18} color="var(--accent-cyan)" />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>My Cart</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{finalPrice.toFixed(2)}</div>
                            </div>
                            <div style={{ background: 'var(--accent-teal)', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                {totalItemCount}
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Bell size={20} color="var(--text-muted)" />
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                        </div>
                        
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    {/* Left Column: Cart Items */}
                    <div style={{ flex: '1' }}>
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 40px', gap: '15px', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <div>Item</div>
                                <div style={{ textAlign: 'center' }}>Price</div>
                                <div style={{ textAlign: 'center' }}>Quantity</div>
                                <div style={{ textAlign: 'center' }}>Total</div>
                                <div></div>
                            </div>

                            {cartItems.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Your cart is empty.
                                </div>
                            ) : (
                                cartItems.map((item, index) => {
                                    const rawName = item.name.split('(')[0].trim();
                                    const bgImage = imageMap[rawName] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400';
                                    
                                    return (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 40px', gap: '15px', padding: '20px', borderBottom: index < cartItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <img src={bgImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{item.name}</h3>
                                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.details || 'Standard'}</p>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', cursor: 'pointer' }}>View Details ⌄</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>₹{item.price}</div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <button onClick={() => handleUpdateQuantity(item.name, -1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 8px', cursor: 'pointer' }}><Minus size={14}/></button>
                                                    <span style={{ width: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.name, 1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 8px', cursor: 'pointer' }}><Plus size={14}/></button>
                                                </div>
                                            </div>
                                            
                                            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleRemove(item.name)} style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Shuu Pass Savings Banner */}
                        {isShuuPassActive && (
                            <div style={{ 
                                background: 'linear-gradient(to right, rgba(20, 184, 166, 0.1), rgba(15, 23, 42, 0.8))',
                                border: '1px solid rgba(20, 184, 166, 0.3)',
                                borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ background: 'rgba(255, 215, 0, 0.15)', padding: '10px', borderRadius: '50%' }}>
                                        <Crown color="#ffd700" size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--accent-teal)' }}>You have Shuu Pass!</h3>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enjoy exclusive savings on eligible add-ons.</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>SAVING APPLIED</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-teal)' }}>₹{shuuDiscountAmount.toFixed(2)}</div>
                                </div>
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                    <ShieldCheck color="var(--accent-teal)" size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>Secure Payments</h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>100% safe and encrypted transactions.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '10px', borderRadius: '10px' }}>
                                    <Award color="var(--accent-teal)" size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>Best Price Guarantee</h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get the best prices for all our add-ons.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div style={{ width: '350px' }}>
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                            <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px 0' }}>Order Summary</h2>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <span>Subtotal</span>
                                <span>₹{baseTotal.toFixed(2)}</span>
                            </div>
                            
                            {shuuDiscountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>
                                    <span>Discount (Shuu Pass {shuuDiscountPercent}%)</span>
                                    <span>-₹{shuuDiscountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            {couponDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#38bdf8', fontSize: '0.9rem' }}>
                                    <span>Coupon Discount</span>
                                    <span>-₹{extraCouponDiscountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '15px 0' }} />

                            {shuuDiscountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>
                                    <span>Shuu Pass Savings ⓘ</span>
                                    <span>-₹{shuuDiscountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div style={{ 
                                background: 'url("https://images.unsplash.com/photo-1531366936337-7c912a458b68?auto=format&fit=crop&q=80&w=400") center/cover',
                                borderRadius: '12px', padding: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(15,23,42,0.9), rgba(20,184,166,0.3))' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>Total Amount</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>₹{finalPrice.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Inclusive of all taxes</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Have a coupon code?</div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Enter code" 
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 15px', color: '#fff', outline: 'none' }}
                                    />
                                    <button 
                                        onClick={handleApplyCoupon}
                                        style={{ background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.5)', color: 'var(--accent-teal)', borderRadius: '8px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >Apply</button>
                                </div>
                                {couponError && <div style={{ color: '#f43f5e', fontSize: '0.8rem', marginTop: '5px' }}>{couponError}</div>}
                            </div>

                            <button 
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                                style={{ 
                                    width: '100%', background: 'linear-gradient(to right, #0d9488, #14b8a6)', 
                                    border: 'none', color: '#fff', padding: '15px', borderRadius: '8px', 
                                    fontSize: '1rem', fontWeight: 'bold', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                                    marginBottom: '15px', opacity: cartItems.length === 0 ? 0.5 : 1
                                }}
                            >
                                Proceed to Checkout &gt;
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <Lock size={14} color="var(--accent-teal)" />
                                Secure & Encrypted Payment
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;
