import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';


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



    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingBottom: '100px' }}>
                <h1 className="title" style={{ marginTop: '2rem' }}>Individual Add-ons</h1>
                <div className="card-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                    
                    {/* Dynamic Cards Only */}
                    {dbAddons.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '2rem' }}>
                            No items available in the catalogue.
                        </div>
                    ) : (
                        dbAddons.map((addon) => (
                            <div key={addon.id} className="card" style={{ width: '300px', textAlign: 'center' }}>
                            <h3>{addon.name}</h3>
                            <p>Enhance your journey with {addon.name.toLowerCase()}.</p>
                            <h2 style={{ margin: '15px 0', color: 'var(--accent-cyan)' }}>₹{addon.price}</h2>
                            <button 
                                onClick={() => handleAddOneTimeItem(addon)}
                                style={{ background: isSelected(addon.name) ? 'rgba(255,255,255,0.1)' : '' }}
                            >
                                {isSelected(addon.name) ? (addon.name.toLowerCase().includes('baggage') ? 'Update KG' : 'Selected') : 'Add to Cart'}
                            </button>
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* Custom Bottom Popup (Toast) */}
            {toastMessage && (
                <div style={{
                    position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, rgba(6, 11, 25, 0.9), rgba(10, 25, 49, 0.95))',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.2)',
                    color: 'white', padding: '1rem 2rem', borderRadius: '30px',
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
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div className="card" style={{ 
                        width: '400px', padding: '2rem', textAlign: 'center',
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
                        border: '1px solid rgba(0, 229, 255, 0.2)'
                    }}>
                        <h2 style={{ marginBottom: '1rem' }}>Extra Baggage</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Price: <strong style={{color: 'var(--accent-cyan)'}}>₹{baggageModal.addon.price} per KG</strong>
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <button 
                                onClick={() => setBaggageModal(prev => ({ ...prev, kg: Math.max(1, prev.kg - 1) }))}
                                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}
                            >-</button>
                            
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '50px' }}>{baggageModal.kg}</span>
                            
                            <button 
                                onClick={() => setBaggageModal(prev => ({ ...prev, kg: prev.kg + 1 }))}
                                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}
                            >+</button>
                        </div>

                        <div style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
                            Total: <strong style={{ color: 'var(--accent-cyan)' }}>₹{baggageModal.addon.price * baggageModal.kg}</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setBaggageModal({ isOpen: false, addon: null, kg: 1 })}
                                style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmBaggage}
                                style={{ flex: 1, background: 'linear-gradient(90deg, var(--accent-cyan), var(--primary-blue))', color: 'black', fontWeight: 'bold' }}
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
