import { useEffect, useState } from 'react';
import {
  Calendar, Clock, Plus, X, ChevronDown, Search,
  CheckCircle, AlertCircle, XCircle, Loader, MoreVertical
} from 'lucide-react';
import PatientLayout from './PatientLayout';
import API from '../../utils/api';

const S = {
  panel: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
  btn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #dee2e6', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'Inter, sans-serif' },
  label: { fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 5, display: 'block' },
};

const STATUS_CONFIG = {
  pending: { bg: '#fff9db', color: '#f59f00', label: 'Pending' },
  scheduled: { bg: '#e7f5ff', color: '#1971c2', label: 'Scheduled' },
  confirmed: { bg: '#ebfbee', color: '#2f9e44', label: 'Confirmed' },
  completed: { bg: '#f3f0ff', color: '#6741d9', label: 'Completed' },
  cancelled: { bg: '#fff5f5', color: '#c92a2a', label: 'Cancelled' },
};

function getStatus(s) {
  return STATUS_CONFIG[(s || '').toLowerCase()] || { bg: '#f0f2f5', color: '#868e96', label: s || 'Unknown' };
}

export default function PatientAppointments() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ doctor_id: '', appointment_date: '', notes: '' });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchAll = async () => {
    try {
      const [aRes, dRes] = await Promise.allSettled([API.get('/appointments'), API.get('/doctors')]);
      if (aRes.status === 'fulfilled') setAppointments(aRes.value.data.data || []);
      if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const myAppointments = user.id ? appointments.filter(a => a.patient_id === user.id) : appointments;
  const doctorMap = {};
  doctors.forEach(d => { doctorMap[d.id] = d; });

  const tabs = ['all', 'pending', 'scheduled', 'confirmed', 'completed', 'cancelled'];
  let filtered = filter === 'all' ? myAppointments : myAppointments.filter(a => (a.status || '').toLowerCase() === filter);
  if (search) filtered = filtered.filter(a => {
    const d = doctorMap[a.doctor_id];
    const dn = d ? `${d.first_name} ${d.last_name}` : '';
    return (a.notes || '').toLowerCase().includes(search.toLowerCase()) || dn.toLowerCase().includes(search.toLowerCase());
  });
  filtered = [...filtered].sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

  const handleBook = async () => {
    if (!form.doctor_id || !form.appointment_date) { showToast('Please select a doctor and date', 'error'); return; }
    setSubmitting(true);
    try {
      await API.post('/appointments', { ...form, doctor_id: parseInt(form.doctor_id), patient_id: user.id, status: 'Pending' });
      showToast('Appointment booked! Awaiting doctor confirmation.');
      setShowModal(false); setForm({ doctor_id: '', appointment_date: '', notes: '' }); fetchAll();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to book', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setActionId(id);
    try { await API.put(`/appointments/${id}`, { status: 'Cancelled' }); showToast('Appointment cancelled.'); fetchAll(); }
    catch { showToast('Failed to cancel', 'error'); }
    finally { setActionId(null); }
  };

  const handleConfirm = async (id) => {
    setActionId(id);
    try { await API.put(`/appointments/${id}`, { status: 'Confirmed' }); showToast('Appointment confirmed!'); fetchAll(); }
    catch { showToast('Failed to confirm', 'error'); }
    finally { setActionId(null); }
  };



  return (
    <PatientLayout activeLabel="Appointments">
      <div style={{ padding: '24px 28px', fontFamily: "'Inter', sans-serif" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 10, background: toast.type === 'error' ? '#fa5252' : '#2f9e44', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            {toast.msg}
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#adb5bd" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input id="appt-search" name="appt-search" style={{ ...S.input, paddingLeft: 30, width: 240 }} placeholder="Search appointments..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#3b5bdb', color: '#fff' }}>
            <Plus size={15} /> Book Appointment
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === tab ? '#3b5bdb' : '#f0f2f5', color: filter === tab ? '#fff' : '#495057', textTransform: 'capitalize' }}>
              {tab === 'all' ? 'All' : STATUS_CONFIG[tab]?.label || tab} ({tab === 'all' ? myAppointments.length : myAppointments.filter(a => (a.status || '').toLowerCase() === tab).length})
            </button>
          ))}
        </div>

        {/* Appointments list */}
        {filtered.length === 0 ? (
          <div style={{ ...S.panel, textAlign: 'center', padding: '48px', color: '#adb5bd' }}>
            <Calendar size={40} style={{ opacity: 0.3, margin: '0 auto 10px', display: 'block' }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No appointments found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{filter === 'all' ? 'Book your first appointment to get started' : `No ${filter} appointments`}</div>
          </div>
        ) : (
          filtered.map(a => {
            const sc = getStatus(a.status);
            const d = doctorMap[a.doctor_id];
            const doctorName = d ? `Dr. ${d.first_name} ${d.last_name}` : `Doctor #${a.doctor_id}`;
            const doctorSpec = d?.category || '';
            const apptDate = new Date(a.appointment_date);
            const isPast = apptDate < new Date();
            const statusLower = (a.status || '').toLowerCase();
            const canCancel = !isPast && !['cancelled', 'completed'].includes(statusLower);
            const canConfirm = !isPast && statusLower === 'scheduled';

            return (
              <div key={a.id} style={{ ...S.panel, display: 'flex', gap: 16, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 48, textAlign: 'center', background: '#f8f9fa', border: '1px solid #e8eaed', borderRadius: 8, padding: '8px 6px', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{apptDate.getDate()}</div>
                  <div style={{ fontSize: 10, color: '#868e96', marginTop: 2 }}>{apptDate.toLocaleString('default', { month: 'short' })}</div>
                  <div style={{ fontSize: 10, color: '#adb5bd' }}>{apptDate.getFullYear()}</div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{a.notes || 'General Consultation'}</div>
                      <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>{doctorName}{doctorSpec ? ` — ${doctorSpec}` : ''}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, flexShrink: 0 }}>{sc.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#868e96', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />{apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontSize: 11, color: '#adb5bd' }}>#{a.id}</span>
                  </div>

                  {statusLower === 'pending' && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: '#fff9db', borderRadius: 6, fontSize: 11, color: '#e67700', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={11} /> Awaiting doctor confirmation
                    </div>
                  )}
                  {statusLower === 'scheduled' && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: '#e7f5ff', borderRadius: 6, fontSize: 11, color: '#1971c2', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={11} /> Doctor approved — please confirm your attendance
                    </div>
                  )}
                  {statusLower === 'confirmed' && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: '#ebfbee', borderRadius: 6, fontSize: 11, color: '#2f9e44', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={11} /> Appointment confirmed — please arrive on time
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                  {canConfirm && (
                    <button onClick={() => handleConfirm(a.id)} disabled={actionId === a.id} style={{ ...S.btn, background: '#ebfbee', color: '#2f9e44', border: '1px solid #b2f2bb', padding: '7px 12px' }}>
                      {actionId === a.id ? <Loader size={12} /> : <CheckCircle size={12} />} Confirm
                    </button>
                  )}
                  {canCancel && (
                    <button onClick={() => handleCancel(a.id)} disabled={actionId === a.id} style={{ ...S.btn, background: '#fff5f5', color: '#c92a2a', border: '1px solid #ffc9c9', padding: '7px 12px' }}>
                      {actionId === a.id ? <Loader size={12} /> : <XCircle size={12} />} Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BOOKING MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e' }}>Book New Appointment</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#868e96" /></button>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
                              <div>
                <label style={S.label}>Select Doctor *</label>
                <div style={{ position: 'relative' }}>
                  <select id="doctor_id" name="doctor_id" value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} style={{ ...S.input, appearance: 'none', paddingRight: 30 }}>
                    <option value="">Choose a doctor...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} — {d.category}</option>)}
                  </select>
                  <ChevronDown size={14} color="#adb5bd" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
                {form.doctor_id && (() => {
                  const doc = doctors.find(d => d.id === parseInt(form.doctor_id));
                  const avail = doc?.availability;
                  if (!avail) return null;
                  return (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fff4', borderRadius: 8, fontSize: 12, color: '#2f9e44', border: '1px solid #b2f2bb' }}>
                      <strong>Available:</strong> {(avail.days || []).join(', ')} &bull; {avail.startTime || '09:00'} – {avail.endTime || '17:00'}
                    </div>
                  );
                })()}
              </div>
              <div>
                <label style={S.label}>Date & Time *</label>
                <input id="appointment_date" name="appointment_date" type="datetime-local" style={S.input} value={form.appointment_date} min={new Date().toISOString().slice(0, 16)} onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Reason / Notes</label>
                <textarea id="notes" name="notes" style={{ ...S.input, height: 80, resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Describe your symptoms or reason for visit..." />
              </div>
              <div style={{ padding: '10px 12px', background: '#fff9db', borderRadius: 8, fontSize: 12, color: '#e67700', display: 'flex', gap: 8 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                Your appointment will be <strong>Pending</strong> until the doctor approves it.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowModal(false)} style={{ ...S.btn, flex: 1, background: '#f0f2f5', color: '#495057' }}>Cancel</button>
              <button onClick={handleBook} disabled={submitting} style={{ ...S.btn, flex: 1, background: '#3b5bdb', color: '#fff', justifyContent: 'center', opacity: submitting ? 0.8 : 1 }}>
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
