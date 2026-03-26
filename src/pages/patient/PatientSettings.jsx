import { useState } from 'react';
import { Lock, Bell, Eye, EyeOff, CheckCircle, Palette } from 'lucide-react';
import PatientLayout from './PatientLayout';
import API from '../../utils/api';

const S = {
  panel: { background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #dee2e6', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  label: { fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 5, display: 'block' },
  btn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none' },
};

const TABS = [
  { key: 'security', icon: Lock, label: 'Security' },
  { key: 'notifs', icon: Bell, label: 'Notifications' },
  { key: 'prefs', icon: Palette, label: 'Preferences' },
];

export default function PatientSettings() {
  const [tab, setTab] = useState('security');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [notifs, setNotifs] = useState({ appointments: true, reports: true, reminders: true, email: false });
  const [prefs, setPrefs] = useState({ language: 'English', timezone: 'Asia/Kathmandu', dateFormat: 'MM/DD/YYYY' });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const strength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const s = strength(pw.new);
  const strengthColor = ['#f0f2f5', '#fa5252', '#f59f00', '#40c057', '#2f9e44'][s];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][s];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pw.current || !pw.new || !pw.confirm) { showToast('All fields are required', 'error'); return; }
    if (pw.new !== pw.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (pw.new.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setSaving(true);
    try {
      await API.put('/profile', { password: pw.new, current_password: pw.current });
      showToast('Password changed successfully!');
      setPw({ current: '', new: '', confirm: '' });
    } catch (err) { showToast(err.response?.data?.message || 'Failed to change password', 'error'); }
    finally { setSaving(false); }
  };

  const PwField = ({ label, field }) => (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input id={field} name={field} type={showPw[field] ? 'text' : 'password'} value={pw[field]} onChange={e => setPw(p => ({ ...p, [field]: e.target.value }))} style={{ ...S.input, paddingRight: 36 }} />
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#868e96' }}>
          {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <PatientLayout activeLabel="Settings">
      <div style={{ padding: '24px 28px', fontFamily: "'Inter', sans-serif" }}>

        {toast && (
          <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 10, background: toast.type === 'error' ? '#fa5252' : '#2f9e44', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} /> {toast.msg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 20 }}>
          {/* Sidebar Tabs */}
          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={S.panel}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: tab === t.key ? '#3b5bdb' : 'transparent', color: tab === t.key ? '#fff' : '#495057', fontSize: 13, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', marginBottom: 3 }}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>

            {/* Security Tab */}
            {tab === 'security' && (
              <div style={S.panel}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>Change Password</div>
                <div style={{ fontSize: 13, color: '#868e96', marginBottom: 22 }}>Update your account password to keep it secure</div>
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 440 }}>
                  <PwField label="Current Password" field="current" />
                  <PwField label="New Password" field="new" />
                  {pw.new && (
                    <div>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= s ? strengthColor : '#f0f2f5', transition: 'background 0.2s' }} />)}
                      </div>
                      {strengthLabel && <div style={{ fontSize: 11, fontWeight: 600, color: strengthColor }}>{strengthLabel}</div>}
                    </div>
                  )}
                  <PwField label="Confirm New Password" field="confirm" />
                  {pw.new && pw.confirm && pw.new !== pw.confirm && (
                    <div style={{ fontSize: 12, color: '#fa5252' }}>Passwords do not match</div>
                  )}
                  <button type="submit" disabled={saving} style={{ ...S.btn, background: '#3b5bdb', color: '#fff', width: 'fit-content', opacity: saving ? 0.8 : 1 }}>
                    {saving ? 'Saving...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifs' && (
              <div style={S.panel}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>Notification Preferences</div>
                <div style={{ fontSize: 13, color: '#868e96', marginBottom: 22 }}>Choose how you want to be notified</div>
                {[
                  { key: 'appointments', label: 'Appointment Updates', desc: 'Confirmations, cancellations, and changes' },
                  { key: 'reports', label: 'New Reports', desc: 'When your doctor uploads a medical report' },
                  { key: 'reminders', label: 'Reminders', desc: 'Upcoming appointment and health reminders' },
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email as well' },
                ].map(n => (
                  <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f8f9fa' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>{n.desc}</div>
                    </div>
                    <div onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} style={{ width: 40, height: 22, borderRadius: 11, background: notifs[n.key] ? '#3b5bdb' : '#dee2e6', cursor: 'pointer', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifs[n.key] ? '21px' : '3px', transition: 'left 0.2s' }} />
                    </div>
                  </div>
                ))}
                <button onClick={() => showToast('Notification preferences saved!')} style={{ ...S.btn, background: '#3b5bdb', color: '#fff', marginTop: 16 }}>Save Preferences</button>
              </div>
            )}

            {/* Preferences Tab */}
            {tab === 'prefs' && (
              <div style={S.panel}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>General Preferences</div>
                <div style={{ fontSize: 13, color: '#868e96', marginBottom: 22 }}>Customize your account experience</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 440 }}>
                  {[
                    { label: 'Language', key: 'language', options: ['English', 'Nepali', 'Hindi'] },
                    { label: 'Timezone', key: 'timezone', options: ['Asia/Kathmandu', 'UTC', 'Asia/Kolkata'] },
                    { label: 'Date Format', key: 'dateFormat', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={S.label}>{f.label}</label>
                      <select value={prefs[f.key]} onChange={e => setPrefs(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...S.input, appearance: 'none', cursor: 'pointer' }}>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={() => showToast('Preferences saved!')} style={{ ...S.btn, background: '#3b5bdb', color: '#fff', width: 'fit-content' }}>Save Preferences</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
