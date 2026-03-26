import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Shield, Save, Bell,
  Globe, Clock, Mail, Phone, ChevronRight,
  CheckCircle2, AlertCircle, Trash2
} from 'lucide-react';
import API from '../../utils/api';
import DoctorLayout from './DoctorLayout';

const TabItem = ({ id, label, icon: Icon, active, onClick }) => (
  <div
    onClick={() => onClick(id)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: active ? 'rgba(59, 91, 219, 0.1)' : 'transparent',
      color: active ? '#3b5bdb' : '#495057',
      fontWeight: active ? 700 : 500,
      marginBottom: 4
    }}
  >
    <Icon size={18} />
    <span style={{ fontSize: 14 }}>{label}</span>
    {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#3b5bdb' }} />}
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{children}</h3>
    <p style={{ fontSize: 13, color: '#868e96', margin: '4px 0 0 0' }}>{sub}</p>
  </div>
);

const Toggle = ({ active, onToggle }) => (
  <div
    onClick={onToggle}
    style={{
      width: 44,
      height: 24,
      borderRadius: 12,
      background: active ? '#3b5bdb' : '#dee2e6',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.3s'
    }}
  >
    <div style={{
      position: 'absolute',
      top: 3,
      left: active ? 23 : 3,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }} />
  </div>
);

export default function DoctorSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', phone: '', specialization: '', bio: '', availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '09:00', endTime: '17:00' } });
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, sms: false, browser: true });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await API.get('/profile');
        const u = r.data.user || r.data.data || r.data;
        setProfile({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          email: u.email || '',
          phone: u.phone || '',
          specialization: 'Senior Physician',
          bio: 'Experienced in general medicine and patient care for over 10 years.',
          availability: u.availability || { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '09:00', endTime: '17:00' }
        });
      } catch {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setProfile({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          email: u.email || '',
          phone: u.phone || '',
          specialization: 'Senior Physician',
          bio: 'Experienced in general medicine and patient care for over 10 years.',
          availability: u.availability || { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '09:00', endTime: '17:00' }
        });
      }
    })();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/profile', profile);
      showToast('Settings updated successfully!');
    } catch {
      showToast('Failed to update settings');
    }
    setSaving(false);
  };

  return (
    <DoctorLayout activeLabel="Account Settings" activePath="/doctor/settings">
      <div style={{
        padding: '24px 28px',
        background: '#f8f9fa',
        minHeight: 'calc(100vh - 84px)',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, maxWidth: 1100, margin: '0 auto' }}>

          {/* Navigation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <TabItem id="profile" label="Profile Info" icon={User} active={activeTab === 'profile'} onClick={setActiveTab} />
              <TabItem id="security" label="Security" icon={Shield} active={activeTab === 'security'} onClick={setActiveTab} />
              <TabItem id="notifications" label="Notifications" icon={Bell} active={activeTab === 'notifications'} onClick={setActiveTab} />
              <TabItem id="preferences" label="Preferences" icon={Clock} active={activeTab === 'preferences'} onClick={setActiveTab} />
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 100%)',
              padding: '20px',
              borderRadius: '16px',
              color: '#fff',
              marginTop: 16
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>Need Help?</div>
              <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.5, opacity: 0.8 }}>Contact our support for any account issues or feedback.</div>
              <button style={{
                marginTop: 12,
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}>Support Center</button>
            </div>
          </div>

          {/* Content Area */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
            position: 'relative'
          }}>
            {activeTab === 'profile' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <SectionTitle sub="Manage your professional profile and contact details">Personal Information</SectionTitle>


                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>First Name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      style={S.input}
                      value={profile.first_name}
                      onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Last Name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      style={S.input}
                      value={profile.last_name}
                      onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Specialization</label>
                    <input
                      id="specialization"
                      name="specialization"
                      style={S.input}
                      value={profile.specialization}
                      onChange={e => setProfile({ ...profile, specialization: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      style={S.input}
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Professional Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      style={{ ...S.input, height: 100, resize: 'none' }}
                      value={profile.bio}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: '#3b5bdb',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(59, 91, 219, 0.25)'
                    }}
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <SectionTitle sub="Keep your account secure with a strong password">Security Settings</SectionTitle>

                <div style={{ background: '#fff9db', padding: '16px', borderRadius: '12px', border: '1px solid #ffec99', display: 'flex', gap: 12, marginBottom: 32 }}>
                  <AlertCircle size={20} color="#f59f00" />
                  <div style={{ fontSize: 13, color: '#855e00', lineHeight: 1.5 }}>
                    Last password change was 6 months ago. We recommend changing it periodically.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Current Password</label>
                    <input id="current-password" name="current-password" type="password" style={S.input} placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>New Password</label>
                    <input id="new-password" name="new-password" type="password" style={S.input} placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Confirm New Password</label>
                    <input id="confirm-password" name="confirm-password" type="password" style={S.input} placeholder="••••••••" />
                  </div>
                  <button style={{
                    marginTop: 8,
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>Update Password</button>
                </div>

                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #f1f3f5' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fa5252' }}>Danger Zone</div>
                  <div style={{ fontSize: 12, color: '#868e96', marginTop: 4, marginBottom: 16 }}>Once you delete your account, there is no going back. Please be certain.</div>
                  <button style={{
                    background: '#fff',
                    color: '#fa5252',
                    border: '1px solid #ffc9c9',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <Trash2 size={16} /> Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <SectionTitle sub="Control which alerts you want to receive">Notification Preferences</SectionTitle>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {[
                    { id: 'email', title: 'Email Notifications', desc: 'Receive appointment requests and reports via email.', icon: Mail },
                    { id: 'sms', title: 'SMS Notifications', desc: 'Get urgent alerts and reminders on your phone.', icon: Phone },
                    { id: 'browser', title: 'Browser Push', desc: 'In-app real-time notifications for patient messages.', icon: Globe }
                  ].map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', border: '1px solid #f1f3f5' }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <item.icon size={20} color="#3b5bdb" />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>{item.desc}</div>
                        </div>
                      </div>
                      <Toggle active={notifs[item.id]} onToggle={() => setNotifs({ ...notifs, [item.id]: !notifs[item.id] })} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <SectionTitle sub="Customize your system and consultation settings">System Preferences</SectionTitle>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Default Language</label>
                    <select id="language" name="language" style={S.input}>
                      <option>English (US)</option>
                      <option>Nepali</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#495057', marginBottom: 8 }}>Timezone</label>
                    <select id="timezone" name="timezone" style={S.input}>
                      <option>Nepal (GMT+5:45)</option>
                      <option>UTC (GMT+0)</option>
                      <option>Pacific Time (GMT-8)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2', padding: '20px', borderRadius: '16px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>Consultation Hours</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <input id="startTime" name="startTime" type="time" style={{ ...S.input, width: 'auto' }} value={profile.availability?.startTime || '09:00'} onChange={e => setProfile({ ...profile, availability: { ...profile.availability, startTime: e.target.value } })} />
                      <span style={{ fontSize: 14, color: '#adb5bd' }}>to</span>
                      <input id="endTime" name="endTime" type="time" style={{ ...S.input, width: 'auto' }} value={profile.availability?.endTime || '17:00'} onChange={e => setProfile({ ...profile, availability: { ...profile.availability, endTime: e.target.value } })} />
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d, i) => {
                          const isSelected = profile.availability?.days?.includes(d);
                          return (
                            <div key={i} onClick={() => {
                              const days = profile.availability?.days || [];
                              const newDays = isSelected ? days.filter(day => day !== d) : [...days, d];
                              setProfile({ ...profile, availability: { ...profile.availability, days: newDays } });
                            }} style={{
                              width: 28,
                              height: 28,
                              borderRadius: '6px',
                              background: isSelected ? '#3b5bdb' : '#dee2e6',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}>{d[0]}</div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {toast && (
              <div style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#333',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                animation: 'slideUp 0.3s ease-out'
              }}>
                <CheckCircle2 size={18} color="#2f9e44" />
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { bottom: 0; opacity: 0; }
                    to { bottom: 24; opacity: 1; }
                }
                input:focus, textarea:focus, select:focus {
                    border-color: #3b5bdb !important;
                    box-shadow: 0 0 0 4px rgba(59, 91, 219, 0.1) !important;
                }
            `}</style>
    </DoctorLayout>
  );
}

const S = {
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    fontSize: 14,
    fontWeight: 500,
    color: '#1a1a2e',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#fff'
  }
};