import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Check, ChevronDown, Clock, AlertCircle, FileText } from 'lucide-react';
import API from '../../utils/api';
import DoctorLayout from './DoctorLayout';

const STATUS_COLORS = {
  Scheduled: { bg: '#e7f5ff', color: '#1971c2' },
  Confirmed: { bg: '#ebfbee', color: '#2f9e44' },
  Completed: { bg: '#f1f3f5', color: '#868e96' },
  Cancelled: { bg: '#fff5f5', color: '#c92a2a' },
  Pending: { bg: '#fff9db', color: '#f59f00' },
};

const EMPTY_FORM = { patient_id: '', doctor_id: '', appointment_date: '', status: 'Scheduled', notes: '' };
const EMPTY_REPORT = { title: '', diagnosis: '', prescription: '', notes: '', follow_up_date: '' };

function ReportModal({ appointment, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_REPORT);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/reports', {
        ...form,
        appointment_id: appointment.id,
        patient_id: appointment.patient_id
      });
      onSuccess();
    } catch (err) {
      alert('Failed to create report. Please fill all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>Create Medical Report</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Report Title</label>
            <input id="report-title" name="report-title" required placeholder="e.g. Regular Checkup, Chest Pain Analysis" style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #dee2e6' }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Diagnosis</label>
            <textarea id="diagnosis" name="diagnosis" required rows={3} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #dee2e6' }} value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Prescription</label>
            <textarea id="prescription" name="prescription" rows={3} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #dee2e6' }} value={form.prescription} onChange={e => setForm({ ...form, prescription: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>Follow-up Date (Optional)</label>
              <input id="follow_up_date" name="follow_up_date" type="date" style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #dee2e6' }} value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} />
            </div>
          </div>
          <button disabled={loading} type="submit" style={{ width: '100%', background: '#2f9e44', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Submitting...' : 'Complete & Generate Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, dRes] = await Promise.allSettled([
        API.get('/appointments'),
        API.get('/patients'),
        API.get('/doctors'),
      ]);
      if (aRes.status === 'fulfilled') setAppointments(aRes.value.data.data || []);
      if (pRes.status === 'fulfilled') setPatients(pRes.value.data.data || []);
      if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { 
    fetchAll(); 
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const openCreate = () => {
    const dr = doctors.find(d => d.email === user.email);
    setForm({ ...EMPTY_FORM, doctor_id: dr?.id || '' });
    setEditTarget(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editTarget) await API.put(`/appointments/${editTarget}`, form);
      else await API.post('/appointments', form);
      setShowModal(false);
      fetchAll();
    } catch { }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this appointment?')) {
      try { await API.delete(`/appointments/${id}`); fetchAll(); } catch { }
    }
  };

  return (
    <DoctorLayout activeLabel="Appointments" activePath="/doctor/appointments">
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Manage Schedule</h2>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>
            <Plus size={18} /> New Appointment
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f2f5', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 12, color: '#868e96' }}>Patient</th>
                <th style={{ padding: 12, fontSize: 12, color: '#868e96' }}>Date/Time</th>
                <th style={{ padding: 12, fontSize: 12, color: '#868e96' }}>Status</th>
                <th style={{ padding: 12, fontSize: 12, color: '#868e96' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => {
                const p = patients.find(p => p.id === a.patient_id);
                const s = STATUS_COLORS[a.status] || STATUS_COLORS.Scheduled;
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{p ? `${p.first_name} ${p.last_name}` : `Patient #${a.patient_id}`}</td>
                    <td style={{ padding: 12 }}>{new Date(a.appointment_date).toLocaleString()}</td>
                    <td style={{ padding: 12 }}><span style={{ padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{a.status}</span></td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                          <button onClick={() => setReportTarget(a)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#2f9e44', background: '#ebfbee', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            <FileText size={14} /> Create Report
                          </button>
                        )}
                        <button onClick={() => handleDelete(a.id)} style={{ color: '#fa5252', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reportTarget && (
        <ReportModal 
          appointment={reportTarget} 
          onClose={() => setReportTarget(null)} 
          onSuccess={() => { setReportTarget(null); fetchAll(); }} 
        />
      )}
    </DoctorLayout>
  );
}