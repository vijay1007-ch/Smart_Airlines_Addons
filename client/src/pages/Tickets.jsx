import React, { useRef } from 'react';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Bell, ShoppingBag, Plane, 
    Download, Share2, Printer, CheckCircle,
    Clock, Briefcase, Monitor, Key, Shield,
    Headphones, CreditCard
} from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './UserDashboard.css'; // Reuse some layout styles if needed

const Tickets = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : 'Vijay Ganesh Kaushik';
    const passRef = useRef(null);

    const handleDownload = async () => {
        if (!passRef.current) return;
        try {
            const canvas = await html2canvas(passRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', [300, 150]);
            pdf.addImage(imgData, 'PNG', 0, 0, 300, 150);
            pdf.save(`BoardingPass_ORD-9726347.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19' }}>
            <UserSidebar />

            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', color: '#fff', background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.05), transparent 40%)' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <ArrowLeft size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => navigate('/dashboard')} />
                        <div>
                            <h1 style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>Boarding Pass</h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Your ticket to a smooth and comfortable journey.</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button onClick={() => navigate('/history')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingBag size={16} /> My Orders
                        </button>
                        <div style={{ position: 'relative' }}>
                            <Bell size={20} color="var(--text-muted)" />
                            <div style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                        </div>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.3)' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    
                    {/* Left: Boarding Pass Area */}
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* THE BOARDING PASS */}
                        <div ref={passRef} style={{ display: 'flex', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: '#fff' }}>
                            
                            {/* Main Ticket */}
                            <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
                                
                                {/* Dark Top Section */}
                                <div style={{ 
                                    background: 'url("https://images.unsplash.com/photo-1531366936337-778550c18d94?q=80&w=1000&auto=format&fit=crop") center/cover', 
                                    padding: '2rem', position: 'relative', overflow: 'hidden' 
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(2,6,23,0.95), rgba(2,6,23,0.7))' }} />
                                    
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Plane size={24} color="#fff" style={{ transform: 'rotate(45deg)' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>SMART AIRLINES</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fly Smarter. Travel Better.</div>
                                                </div>
                                            </div>
                                            <div style={{ border: '1px solid rgba(20,184,166,0.5)', color: 'var(--accent-teal)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                                                ECONOMY
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                            <div style={{ width: '30%' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>FROM</div>
                                                <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: '1' }}>HYD</div>
                                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Hyderabad</div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                <div style={{ height: '2px', width: '100%', background: 'rgba(255,255,255,0.2)', borderBottom: '2px dashed rgba(255,255,255,0.4)', position: 'absolute' }} />
                                                <Plane size={28} color="var(--accent-cyan)" style={{ position: 'relative', zIndex: 1, transform: 'rotate(90deg)' }} />
                                            </div>
                                            <div style={{ width: '30%', textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>TO</div>
                                                <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: '1' }}>DEL</div>
                                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Delhi</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>FLIGHT</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>SA 1023</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>DATE</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>24 May 2025</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>BOARDING</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>08:15 AM</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>GATE</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>B12</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>SEAT</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>12A</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>PASSENGER</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{userName.toUpperCase()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>PNR</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>ORD-9726347</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>SEQ</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>021</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>CLASS</div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Economy</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* White Bottom Section */}
                                <div style={{ background: '#fff', padding: '1.5rem 2rem', color: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        {/* Mock Barcode */}
                                        <div style={{ display: 'flex', height: '50px', marginBottom: '10px' }}>
                                            {[...Array(60)].map((_, i) => (
                                                <div key={i} style={{ width: `${Math.random() * 4 + 1}px`, background: '#000', marginRight: '2px' }} />
                                            ))}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>
                                            SA1023 • ORD-9726347 • {userName.toUpperCase()}
                                        </div>
                                    </div>
                                    <QRCode value={`FLIGHT:SA1023|PNR:ORD-9726347|NAME:${userName}`} size={70} />
                                </div>
                            </div>

                            {/* Divider Perforation */}
                            <div style={{ width: '30px', position: 'relative', background: '#fff' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '-10px', bottom: '-10px', width: '2px', borderLeft: '2px dashed #ccc' }} />
                                <div style={{ position: 'absolute', top: '-15px', left: '0', width: '30px', height: '30px', background: '#0b0f19', borderRadius: '50%' }} />
                                <div style={{ position: 'absolute', bottom: '-15px', left: '0', width: '30px', height: '30px', background: '#0b0f19', borderRadius: '50%' }} />
                            </div>

                            {/* Right Stub Section */}
                            <div style={{ flex: 1, background: '#f8fafc', padding: '2rem 1.5rem', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>SMART AIRLINES</div>
                                <div style={{ background: '#1e293b', color: '#fff', padding: '5px', textAlign: 'center', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>SA 1023</div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>FROM</div>
                                        <div style={{ fontWeight: 'bold' }}>HYD <span style={{fontWeight:'normal', fontSize:'0.7rem', color:'#64748b'}}>Hyderabad</span></div>
                                    </div>
                                    <Plane size={14} color="#94a3b8" />
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>TO</div>
                                        <div style={{ fontWeight: 'bold' }}>DEL <span style={{fontWeight:'normal', fontSize:'0.7rem', color:'#64748b'}}>Delhi</span></div>
                                    </div>
                                    <Plane size={14} color="#94a3b8" style={{transform:'rotate(90deg)'}} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>DATE</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>24 May 2025</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>BOARDING</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>08:15 AM</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>GATE</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>B12</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>SEAT</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>12A</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>#</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>021</div>
                                    </div>
                                </div>

                                <div style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', borderRadius: '4px', fontSize: '0.7rem', color: '#475569', marginBottom: '10px' }}>SEQ 021</div>
                                
                                <div style={{ display: 'flex', height: '25px', width: '100%' }}>
                                    {[...Array(30)].map((_, i) => (
                                        <div key={i} style={{ width: `${Math.random() * 3 + 1}px`, background: '#000', marginRight: '2px' }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={handleDownload}>
                                <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', color: 'var(--accent-cyan)' }}><Download size={18} /></div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Download PDF</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Save your ticket</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', background: '#fff' }}><CreditCard size={18} color="#000" /></div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Add to Apple Wallet</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add to your wallet</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', color: 'var(--accent-teal)' }}><Share2 size={18} /></div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Share Ticket</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share with your friends</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', color: 'var(--accent-cyan)' }}><Printer size={18} /></div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Print Ticket</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Print your boarding pass</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right: Important Information */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Important Information</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ color: 'var(--accent-cyan)' }}><Clock size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '5px' }}>Arrive Early</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Reach the airport at least<br/>2 hours before departure.</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ color: 'var(--accent-cyan)' }}><Briefcase size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '5px' }}>Baggage Drop</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Verify your baggage drop<br/>timings at the airport.</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ color: 'var(--accent-cyan)' }}><Monitor size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '5px' }}>Gate Change</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Check the airport screens for<br/>any gate updates.</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ color: 'var(--accent-cyan)' }}><Key size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '5px' }}>Carry ID Proof</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Valid government ID proof is<br/>mandatory for travel.</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ color: 'var(--accent-cyan)' }}><Shield size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '5px' }}>Have a Safe Flight</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Thank you for choosing<br/>Smart Airlines!</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '8px' }}>Need Assistance?</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>We're here to help you 24/7.</div>
                                <button style={{ background: 'var(--accent-teal)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>Contact Support</button>
                            </div>
                            <div style={{ background: 'rgba(20,184,166,0.1)', padding: '15px', borderRadius: '50%' }}>
                                <Headphones size={40} color="var(--accent-teal)" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tickets;
