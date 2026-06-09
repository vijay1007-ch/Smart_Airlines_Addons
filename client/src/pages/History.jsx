import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import BoardingPassModal from '../components/BoardingPassModal';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [selectedOrderForPass, setSelectedOrderForPass] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const savedHistory = localStorage.getItem('airline_history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('airline_history');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <UserSidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 className="title" style={{ margin: 0 }}>Purchase History</h1>
                    {history.length > 0 && (
                        <button 
                            onClick={clearHistory}
                            style={{ background: 'rgba(255, 65, 108, 0.1)', color: '#ff416c', border: '1px solid rgba(255, 65, 108, 0.3)', width: 'auto', padding: '10px 20px', boxShadow: 'none' }}
                        >
                            Clear History
                        </button>
                    )}
                </div>
                
                {history.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <h2 style={{ color: 'var(--text-muted)' }}>No past purchases</h2>
                        <p>You haven't bought any add-ons yet.</p>
                        <button onClick={() => navigate('/catalogue')} style={{ marginTop: '20px', width: 'auto', padding: '10px 30px' }}>
                            View Catalogue
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {history.map((order) => (
                            <div key={order.orderId} className="card" style={{ padding: '0', overflow: 'hidden', borderLeft: '4px solid var(--primary-blue)' }}>
                                <div style={{ 
                                    background: 'rgba(0,0,0,0.2)', 
                                    padding: '15px 20px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    borderBottom: '1px solid var(--border-light)' 
                                }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>Order {order.orderId}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.date}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--accent-cyan)' }}>₹{order.total}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button 
                                                onClick={() => setSelectedOrderForPass(order)}
                                                style={{  color: 'white', padding: '5px 15px', fontSize: '0.8rem' }}
                                            >
                                                Boarding Pass
                                            </button>
                                            <span style={{ 
                                                background: 'rgba(46, 213, 115, 0.2)', 
                                                color: '#2ed573', 
                                                padding: '5px 10px', 
                                                borderRadius: '10px', 
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold'
                                            }}>
                                                SUCCESS
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-muted)' }}>Items Purchased:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'white', lineHeight: '1.6' }}>
                                        {order.items.map((item, idx) => (
                                            <li key={idx}>
                                                <strong>{item.name}</strong> 
                                                {item.details !== 'Standard' ? ` (${item.details})` : ''} 
                                                <span style={{ color: 'var(--accent-cyan)' }}> - ₹{item.price}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedOrderForPass && (
                <BoardingPassModal 
                    order={selectedOrderForPass} 
                    user={user}
                    onClose={() => setSelectedOrderForPass(null)} 
                />
            )}
        </div>
    );
};

export default History;
