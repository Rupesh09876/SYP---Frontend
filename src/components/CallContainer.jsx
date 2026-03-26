import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export default function CallContainer({ roomID, userID, userName, onLeave, isVideoCall = true }) {
    const [connecting, setConnecting] = useState(true);
    const zpRef = useRef(null);
    const containerRef = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => {
        console.log('CallContainer mounted');
        const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
            console.error('ZEGO APP ID or SERVER SECRET not configured');
            alert('Calling configuration is missing. Please contact administrator.');
            onLeave();
            return;
        }

        if (zpRef.current) return;

        const initCall = async () => {
            try {
                if (!containerRef.current) return;

                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID,
                    serverSecret,
                    roomID,
                    userID,
                    userName
                );

                const zp = ZegoUIKitPrebuilt.create(kitToken);
                zpRef.current = zp;

                zp.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    turnOnCameraWhenJoining: isVideoCall,
                    showMyCameraToggleButton: false,
                    showAudioVideoSettingsButton: false,
                    showScreenSharingButton: false,
                    showUserList: false,
                    showPreJoinView: false,
                    onLeaveRoom: () => {
                        console.log('User left the room');
                        cleanupZego();
                        onLeave();
                    },
                    onJoinRoom: () => {
                        if (isMounted.current) setConnecting(false);
                    }
                });
            } catch (err) {
                console.error('Zego initialization error:', err);
                onLeave();
            }
        };

        const cleanupZego = () => {
            if (zpRef.current) {
                try {
                    console.log('Destroying Zego instance...');
                    zpRef.current.destroy();
                } catch (e) {
                    console.warn('Silent error during Zego destroy:', e);
                } finally {
                    zpRef.current = null;
                }
            }
        };

        const timeout = setTimeout(() => {
            if (containerRef.current && isMounted.current) {
                initCall();
            }
        }, 800);

        return () => {
            isMounted.current = false;
            clearTimeout(timeout);
            cleanupZego();
        };
    }, [roomID, userID, userName]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59,91,219,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(214,51,108,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

            {/* Premium Header Overlay */}
            <div style={{
                position: 'absolute',
                top: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10001,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                color: '#fff'
            }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: connecting ? '#ffd43b' : '#51cf66', boxShadow: connecting ? '0 0 10px #ffd43b' : '0 0 10px #51cf66' }} />
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
                    {connecting ? 'SECURELY CONNECTING...' : isVideoCall ? 'HD VIDEO CALL' : 'SECURE AUDIO CALL'}
                </span>
                <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />
                <span style={{ fontSize: 13, opacity: 0.8 }}>{userName}</span>
            </div>

            {/* Main Interactive Area */}
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {connecting && (
                    <div style={{ textAlign: 'center', color: '#fff', zIndex: 10002 }}>
                        <div style={{ 
                            width: 64, 
                            height: 64, 
                            border: '3px solid rgba(255,255,255,0.1)', 
                            borderTop: '3px solid #3b5bdb', 
                            borderRadius: '50%', 
                            animation: 'ego-spin 1s linear infinite',
                            margin: '0 auto 20px' 
                        }} />
                        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>MediCare Secure Link</h2>
                        <p style={{ fontSize: 14, opacity: 0.6 }}>Establishing end-to-end encrypted connection...</p>
                    </div>
                )}
                
                <div ref={containerRef} style={{ 
                    width: '100vw', 
                    height: '100vh',
                    opacity: connecting ? 0 : 1,
                    transition: 'opacity 0.5s ease'
                }} />
            </div>

            {/* Custom Footer Controls (Optional, Zego has its own, but we can overlay a "End Call" that feels more premium) */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                zIndex: 10001,
                display: 'flex',
                gap: 20
            }}>
                <button 
                    onClick={onLeave}
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: '#fa5252',
                        border: 'none',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(250, 82, 82, 0.4)',
                        transition: 'transform 0.2s ease, background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <PhoneOff size={28} />
                </button>
            </div>

            <style>{`
                @keyframes ego-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                /* Zego UI Customizations */
                .zego-ui-kit-container { background: transparent !important; }
            `}</style>
        </div>
    );
}
