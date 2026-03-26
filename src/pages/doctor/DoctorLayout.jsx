import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Users, FileText,
    Settings, LogOut, Bell, MessageSquare
} from 'lucide-react';
import NotificationPanel from '../../components/NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';
import IncomingCallModal from '../../components/IncomingCallModal';
import CallContainer from '../../components/CallContainer';
import { ringtone } from '../../utils/ringtone';
import { useState } from 'react';

const NAV = [
    [LayoutDashboard, 'Dashboard', '/doctor/dashboard'],
    [Calendar, 'Appointments', '/doctor/appointments'],
    [Users, 'Patient Profiles', '/doctor/patients'],
    [FileText, 'Report Sharing', '/doctor/reports'],
    [MessageSquare, 'Patient Chat', '/doctor/chat'],
    [Settings, 'Settings', '/doctor/settings'],
];

const S = {
    wrap: { display: 'flex', height: '100vh', background: '#f8f9fa', fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden' },
    sidebar: { width: 210, background: '#fff', borderRight: '1px solid #e8eaed', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    brand: { padding: '18px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 },
    brandIcon: { width: 36, height: 36, background: '#3b5bdb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
    nav: { padding: '12px 10px', flex: 1 },
    navItemActive: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 3, cursor: 'pointer', background: '#3b5bdb', color: '#fff', fontWeight: 600, fontSize: 13 },
    navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 3, cursor: 'pointer', color: '#495057', fontWeight: 400, fontSize: 13 },
    profileBar: { padding: '12px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 },
    avatar: { width: 34, height: 34, borderRadius: '50%', background: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 },
};

function Sidebar({ active }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <div style={S.sidebar}>
            <div style={S.brand}>
                <div style={S.brandIcon}>🏥</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>MediCare</div>
                    <div style={{ fontSize: 11, color: '#868e96' }}>Hospital System</div>
                </div>
            </div>
            <div style={S.nav}>
                {NAV.map(([Icon, label, path]) => (
                    <div key={path} onClick={() => navigate(path)}
                        style={path === active ? S.navItemActive : S.navItem}>
                        <Icon size={16} /> {label}
                    </div>
                ))}
                <div style={{ ...S.navItem, color: '#fa5252', marginTop: 8 }}
                    onClick={() => { localStorage.clear(); navigate('/login'); }}>
                    <LogOut size={16} /> Logout
                </div>
            </div>
            <div style={S.profileBar}>
                <div style={S.avatar}>{user.first_name?.[0] || 'D'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.first_name ? `Dr. ${user.first_name} ${user.last_name}` : 'Doctor'}
                    </div>
                    <div style={{ fontSize: 10, color: '#868e96' }}>Doctor</div>
                </div>
            </div>
        </div>
    );
}

export default function DoctorLayout({ children, activeLabel, activePath }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, incomingCall, setIncomingCall } = useNotifications();
    const [activeCall, setActiveCall] = useState(null);

    // Global listener for outgoing calls
    useState(() => {
        const handleStartCall = (e) => {
            console.log('Global call trigger:', e.detail);
            setActiveCall(e.detail);
        };
        window.addEventListener('HAM-start-call', handleStartCall);
        return () => window.removeEventListener('HAM-start-call', handleStartCall);
    }, []);

    return (
        <div style={S.wrap}>
            <Sidebar active={activePath} />
            <div style={S.main}>
                <div style={S.topbar}>
                    <div>
                        <div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>{activeLabel}</div>
                        <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Welcome back, Dr. {user.first_name || 'Doctor'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <NotificationPanel
                            notifications={notifications}
                            unreadCount={unreadCount}
                            onMarkRead={markAsRead}
                            onMarkAllRead={markAllRead}
                            onDelete={deleteNotification}
                        />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </div>

            {/* GLOBAL OVERLAYS */}
            <IncomingCallModal 
                call={incomingCall}
                onAccept={() => {
                    setActiveCall(incomingCall);
                    setIncomingCall(null);
                    ringtone.stopIncoming();
                }}
                onDecline={() => {
                    markAsRead(incomingCall.notificationId);
                    setIncomingCall(null);
                    ringtone.stopIncoming();
                }}
            />

            {activeCall && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10002, background: '#000' }}>
                    <CallContainer 
                        roomID={activeCall.roomID}
                        userID={`doctor_${user.id}`}
                        userName={`Dr. ${user.first_name} ${user.last_name}`}
                        isVideoCall={activeCall.isVideo}
                        onLeave={() => { setActiveCall(null); ringtone.stopAll(); }}
                    />
                </div>
            )}
        </div>
    );
}
