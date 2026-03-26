import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CreditCard, BarChart2, Settings, LogOut, Bell, Search, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
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
          return (
            <div key={path} onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, background: active ? '#e7f0ff' : 'transparent', color: active ? '#3b5bdb' : '#495057' }}>
              <Icon size={16} />{label}
            </div>
          );
        })}
      </div>
      <div style={{ padding: '12px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{user.first_name?.[0]?.toUpperCase() || 'A'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.first_name ? `${user.first_name} ${user.last_name}` : 'Admin'}</div>
          <div style={{ fontSize: 10, color: '#868e96' }}>Administrator</div>
        </div>
        <LogOut size={14} color="#adb5bd" style={{ cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/login'); }} />
      </div>
    </div>
  );
}

const CATEGORIES = ['Dermatologist', 'Endocrinologist', 'Neurologist', 'Oncologist', 'Psychiatrist', 'Pulmonologist', 'Cardiologist', 'General Physician'];
const EMPTY_DOCTOR = { first_name: '', last_name: '', email: '', password: '', phone: '', address: '', category: '' };
const EMPTY_PATIENT = { first_name: '', last_name: '', phone: '' };

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, width: 490, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f0f2f5' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{title}</div>
          <X size={18} color="#868e96" style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, options, placeholder, required }) {
  const [show, setShow] = useState(false);
  const base = { width: '100%', border: '1px solid #e8eaed', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 5 }}>{label}{required && <span style={{ color: '#fa5252' }}> *</span>}</div>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base}>
          <option value="">Select {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'password' ? (
        <div style={{ position: 'relative' }}>
          <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} style={{ ...base, paddingRight: 38 }} />
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} onClick={() => setShow(s => !s)}>
            {show ? <EyeOff size={15} color="#adb5bd" /> : <Eye size={15} color="#adb5bd" />}
          </div>
        </div>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} style={base} />
      )}
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Confirm Delete</div>
        <div style={{ fontSize: 13, color: '#495057', marginBottom: 24, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e8eaed', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#fa5252', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [tab, setTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR);
  const [patientForm, setPatientForm] = useState(EMPTY_PATIENT);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.allSettled([API.get('/admin/doctors'), API.get('/admin/patients')]);
      if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
      if (pRes.status === 'fulfilled') setPatients(pRes.value.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const setDF = (k, v) => setDoctorForm(f => ({ ...f, [k]: v }));
  const setPF = (k, v) => setPatientForm(f => ({ ...f, [k]: v }));

  const saveDoctor = async () => {
    if (!doctorForm.first_name || !doctorForm.last_name || !doctorForm.email || !doctorForm.category) return showToast('Fill all required fields', 'error');
    if (!editId && !doctorForm.password) return showToast('Password is required', 'error');
    setSaving(true);
    try {
      if (editId) await API.put(`/admin/doctors/${editId}`, doctorForm);
      else await API.post('/admin/doctors', doctorForm);
      showToast(editId ? 'Doctor updated' : 'Doctor added');
      setModal(null); setDoctorForm(EMPTY_DOCTOR); setEditId(null); fetchData();
    } catch (e) { showToast(e.response?.data?.message || 'Failed', 'error'); }
    setSaving(false);
  };

  const savePatient = async () => {
    if (!patientForm.first_name || !patientForm.last_name) return showToast('Name fields required', 'error');
    setSaving(true);
    try {
      await API.put(`/admin/patients/${editId}`, patientForm);
      showToast('Patient updated');
      setModal(null); setPatientForm(EMPTY_PATIENT); setEditId(null); fetchData();
    } catch (e) { showToast(e.response?.data?.message || 'Failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      if (confirmDelete.type === 'doctor') await API.delete(`/admin/doctors/${confirmDelete.id}`);
      else await API.delete(`/admin/patients/${confirmDelete.id}`);
      showToast('Deleted successfully'); fetchData();
    } catch (e) { showToast('Delete failed', 'error'); }
    setConfirmDelete(null);
  };

  const filteredDoctors = doctors.filter(d => `${d.first_name} ${d.last_name} ${d.email} ${d.category || ''}`.toLowerCase().includes(search.toLowerCase()));
  const filteredPatients = patients.filter(p => `${p.first_name} ${p.last_name} ${p.email} ${p.phone || ''}`.toLowerCase().includes(search.toLowerCase()));
  const thS = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const tdS = { padding: '13px 16px', fontSize: 13, color: '#495057' };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5', fontFamily: "'Inter',-apple-system,sans-serif", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{ background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>User Management</div>
            <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Manage all doctors and patients</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={markAsRead} onMarkAllRead={markAllRead} onDelete={deleteNotification} />
            {tab === 'doctors' && (
              <button onClick={() => { setDoctorForm(EMPTY_DOCTOR); setEditId(null); setModal('add-doctor'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                <Plus size={14} /> Add Doctor
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {toast && <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 2000, background: toast.type === 'error' ? '#fa5252' : '#2f9e44', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}

          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            {[{ label: 'Total Doctors', value: doctors.length, bg: '#e7f5ff', color: '#3b5bdb', emoji: '🩺' }, { label: 'Total Patients', value: patients.length, bg: '#ebfbee', color: '#2f9e44', emoji: '👥' }, { label: 'Total Users', value: doctors.length + patients.length, bg: '#f3f0ff', color: '#7950f2', emoji: '📊' }].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.emoji}</div>
                <div><div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>{s.label}</div></div>
              </div>
            ))}
          </div>

          {/* Tabs + Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 4, background: '#f0f2f5', borderRadius: 10, padding: 4 }}>
              {['doctors', 'patients'].map(t => (
                <div key={t} onClick={() => { setTab(t); setSearch(''); }} style={{ padding: '8px 22px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#3b5bdb' : '#868e96', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                  {t} ({t === 'doctors' ? doctors.length : patients.length})
                </div>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#adb5bd" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}...`}
                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #e8eaed', borderRadius: 8, fontSize: 13, width: 250, outline: 'none', color: '#1a1a2e', background: '#fff' }} />
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f2f5', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {loading ? <div style={{ padding: 60, textAlign: 'center', color: '#adb5bd', fontSize: 13 }}>Loading data...</div>
              : tab === 'doctors' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8f9fa', borderBottom: '2px solid #f0f2f5' }}>{['Doctor', 'Email', 'Specialty', 'Phone', 'Address', 'Actions'].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredDoctors.length === 0 ? <tr><td colSpan={6} style={{ padding: 50, textAlign: 'center', color: '#adb5bd', fontSize: 13 }}>No doctors found</td></tr>
                      : filteredDoctors.map((d, i) => (
                        <tr key={d.id} style={{ borderBottom: '1px solid #f8f9fa', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                          <td style={tdS}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e7f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#3b5bdb', flexShrink: 0 }}>{d.first_name[0]}{d.last_name[0]}</div>
                              <div><div style={{ fontWeight: 600, color: '#1a1a2e' }}>Dr. {d.first_name} {d.last_name}</div><div style={{ fontSize: 11, color: '#adb5bd' }}>ID: #{d.id}</div></div>
                            </div>
                          </td>
                          <td style={tdS}>{d.email}</td>
                          <td style={tdS}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#e7f5ff', color: '#3b5bdb' }}>{d.category || '—'}</span></td>
                          <td style={tdS}>{d.phone || '—'}</td>
                          <td style={{ ...tdS, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.address || '—'}</td>
                          <td style={tdS}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => { setDoctorForm({ first_name: d.first_name, last_name: d.last_name, email: d.email, password: '', phone: d.phone || '', address: d.address || '', category: d.category || '' }); setEditId(d.id); setModal('edit-doctor'); }} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e8eaed', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} color="#3b5bdb" /></button>
                              <button onClick={() => setConfirmDelete({ type: 'doctor', id: d.id, name: `Dr. ${d.first_name} ${d.last_name}` })} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #ffe3e3', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color="#fa5252" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8f9fa', borderBottom: '2px solid #f0f2f5' }}>{['Patient', 'Email', 'Phone', 'Joined', 'Actions'].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredPatients.length === 0 ? <tr><td colSpan={5} style={{ padding: 50, textAlign: 'center', color: '#adb5bd', fontSize: 13 }}>No patients found</td></tr>
                      : filteredPatients.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f8f9fa', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                          <td style={tdS}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ebfbee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#2f9e44', flexShrink: 0 }}>{p.first_name[0]}{p.last_name[0]}</div>
                              <div><div style={{ fontWeight: 600, color: '#1a1a2e' }}>{p.first_name} {p.last_name}</div><div style={{ fontSize: 11, color: '#adb5bd' }}>ID: #{p.id}</div></div>
                            </div>
                          </td>
                          <td style={tdS}>{p.email}</td>
                          <td style={tdS}>{p.phone || '—'}</td>
                          <td style={tdS}>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td style={tdS}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => { setPatientForm({ first_name: p.first_name, last_name: p.last_name, phone: p.phone || '' }); setEditId(p.id); setModal('edit-patient'); }} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e8eaed', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} color="#3b5bdb" /></button>
                              <button onClick={() => setConfirmDelete({ type: 'patient', id: p.id, name: `${p.first_name} ${p.last_name}` })} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #ffe3e3', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color="#fa5252" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      </div>

      {(modal === 'add-doctor' || modal === 'edit-doctor') && (
        <Modal title={modal === 'add-doctor' ? 'Add New Doctor' : 'Edit Doctor'} onClose={() => { setModal(null); setEditId(null); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="First Name" value={doctorForm.first_name} onChange={v => setDF('first_name', v)} required />
            <Field label="Last Name" value={doctorForm.last_name} onChange={v => setDF('last_name', v)} required />
          </div>
          <Field label="Email" type="email" value={doctorForm.email} onChange={v => setDF('email', v)} required />
          {modal === 'add-doctor' && <Field label="Password" type="password" value={doctorForm.password} onChange={v => setDF('password', v)} required placeholder="Minimum 6 characters" />}
          <Field label="Specialty / Category" type="select" value={doctorForm.category} onChange={v => setDF('category', v)} options={CATEGORIES} required />
          <Field label="Phone" value={doctorForm.phone} onChange={v => setDF('phone', v)} placeholder="+9779XXXXXXXXX" />
          <Field label="Address" value={doctorForm.address} onChange={v => setDF('address', v)} placeholder="Hospital / clinic address" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => { setModal(null); setEditId(null); }} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e8eaed', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#495057' }}>Cancel</button>
            <button onClick={saveDoctor} disabled={saving} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : modal === 'add-doctor' ? 'Add Doctor' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'edit-patient' && (
        <Modal title="Edit Patient" onClose={() => { setModal(null); setEditId(null); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="First Name" value={patientForm.first_name} onChange={v => setPF('first_name', v)} required />
            <Field label="Last Name" value={patientForm.last_name} onChange={v => setPF('last_name', v)} required />
          </div>
          <Field label="Phone" value={patientForm.phone} onChange={v => setPF('phone', v)} placeholder="+9779XXXXXXXXX" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => { setModal(null); setEditId(null); }} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e8eaed', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#495057' }}>Cancel</button>
            <button onClick={savePatient} disabled={saving} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {confirmDelete && <ConfirmModal message={`Delete ${confirmDelete.name}? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}