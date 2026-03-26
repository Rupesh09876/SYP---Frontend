import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CreditCard, BarChart2, Settings, LogOut, Bell, Search, Plus, Pencil, Trash2, X, Filter } from 'lucide-react';
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

const STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];
const EMPTY_FORM = { patient_id: '', doctor_id: '', appointment_date: '', status: 'Scheduled', notes: '' };

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f0f2f5' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{title}</div>
          <X size={18} color="#868e96" style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
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

const statusColor = (s = '') => {
  const m = { confirmed: { bg: '#ebfbee', color: '#2f9e44' }, scheduled: { bg: '#e7f5ff', color: '#3b5bdb' }, completed: { bg: '#f0f2f5', color: '#495057' }, cancelled: { bg: '#fff5f5', color: '#fa5252' } };
  return m[s.toLowerCase()] || { bg: '#f0f2f5', color: '#868e96' };
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, dRes, pRes] = await Promise.allSettled([API.get('/appointments'), API.get('/admin/doctors'), API.get('/admin/patients')]);
      if (aRes.status === 'fulfilled') setAppointments(aRes.value.data.data || []);
      if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
      if (pRes.status === 'fulfilled') setPatients(pRes.value.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const doctorMap = {}; doctors.forEach(d => { doctorMap[d.id] = d; });
  const patientMap = {}; patients.forEach(p => { patientMap[p.id] = p; });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const saveAppointment = async () => {
    if (!form.patient_id || !form.doctor_id || !form.appointment_date) return showToast('Fill all required fields', 'error');
    setSaving(true);
    try {
      const payload = { ...form, patient_id: parseInt(form.patient_id), doctor_id: parseInt(form.doctor_id) };
      if (editId) await API.put(`/appointments/${editId}`, payload);
      else await API.post('/appointments', payload);
      showToast(editId ? 'Appointment updated' : 'Appointment created');
      setModal(null); setForm(EMPTY_FORM); setEditId(null); fetchAll();
    } catch (e) { showToast(e.response?.data?.message || 'Failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await API.delete(`/appointments/${confirmDelete.id}`); showToast('Appointment deleted'); fetchAll(); }
    catch (e) { showToast('Delete failed', 'error'); }
    setConfirmDelete(null);
  };

  const filtered = appointments.filter(a => {
    const p = patientMap[a.patient_id];
    const d = doctorMap[a.doctor_id];
    const s = `${p?.first_name || ''} ${p?.last_name || ''} ${d?.first_name || ''} ${d?.last_name || ''} ${a.notes || ''}`.toLowerCase();
    return s.includes(search.toLowerCase()) && (filterStatus === 'All' || (a.status || 'Scheduled') === filterStatus);
  });

  const todayCount = appointments.filter(a => new Date(a.appointment_date).toDateString() === new Date().toDateString()).length;
  const pendingCount = appointments.filter(a => ['scheduled', 'pending'].includes((a.status || '').toLowerCase())).length;
  const completedCount = appointments.filter(a => (a.status || '').toLowerCase() === 'completed').length;

  const inS = { width: '100%', border: '1px solid #e8eaed', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lS = { fontSize: 12, fontWeight: 600, color: '#495057', display: 'block', marginBottom: 5 };
  const thS = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const tdS = { padding: '13px 16px', fontSize: 13, color: '#495057' };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5', fontFamily: "'Inter',-apple-system,sans-serif", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div><div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>Appointments</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Manage all hospital appointments</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={markAsRead} onMarkAllRead={markAllRead} onDelete={deleteNotification} />
            <button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setModal('add'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}><Plus size={14} />New Appointment</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {toast && <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 2000, background: toast.type === 'error' ? '#fa5252' : '#2f9e44', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[{ label: 'Total', value: appointments.length, bg: '#f3f0ff', color: '#7950f2', emoji: '📋' }, { label: "Today's", value: todayCount, bg: '#e7f5ff', color: '#3b5bdb', emoji: '📅' }, { label: 'Pending', value: pendingCount, bg: '#fff9db', color: '#f59f00', emoji: '⏳' }, { label: 'Completed', value: completedCount, bg: '#ebfbee', color: '#2f9e44', emoji: '✅' }].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.emoji}</div>
                <div><div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>{s.label} Appointments</div></div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Filter size={14} color="#868e96" />
              {['All', ...STATUSES].map(s => (
                <div key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filterStatus === s ? '#3b5bdb' : '#f0f2f5', color: filterStatus === s ? '#fff' : '#495057', transition: 'all 0.15s' }}>{s}</div>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#adb5bd" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor..." style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #e8eaed', borderRadius: 8, fontSize: 13, width: 250, outline: 'none', color: '#1a1a2e', background: '#fff' }} />
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f2f5', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {loading ? <div style={{ padding: 60, textAlign: 'center', color: '#adb5bd', fontSize: 13 }}>Loading appointments...</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8f9fa', borderBottom: '2px solid #f0f2f5' }}>{['Patient', 'Doctor', 'Date & Time', 'Status', 'Notes', 'Actions'].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: 50, textAlign: 'center', color: '#adb5bd', fontSize: 13 }}>No appointments found</td></tr>
                    : filtered.map((a, i) => {
                      const p = patientMap[a.patient_id]; const d = doctorMap[a.doctor_id];
                      const apptDate = new Date(a.appointment_date); const sc = statusColor(a.status);
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f8f9fa', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                          <td style={tdS}><div style={{ fontWeight: 600, color: '#1a1a2e' }}>{p ? `${p.first_name} ${p.last_name}` : `Patient #${a.patient_id}`}</div><div style={{ fontSize: 11, color: '#adb5bd' }}>ID: #{a.patient_id}</div></td>
                          <td style={tdS}><div style={{ fontWeight: 500, color: '#1a1a2e' }}>{d ? `Dr. ${d.first_name} ${d.last_name}` : `Doctor #${a.doctor_id}`}</div>{d?.category && <div style={{ fontSize: 11, color: '#adb5bd' }}>{d.category}</div>}</td>
                          <td style={tdS}><div style={{ fontWeight: 500, color: '#1a1a2e' }}>{apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div><div style={{ fontSize: 11, color: '#868e96' }}>{apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div></td>
                          <td style={tdS}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{a.status || 'Scheduled'}</span></td>
                          <td style={{ ...tdS, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes || '—'}</td>
                          <td style={tdS}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => { setForm({ patient_id: String(a.patient_id), doctor_id: String(a.doctor_id), appointment_date: toLocalInput(a.appointment_date), status: a.status || 'Scheduled', notes: a.notes || '' }); setEditId(a.id); setModal('edit'); }} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e8eaed', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} color="#3b5bdb" /></button>
                              <button onClick={() => setConfirmDelete({ id: a.id, name: p ? `${p.first_name} ${p.last_name}` : `Appointment #${a.id}` })} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #ffe3e3', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} color="#fa5252" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#adb5bd', marginTop: 12 }}>Showing {filtered.length} of {appointments.length} appointments</div>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'New Appointment' : 'Edit Appointment'} onClose={() => { setModal(null); setEditId(null); }}>
          <div style={{ marginBottom: 14 }}><label style={lS}>Patient <span style={{ color: '#fa5252' }}>*</span></label><select value={form.patient_id} onChange={e => setF('patient_id', e.target.value)} style={inS}><option value="">Select patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (#{p.id})</option>)}</select></div>
          <div style={{ marginBottom: 14 }}><label style={lS}>Doctor <span style={{ color: '#fa5252' }}>*</span></label><select value={form.doctor_id} onChange={e => setF('doctor_id', e.target.value)} style={inS}><option value="">Select doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} — {d.category} (#{d.id})</option>)}</select></div>
          <div style={{ marginBottom: 14 }}><label style={lS}>Date & Time <span style={{ color: '#fa5252' }}>*</span></label><input type="datetime-local" value={form.appointment_date} onChange={e => setF('appointment_date', e.target.value)} style={inS} /></div>
          <div style={{ marginBottom: 14 }}><label style={lS}>Status</label><select value={form.status} onChange={e => setF('status', e.target.value)} style={inS}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div style={{ marginBottom: 16 }}><label style={lS}>Notes</label><textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={3} placeholder="Optional notes..." style={{ ...inS, resize: 'vertical', fontFamily: 'inherit' }} /></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => { setModal(null); setEditId(null); }} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e8eaed', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#495057' }}>Cancel</button>
            <button onClick={saveAppointment} disabled={saving} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#3b5bdb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : modal === 'add' ? 'Create Appointment' : 'Save Changes'}</button>
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmModal message={`Delete appointment for ${confirmDelete.name}? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}