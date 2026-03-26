import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CreditCard, BarChart2, Settings, LogOut, Bell, User, Lock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import API from '../../utils/api';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../../components/NotificationPanel';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
  { icon: CreditCard, label: 'Billing', path: '/admin/billing' },
  { icon: BarChart2, label: 'Reports', path: '/admin/reports' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ width: 210, background: '#fff', borderRight: '1px solid #e8eaed', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '18px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: '#3b5bdb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
        <div><div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>MedCare</div><div style={{ fontSize: 11, color: '#868e96' }}>Hospital Management</div></div>
      </div>
      <div style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#adb5bd', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 6px 4px' }}>Admin Panel</div>
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return <div key={path} onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, background: active ? '#e7f0ff' : 'transparent', color: active ? '#3b5bdb' : '#495057' }}><Icon size={16} />{label}</div>;
        })}
      </div>
      <div style={{ padding: '12px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{user.first_name?.[0]?.toUpperCase() || 'A'}</div>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.first_name ? `${user.first_name} ${user.last_name}` : 'Admin'}</div><div style={{ fontSize: 10, color: '#868e96' }}>Administrator</div></div>
        <LogOut size={14} color="#adb5bd" style={{ cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/login'); }} />
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [profile, setProfile] = useState({ first_name: storedUser.first_name || '', last_name: storedUser.last_name || '', phone: storedUser.phone || '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/profile');
        const u = res.data.data.user;
        setProfile({ first_name: u.first_name || '', last_name: u.last_name || '', phone: u.phone || '' });
      } catch (e) { console.error(e); }
    })();
  }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const saveProfile = async () => {
    if (!profile.first_name || !profile.last_name) return showToast('First and last name required', 'error');
    setLoading(true);
    try {
      const res = await API.put('/profile', profile);
      const updated = res.data.data.user;
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updated }));
      showToast('Profile updated successfully');
    } catch (e) { showToast(e.response?.data?.message || 'Update failed', 'error'); }
    setLoading(false);
  };

  const inS = { width: '100%', border: '1px solid #e8eaed', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lS = { fontSize: 12, fontWeight: 600, color: '#495057', display: 'block', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5', fontFamily: "'Inter',-apple-system,sans-serif", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div><div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>Settings</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Manage your account and preferences</div></div>
          <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={markAsRead} onMarkAllRead={markAllRead} onDelete={deleteNotification} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {toast && <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 2000, background: toast.type === 'error' ? '#fa5252' : '#2f9e44', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>{toast.type !== 'error' && <CheckCircle size={15} />}{toast.msg}</div>}

          <div style={{ maxWidth: 680 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#f0f2f5', borderRadius: 10, padding: 4, marginBottom: 28, width: 'fit-content' }}>
              {[['profile', User, 'Profile'], ['security', Lock, 'Security']].map(([key, Icon, label]) => (
                <div key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === key ? '#fff' : 'transparent', color: tab === key ? '#3b5bdb' : '#868e96', boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                  <Icon size={14} />{label}
                </div>
              ))}
            </div>

            {tab === 'profile' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f2f5', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ background: 'linear-gradient(135deg,#3b5bdb 0%,#5c7cfa 100%)', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>{profile.first_name?.[0]?.toUpperCase() || 'A'}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{profile.first_name} {profile.last_name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{storedUser.email}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff', marginTop: 6, display: 'inline-block' }}>Administrator</span>
                  </div>
                </div>
                <div style={{ padding: '28px 32px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Personal Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div><label style={lS}>First Name <span style={{ color: '#fa5252' }}>*</span></label><input id="first_name" name="first_name" value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} style={inS} placeholder="First name" /></div>
                    <div><label style={lS}>Last Name <span style={{ color: '#fa5252' }}>*</span></label><input id="last_name" name="last_name" value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} style={inS} placeholder="Last name" /></div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={lS}>Email Address</label>
                    <input value={storedUser.email || ''} disabled style={{ ...inS, background: '#f8f9fa', color: '#adb5bd', cursor: 'not-allowed' }} />
                    <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 4 }}>Email cannot be changed from this panel</div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={lS}>Phone Number</label>
                    <input id="phone" name="phone" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={inS} placeholder="+9779XXXXXXXXX" />
                    <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 4 }}>Format: +9779XXXXXXXXX</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={saveProfile} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                      <Save size={14} />{loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => { const u = JSON.parse(localStorage.getItem('user') || '{}'); setProfile({ first_name: u.first_name || '', last_name: u.last_name || '', phone: u.phone || '' }); }} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e8eaed', background: '#fff', color: '#495057', fontSize: 13, cursor: 'pointer' }}>Reset</button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f2f5', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '28px 32px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>Change Password</div>
                  <div style={{ fontSize: 13, color: '#868e96', marginBottom: 24 }}>Use a strong password to keep your account secure.</div>
                  {[{ key: 'current', label: 'Current Password', ph: 'Enter current password' }, { key: 'new', label: 'New Password', ph: 'Minimum 6 characters' }, { key: 'confirm', label: 'Confirm New Password', ph: 'Repeat new password' }].map(({ key, label, ph }) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <label style={lS}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <input id={key} name={key} type={showPw[key] ? 'text' : 'password'} value={passwords[key]} onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ ...inS, paddingRight: 40 }} />
                        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}>
                          {showPw[key] ? <EyeOff size={15} color="#adb5bd" /> : <Eye size={15} color="#adb5bd" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Password Requirements</div>
                    {['At least 6 characters long', 'Use a mix of letters and numbers', 'Avoid using personal information'].map(r => (
                      <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#868e96', marginBottom: 3 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#adb5bd' }} />{r}</div>
                    ))}
                  </div>
                  <button onClick={() => { if (!passwords.current || !passwords.new || !passwords.confirm) return showToast('All fields required', 'error'); if (passwords.new !== passwords.confirm) return showToast('Passwords do not match', 'error'); if (passwords.new.length < 6) return showToast('Min 6 characters', 'error'); showToast('Password change requires a dedicated endpoint', 'error'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <Lock size={14} />Update Password
                  </button>
                </div>
                <div style={{ padding: '20px 32px', borderTop: '1px solid #f0f2f5', background: '#fafbfc' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 14 }}>Account Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[{ label: 'Account ID', value: `#${storedUser.id || 'N/A'}` }, { label: 'Role', value: storedUser.role || 'admin' }, { label: 'Email', value: storedUser.email || '—' }, { label: 'Member Since', value: storedUser.created_at ? new Date(storedUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' }].map(({ label, value }) => (
                      <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #f0f2f5' }}>
                        <div style={{ fontSize: 11, color: '#adb5bd', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}