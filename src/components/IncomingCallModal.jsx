import React from 'react';
import { Phone, Video, X, Mic } from 'lucide-react';

export default function IncomingCallModal({ call, onAccept, onDecline }) {
    if (!call) return null;

    const { isVideo, senderName } = call;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 10, 25, 0.8)',
            backdropFilter: 'blur(8px)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                width: 380,
                background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
                borderRadius: 24,
                padding: 40,
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                position: 'relative',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Pulse Animation Background */}
                <div className="pulse-container" style={{
                    width: 100,
                    height: 100,
                    margin: '0 auto 24px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="pulse-ring" />
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: '#3b5bdb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        boxShadow: '0 0 20px rgba(59,91,219,0.5)'
                    }}>
                        {isVideo ? <Video size={32} /> : <Phone size={32} />}
                    </div>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Incoming Call</h2>
                <p style={{ opacity: 0.6, fontSize: 14, marginBottom: 32 }}>{senderName} is requesting a secure {isVideo ? 'Video' : 'Audio'} session</p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button 
                        onClick={onDecline}
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'rgba(250, 82, 82, 0.1)',
                            border: '1px solid rgba(250, 82, 82, 0.2)',
                            color: '#fa5252',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={28} />
                    </button>
                    <button 
                        onClick={onAccept}
                        style={{
                            flex: 1,
                            height: 60,
                            borderRadius: 30,
                            background: '#3b5bdb',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            boxShadow: '0 8px 20px rgba(59,91,219,0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', animation: 'blink 1s infinite' }} />
                        Accept Call
                    </button>
                </div>

                <style>{`
                    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                    @keyframes pulse { 
                        0% { transform: scale(0.8); opacity: 0.5; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                    .pulse-ring {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        background: #3b5bdb;
                        animation: pulse 2s infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}
