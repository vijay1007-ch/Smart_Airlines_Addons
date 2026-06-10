import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ShoppingCart, Bell, Filter, ShieldCheck, Award, RefreshCw, Headset } from 'lucide-react';
import axios from 'axios';

const imageMap = {
    'Extra Baggage': 'https://images.unsplash.com/photo-1551020084-2aaab0ee3dcc?auto=format&fit=crop&q=80&w=400',
    'Seat Upgrade': 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=400',
    'Lounge Access': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=400',
    'WiFi Access': 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=80&w=400',
    'In-flight Meal': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400',
    'Wine & Beverages': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=400',
    'Priority Boarding': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400',
    'Travel Insurance': 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?auto=format&fit=crop&q=80&w=400',
    'Extra Legroom': 'https://images.unsplash.com/photo-1502307100811-6bdc0981a85b?auto=format&fit=crop&q=80&w=400',
    'Comfort Kit': 'https://images.unsplash.com/photo-1584305574635-43026315eeff?auto=format&fit=crop&q=80&w=400',
    'Airport Transfer': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=400',
    'Pet in Cabin': 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=400',
};

const descMap = {
    'Extra Baggage': 'Add extra baggage allowance to your trip.',
    'Seat Upgrade': 'Upgrade to a more spacious and comfortable seat.',
    'Lounge Access': 'Relax in premium lounges before your flight.',
    'WiFi Access': 'Stay connected with high-speed internet on board.',
    'In-flight Meal': 'Choose from a variety of delicious meals.',
    'Wine & Beverages': 'Enjoy premium wines & beverages on board.',
    'Priority Boarding': 'Be among the first to board and settle in.',
    'Travel Insurance': 'Travel with peace of mind with our insurance plans.',
    'Extra Legroom': 'Enjoy more legroom for a relaxed journey.',
    'Comfort Kit': 'Travel essentials for a more comfortable flight.',
    'Airport Transfer': 'Hassle-free airport pick-up and drop services.',
    'Pet in Cabin': 'Carry your furry friend with you in the cabin.'
};

const Catalogue = () => {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState(null);
    const [baggageModal, setBaggageModal] = useState({ isOpen: false, addon: null, kg: 1 });
    const [activeFilter, setActiveFilter] = useState('All');
    
    // Load cart from localStorage
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('airline_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [dbAddons, setDbAddons] = useState([]);

    useEffect(() => {
        // Dummy data for presentation if API is slow or missing
        const fallbackAddons = [
            { id: 1, name: 'Extra Baggage', price: 660, category: 'Baggage' },
            { id: 2, name: 'Seat Upgrade', price: 1760, category: 'Comfort' },
            { id: 3, name: 'Lounge Access', price: 660, category: 'Comfort' },
            { id: 4, name: 'WiFi Access', price: 550, category: 'Connectivity' },
            { id: 5, name: 'In-flight Meal', price: 220, category: 'Dining' },
            { id: 6, name: 'Wine & Beverages', price: 330, category: 'Dining' },
            { id: 7, name: 'Priority Boarding', price: 440, category: 'Priority' },
            { id: 8, name: 'Travel Insurance', price: 300, category: 'Other' },
            { id: 9, name: 'Extra Legroom', price: 800, category: 'Comfort' },
            { id: 10, name: 'Comfort Kit', price: 250, category: 'Comfort' },
            { id: 11, name: 'Airport Transfer', price: 1200, category: 'Other' },
            { id: 12, name: 'Pet in Cabin', price: 1500, category: 'Other' },
        ];

        axios.get(`${getApiUrl()}/addons`)
            .then(res => {
                if(res.data && res.data.length > 0) {
                    // Try to match with our nice mock list
                    const enriched = res.data.map(item => {
                        let cat = 'Other';
                        const n = item.name.toLowerCase();
                        if(n.includes('baggage')) cat = 'Baggage';
                        else if(n.includes('seat') || n.includes('lounge') || n.includes('legroom') || n.includes('kit')) cat = 'Comfort';
                        else if(n.includes('wifi')) cat = 'Connectivity';
                        else if(n.includes('food') || n.includes('meal') || n.includes('wine')) cat = 'Dining';
                        else if(n.includes('priority')) cat = 'Priority';
                        return { ...item, category: cat };
                    });
                    
                    // If db doesn't have enough, merge with fallback
                    if (enriched.length < 5) {
                        setDbAddons(fallbackAddons);
                    } else {
                        setDbAddons(enriched);
                    }
                } else {
                    setDbAddons(fallbackAddons);
                }
            })
            .catch(err => {
                console.error("Error fetching addons:", err);
                setDbAddons(fallbackAddons);
            });
    }, []);

    useEffect(() => {
        localStorage.setItem('airline_cart', JSON.stringify(cart));
    }, [cart]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAddOneTimeItem = (addon) => {
        const itemName = addon.name;
        
        if (itemName.toLowerCase().includes('baggage')) {
            setBaggageModal({ isOpen: true, addon, kg: 1 });
            return;
        }

        if (cart.some(item => item.name === itemName)) {
            showToast(`⚠️ ${itemName} is already selected!`);
        } else {
            setCart([...cart, { id: Date.now(), name: itemName, price: addon.price, details: 'Standard' }]);
            showToast(`✅ ${itemName} added to cart!`);
        }
    };

    const confirmBaggage = () => {
        const { addon, kg } = baggageModal;
        if (kg < 1) {
            showToast("⚠️ Minimum 1 KG required");
            return;
        }
        
        const total = addon.price * kg;
        const existingBaggageIndex = cart.findIndex(item => item.name.toLowerCase().includes('baggage'));
        const finalName = `${addon.name.split('/')[0].trim()} (${kg} KG)`;

        let newCart = [...cart];
        if (existingBaggageIndex !== -1) {
            newCart[existingBaggageIndex] = { id: Date.now(), name: finalName, price: total, details: `${kg} KG` };
            showToast(`✅ Updated to ${kg}KG extra baggage!`);
        } else {
            newCart.push({ id: Date.now(), name: finalName, price: total, details: `${kg} KG` });
            showToast(`✅ Added ${kg}KG extra baggage to cart!`);
        }
        
        setCart(newCart);
        setBaggageModal({ isOpen: false, addon: null, kg: 1 });
    };

    const isSelected = (name) => cart.some(item => item.name === name || (name.toLowerCase().includes('baggage') && item.name.toLowerCase().includes('baggage')));

    const filters = ['All', 'Baggage', 'Comfort', 'Connectivity', 'Dining', 'Priority', 'Other'];
    
    const filteredAddons = activeFilter === 'All' 
        ? dbAddons 
        : dbAddons.filter(a => a.category === activeFilter);

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#fff' }}>
            <UserSidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 50%), radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 50%)' }}>
                
                {/* Top Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>Browse Add-ons</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Enhance your journey with our premium add-ons</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="text" 
                                placeholder="Search add-ons..." 
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '10px 15px 10px 45px',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    outline: 'none',
                                    width: '250px'
                                }}
                            />
                        </div>
                        
                        <div 
                            onClick={() => navigate('/cart')}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', 
                                background: 'rgba(255,255,255,0.05)', 
                                padding: '8px 15px', borderRadius: '8px',
                                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <ShoppingCart size={18} color="var(--accent-cyan)" />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>My Cart</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{cartTotal}</div>
                            </div>
                            <div style={{ background: 'var(--accent-cyan)', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                {cart.length}
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

                {/* Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                style={{
                                    background: activeFilter === filter ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                    color: activeFilter === filter ? '#000' : 'var(--text-muted)',
                                    border: activeFilter === filter ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: activeFilter === filter ? '600' : '400',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'transparent', color: 'var(--accent-teal)',
                        border: '1px solid rgba(20, 184, 166, 0.4)',
                        padding: '8px 16px', borderRadius: '20px',
                        cursor: 'pointer', fontSize: '0.9rem'
                    }}>
                        <Filter size={16} /> Filters
                    </button>
                </div>

                {/* Addons Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {filteredAddons.map((addon) => {
                        const bgImage = imageMap[addon.name] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400';
                        const desc = descMap[addon.name] || 'Premium service to enhance your flight experience.';
                        const isBaggage = addon.name.toLowerCase().includes('baggage');
                        
                        return (
                            <div key={addon.id} style={{ 
                                background: 'rgba(15, 23, 42, 0.6)', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ height: '140px', position: 'relative' }}>
                                    <img src={bgImage} alt={addon.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(15, 23, 42, 1))' }} />
                                </div>
                                
                                <div style={{ padding: '1rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', marginTop: '-30px' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>{addon.name}</h3>
                                    
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{addon.price}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isBaggage ? 'per 10kg' : 'from'}</span>
                                    </div>
                                    
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.5rem 0', lineHeight: 1.4, flex: 1 }}>
                                        {desc}
                                    </p>
                                    
                                    <button 
                                        onClick={() => handleAddOneTimeItem(addon)}
                                        style={{ 
                                            background: isSelected(addon.name) ? 'rgba(20, 184, 166, 0.2)' : 'transparent',
                                            color: isSelected(addon.name) ? 'var(--accent-teal)' : '#fff',
                                            border: isSelected(addon.name) ? '1px solid var(--accent-teal)' : '1px solid rgba(255,255,255,0.2)',
                                            padding: '0.6rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            width: '100%',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            if(!isSelected(addon.name)){
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if(!isSelected(addon.name)){
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <span>{isSelected(addon.name) ? 'Added' : 'Add'}</span>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Trust Badges */}
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
                    background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)',
                    padding: '1.5rem', borderRadius: '16px'
                }}>
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
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <RefreshCw color="var(--accent-teal)" size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>Easy Cancellation</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cancel add-ons up to 3 hours before departure.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Headset color="var(--accent-teal)" size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-teal)', fontSize: '0.9rem' }}>24/7 Support</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>We are here to help you anytime, anywhere.</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Bottom Popup (Toast) */}
            {toastMessage && (
                <div style={{
                    position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--accent-teal)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.2)',
                    color: '#fff', padding: '1rem 2rem', borderRadius: '30px',
                    backdropFilter: 'blur(10px)', zIndex: 1000, fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    {toastMessage}
                </div>
            )}

            {/* Baggage KG Modal */}
            {baggageModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div className="card" style={{ 
                        width: '400px', padding: '2rem', textAlign: 'center',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Extra Baggage</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Price: <strong style={{color: 'var(--accent-teal)'}}>₹{baggageModal.addon.price} per KG</strong>
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <button 
                                onClick={() => setBaggageModal(prev => ({ ...prev, kg: Math.max(1, prev.kg - 1) }))}
                                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}
                            >-</button>
                            
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '50px', color: '#fff' }}>{baggageModal.kg}</span>
                            
                            <button 
                                onClick={() => setBaggageModal(prev => ({ ...prev, kg: prev.kg + 1 }))}
                                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}
                            >+</button>
                        </div>

                        <div style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#fff' }}>
                            Total: <strong style={{ color: 'var(--accent-teal)' }}>₹{baggageModal.addon.price * baggageModal.kg}</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setBaggageModal({ isOpen: false, addon: null, kg: 1 })}
                                style={{ flex: 1, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmBaggage}
                                style={{ flex: 1, background: 'var(--accent-teal)', color: '#000', fontWeight: 'bold', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Catalogue;
