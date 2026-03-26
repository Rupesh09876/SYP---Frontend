import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, FileText, Mic,
  User, Settings, LogOut, Bell, Mail, CreditCard, Zap, MessageSquare
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../../components/NotificationPanel';
import IncomingCallModal from '../../components/IncomingCallModal';
import CallContainer from '../../components/CallContainer';
import { ringtone } from '../../utils/ringtone';

const NAV_MAIN = [
  [Calendar, 'Appointments', '/patient/appointments'],
  [FileText, 'Medical Reports', '/patient/reports'],
  [CreditCard, 'Billing & Invoices', '/patient/billing'],
  [MessageSquare, 'Live Chat', '/patient/chat'],
  [Mic, 'AI Assistant', '/patient/ai-assistant'],
];
const NAV_ACCOUNT = [
  [Zap, 'Subscription', '/patient/subscription'],
  [User, 'My Profile', '/patient/profile'],
  [Settings, 'Settings', '/patient/settings'],
];

export default function PatientLayout({ children, activeLabel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, incomingCall, setIncomingCall } = useNotifications();
  const [activeCall, setActiveCall] = useState(null);

  // Global listener for outgoing calls
  useEffect(() => {
    const handleStartCall = (e) => {
        console.log('Global call trigger:', e.detail);
        setActiveCall(e.detail);
    };
    window.addEventListener('HAM-start-call', handleStartCall);
    return () => window.removeEventListener('HAM-start-call', handleStartCall);
  }, []);

  const S = {
    sidebar: { width: 210, background: '#fff', borderRight: '1px solid #e8eaed', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    navItemActive: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 3, cursor: 'pointer', background: '#3b5bdb', color: '#fff', fontWeight: 600, fontSize: 13 },
    navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 3, cursor: 'pointer', color: '#495057', fontSize: 13, transition: 'background 0.15s' },
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9fa', fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        {/* Brand */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#3b5bdb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>MediCare</div>
            <div style={{ fontSize: 11, color: '#868e96' }}>Patient Portal</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 10px', flex: 1 }}>
          {/* Dashboard */}
          <div
            style={isActive('/patient/dashboard') ? S.navItemActive : S.navItem}
            onClick={() => navigate('/patient/dashboard')}
          >
            <LayoutDashboard size={16} /> Dashboard
          </div>

          {NAV_MAIN.map(([Icon, label, path]) => (
            <div key={path} style={isActive(path) ? S.navItemActive : S.navItem} onClick={() => navigate(path)}>
              <Icon size={16} />{label}
            </div>
          ))}

          <div style={{ fontSize: 10, fontWeight: 600, color: '#adb5bd', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 12px 4px' }}>Account</div>

          {NAV_ACCOUNT.map(([Icon, label, path]) => (
            <div key={path} style={isActive(path) ? S.navItemActive : S.navItem} onClick={() => navigate(path)}>
              <Icon size={16} />{label}
            </div>
          ))}

          <div
            style={{ ...S.navItem, color: '#fa5252', marginTop: 4 }}
            onClick={() => { localStorage.clear(); navigate('/login'); }}
          >
            <LogOut size={16} /> Logout
          </div>
        </div>

        {/* User Profile */}
        <div style={{ padding: '12px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
            {user.first_name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.first_name ? `${user.first_name} ${user.last_name}` : 'Patient'}
            </div>
            <div style={{ fontSize: 10, color: '#868e96' }}>Patient ID: #{user.id || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{ background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>{activeLabel}</div>
            <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>
              Welcome back, {user.first_name || 'Patient'}!
            </div>
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

        {/* Page Content */}
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
                userID={`patient_${user.id}`}
                userName={user.first_name ? `${user.first_name} ${user.last_name}` : 'Patient'}
                isVideoCall={activeCall.isVideo}
                onLeave={() => { setActiveCall(null); ringtone.stopAll(); }}
            />
        </div>
      )}
    </div>
  );
}
