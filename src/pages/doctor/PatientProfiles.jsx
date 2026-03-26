import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Phone, Mail, User, Clock, ChevronRight, MessageSquare } from 'lucide-react';
import API from '../../utils/api';
import DoctorLayout from './DoctorLayout';

const S = {
  panel: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #dee2e6', borderRadius: 8, fontSize: 13, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box', background: '#fff' },
};

function ProfileDrawer({ patient, appointments, onClose }) {
  if (!patient) return null;
  const patientAppts = appointments.filter(a => String(a.patient_id) === String(patient.id));
  const completed = patientAppts.filter(a => (a.status || '').toLowerCase() === 'completed').length;
  const upcoming = patientAppts.filter(a => new Date(a.appointment_date) > new Date()).length;
  const initials = `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} onClick={onClose} />
      <div style={{ width: 400, background: '#fff', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 100%)', padding: '28px 24px', color: '#fff', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer', display: 'flex' }}>
            <X size={16} color="#fff" />
          </button>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            {initials}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{patient.first_name} {patient.last_name}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Patient ID: P-{patient.id}</div>
        </div>
        <div style={{ padding: '20px 24px', flex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>Contact Information</div>
            {[
              { icon: Mail, label: 'Email', value: patient.email },
              { icon: Phone, label: 'Phone', value: patient.phone || 'Not provided' },
              { icon: User, label: 'Role', value: patient.role || 'patient' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e7f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={15} color="#3b5bdb" /></div>
                <div>
                  <div style={{ fontSize: 11, color: '#868e96' }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/doctor/chat', { state: { patient } })}
            style={{ width: '100%', padding: '12px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <MessageSquare size={16} /> Message Patient
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientProfiles() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await API.get('/patients');
        setPatients(r1.data.data || []);
        const r2 = await API.get('/appointments');
        setAppointments(r2.data.data || []);
      } catch { }
    })();
  }, []);

  const filtered = patients.filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <DoctorLayout activeLabel="Patient Profiles" activePath="/doctor/patients">
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ position: 'relative', width: 300 }}>
            <Search style={{ position: 'absolute', left: 12, top: 10, color: '#adb5bd' }} size={16} />
            <input style={{ ...S.input, paddingLeft: 36 }} placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={S.panel}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f2f5', textAlign: 'left' }}>
                {['Patient', 'Email', 'Phone', 'Created'].map(h => <th key={h} style={{ padding: 12, fontSize: 12, color: '#868e96' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => setSelected(p)} style={{ cursor: 'pointer', borderBottom: '1px solid #f8f9fa' }}>
                  <td style={{ padding: 12, fontSize: 13, fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{p.email}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{p.phone || '—'}</td>
                  <td style={{ padding: 12, fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && <ProfileDrawer patient={selected} appointments={appointments} onClose={() => setSelected(null)} />}
      </div>
    </DoctorLayout>
  );
}