import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Utensils, Wine, Wifi, Star, ShoppingBag, Plus } from 'lucide-react';

const Catalogue = () => {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState(null);
    const [baggageModal, setBaggageModal] = useState({ isOpen: false, addon: null, kg: 1 });
    
    // Load cart from localStorage
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('airline_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [dbAddons, setDbAddons] = useState([]);

    useEffect(() => {
        fetch(`${getApiUrl()}/addons`)
            .then(res => res.json())
            .then(data => setDbAddons(data))
            .catch(err => console.error("Error fetching addons:", err));
    }, []);

    // Save to localStorage whenever cart changes
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
        // Check if there is already a baggage item, replace it or add new
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

    const getIconForAddon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('baggage')) return <Briefcase size={24} color="#f59e0b" />;
        if (n.includes('food') || n.includes('meal')) return <Utensils size={24} color="#f43f5e" />;
        if (n.includes('wine') || n.includes('drink')) return <Wine size={24} color="#f59e0b" />;
        if (n.includes('wifi')) return <Wifi size={24} color="#0ea5e9" />;
        if (n.includes('boarding') || n.includes('priority')) return <Star size={24} color="#10b981" />;
        return <ShoppingBag size={24} color="var(--primary-blue)" />;
    };

    return (
        <div className="page" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Navbar />
            <div className="container" style={{ paddingBottom: '100px', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Individual Add-ons</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Enhance your journey with our premium services.</p>
                    </div>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    {dbAddons.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '2rem', gridColumn: '1 / -1' }}>
                            No items available in the catalogue.
                        </div>
                    ) : (
                        dbAddons.map((addon) => (
                            <div key={addon.id} className="card" style={{ 
                                padding: '1.5rem', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                border: isSelected(addon.name) ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                                background: isSelected(addon.name) ? 'rgba(0, 229, 255, 0.05)' : 'var(--bg-card)'
                            }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '10px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    marginBottom: '1rem'
                                }}>
                                    {getIconForAddon(addon.name)}
                                </div>
                                
                                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>{addon.name}</h3>
                                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard</p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>₹{addon.price}</h2>
                                    <button 
                                        onClick={() => handleAddOneTimeItem(addon)}
                                        style={{ 
                                            background: isSelected(addon.name) ? 'var(--accent-cyan)' : 'transparent',
                                            color: isSelected(addon.name) ? '#060b13' : 'var(--accent-cyan)',
                                            border: isSelected(addon.name) ? 'none' : '1px solid rgba(0, 229, 255, 0.4)',
                                            padding: '0.4rem 0.8rem',
                                            fontSize: '0.8rem',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            boxShadow: isSelected(addon.name) ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none'
                                        }}
                                    >
                                        {isSelected(addon.name) ? (
                                            <>✓ Added</>
                                        ) : (
                                            <><Plus size={14} /> Add</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Custom Bottom Popup (Toast) */}
            {toastMessage && (
                <div style={{
                    position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--accent-cyan)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.2)',
                    color: 'var(--text-main)', padding: '1rem 2rem', borderRadius: '30px',
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
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)'
                    }}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Extra Baggage</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Price: <strong style={{color: 'var(--accent-cyan)'}}>₹{baggageModal.addon.price} per KG</strong>
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <button 
                                onClick={() => setBaggageModal(prev => ({ ...prev, kg: Math.max(1, prev.kg - 1) }))}
                                className="secondary"
                                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
                            >-</button>
                            
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '50px', color: 'var(--text-main)' }}>{baggageModal.kg}</span>
                            
                            <button 
                                onClick={() => setBaggageModal(prev => ({ ...prev, kg: prev.kg + 1 }))}
                                className="secondary"
                                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
                            >+</button>
                        </div>

                        <div style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                            Total: <strong style={{ color: 'var(--accent-cyan)' }}>₹{baggageModal.addon.price * baggageModal.kg}</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setBaggageModal({ isOpen: false, addon: null, kg: 1 })}
                                className="secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmBaggage}
                                style={{ flex: 1, background: 'var(--accent-cyan)', color: '#060b13', fontWeight: 'bold' }}
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
