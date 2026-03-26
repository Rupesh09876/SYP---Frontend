import { useEffect, useState } from 'react';
import { User, Mail, Phone, Shield, CheckCircle, Loader } from 'lucide-react';
import PatientLayout from './PatientLayout';
import API from '../../utils/api';

const S = {
  panel: { background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #dee2e6', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  label: { fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 5, display: 'block' },
};

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile');
      const d = res.data.data;
      setProfile(d);
      setForm({ first_name: d.first_name || '', last_name: d.last_name || '', phone: d.phone || '' });
      localStorage.setItem('user', JSON.stringify({ ...d, role: d.role || 'patient' }));
    } catch { showToast('Failed to load profile', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) { showToast('First and last name are required', 'error'); return; }
    setSaving(true);
    try {
      await API.put('/profile', form);
      showToast('Profile updated successfully!');
      setIsEditing(false); fetchProfile();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };



  return (
    <PatientLayout activeLabel="My Profile">
      <div style={{ padding: '24px 28px', fontFamily: "'Inter', sans-serif" }}>

        {toast && (
          <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 10, background: toast.type === 'error' ? '#fa5252' : '#2f9e44', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} /> {toast.msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

          {/* Main Card */}
          <div style={{ ...S.panel, padding: 0, overflow: 'hidden' }}>
            {/* Cover */}
            <div style={{ height: 90, background: 'linear-gradient(135deg, #3b5bdb, #4c6ef5)' }}>
              <div style={{ position: 'relative', display: 'inline-block', top: 50, left: 28 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', padding: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 800 }}>
                    {profile?.first_name?.[0]?.toUpperCase() || 'P'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '52px 28px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>{profile?.first_name || 'Loading...'} {profile?.last_name || ''}</div>
                  <div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>Patient ID: #{profile?.id || '...'}</div>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', background: '#f0f2f5', border: '1px solid #dee2e6', borderRadius: 8, color: '#495057', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { icon: User, label: 'First Name', value: profile?.first_name },
                    { icon: User, label: 'Last Name', value: profile?.last_name },
                    { icon: Mail, label: 'Email', value: profile?.email },
                    { icon: Phone, label: 'Phone', value: profile?.phone || 'Not provided' },
                  ].map((f, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #f0f2f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#868e96', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        <f.icon size={12} /> {f.label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{f.value || '—'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: 'span 2', padding: '10px 12px', background: '#e7f0ff', borderRadius: 8, fontSize: 12, color: '#3b5bdb' }}>
                    Email cannot be changed.
                  </div>
                  <div><label style={S.label}>First Name *</label><input id="first_name" name="first_name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} style={S.input} /></div>
                  <div><label style={S.label}>Last Name *</label><input id="last_name" name="last_name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} style={S.input} /></div>
                  <div><label style={S.label}>Email</label><input value={profile?.email || ''} disabled style={{ ...S.input, background: '#f8f9fa', color: '#adb5bd' }} /></div>
                  <div><label style={S.label}>Phone</label><input id="phone" name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+9779XXXXXXXXX" style={S.input} /></div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '9px', background: '#f0f2f5', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, color: '#495057', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={saving} style={{ flex: 1, padding: '9px', background: '#3b5bdb', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1 }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Side Card */}
          <div style={S.panel}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} color="#3b5bdb" /> Account Info
            </div>
            {[
              { label: 'Role', value: profile?.role, badge: true },
              { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' },
              { label: 'Account Level', value: 'Standard' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f8f9fa' : 'none' }}>
                <span style={{ fontSize: 13, color: '#868e96' }}>{item.label}</span>
                {item.badge ? (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: '#ebfbee', color: '#2f9e44', textTransform: 'capitalize' }}>{item.value || 'patient'}</span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{item.value}</span>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </PatientLayout>
  );
}
