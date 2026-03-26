import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Stethoscope, QrCode } from 'lucide-react';
import API from '../../utils/api';
import DoctorLayout from './DoctorLayout';

const DUMMY_APPOINTMENTS = [
  { name: 'Sarah Johnson', sub: 'Routine Checkup', time: '10:00 AM', day: 'Today', status: 'Confirmed', avatar: '👩' },
  { name: 'Michael Chen', sub: 'Follow-up Consultation', time: '11:30 AM', day: 'Today', status: 'Pending', avatar: '👨' },
  { name: 'Emily Davis', sub: 'ECG Test', time: '02:00 PM', day: 'Today', status: 'Confirmed', avatar: '👩' },
  { name: 'Robert Martinez', sub: 'Blood Pressure Check', time: '03:30 PM', day: 'Today', status: 'Confirmed', avatar: '👨' },
];
const DUMMY_PATIENTS = [
  { name: 'Lisa Anderson', id: 'P-2847', condition: 'Hypertension', lastVisit: 'Dec 10, 2024', status: 'Stable', statusColor: '#2f9e44' },
  { name: 'David Thompson', id: 'P-2846', condition: 'Diabetes Type 2', lastVisit: 'Dec 08, 2024', status: 'Monitoring', statusColor: '#f59f00' },
  { name: 'Jennifer White', id: 'P-2845', condition: 'Cardiac Arrhythmia', lastVisit: 'Dec 05, 2024', status: 'Stable', statusColor: '#2f9e44' },
];

const S = {
  content: { padding: '24px 28px' },
  panel: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5', marginBottom: 20 },
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try { 
        const r = await API.get('/appointments'); 
        setAppointments(r.data.data || []); 
      } catch (err) {
        console.warn('Dashboard: Failed to fetch appointments', err.message);
      }
      try { 
        const r = await API.get('/patients'); 
        setPatients(r.data.data || []); 
      } catch (err) {
        console.warn('Dashboard: Failed to fetch patients', err.message);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const todayCount = appointments.filter(a => new Date(a.appointment_date).toDateString() === new Date().toDateString()).length;
  const pendingCount = appointments.filter(a => (a.status || '').toLowerCase() === 'scheduled' || (a.status || '').toLowerCase() === 'pending').length;

  const displayAppts = appointments.length > 0
    ? [...appointments]
      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
      .filter(a => new Date(a.appointment_date) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .slice(0, 4)
      .map(a => ({
        name: `Patient #${a.patient_id}`,
        sub: a.notes || 'Consultation',
        time: new Date(a.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        day: new Date(a.appointment_date).toDateString() === new Date().toDateString() ? 'Today' : new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: a.status || 'Scheduled',
        avatar: '👤',
        id: a.id,
      }))
    : DUMMY_APPOINTMENTS;

  const displayPatients = patients.length > 0
    ? patients.slice(0, 3).map(p => ({
      name: `${p.first_name} ${p.last_name}`,
      id: `P-${p.id}`,
      condition: 'General',
      lastVisit: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Stable',
      statusColor: '#2f9e44',
    }))
    : DUMMY_PATIENTS;

  const statusCounts = { Confirmed: 0, Scheduled: 0, Completed: 0, Cancelled: 0, Pending: 0 };
  appointments.forEach(a => { const s = a.status || 'Scheduled'; if (statusCounts[s] !== undefined) statusCounts[s]++; else statusCounts['Scheduled']++; });
  const total = appointments.length || 1;

  return (
    <DoctorLayout activeLabel="Dashboard" activePath="/doctor/dashboard">
      <div style={S.content}>
        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { title: "Today's Appointments", value: todayCount, sub: 'Scheduled for today', subColor: '#2f9e44', bg: '#e7f5ff', emoji: '📅' },
            { title: 'Total Patients', value: patients.length, sub: 'Registered patients', subColor: '#2f9e44', bg: '#ebfbee', emoji: '👥' },
            { title: 'Pending', value: pendingCount, sub: 'Awaiting confirmation', subColor: '#f59f00', bg: '#fff9db', emoji: '⏳' },
            { title: 'Total Appointments', value: appointments.length, sub: 'All time', subColor: '#7950f2', bg: '#f3f0ff', emoji: '📋' },
          ].map(({ title, value, sub, subColor, bg, emoji }) => (
            <div key={title} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#868e96', marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: subColor, marginTop: 6, fontWeight: 500 }}>{sub}</div>
                </div>
                <div style={{ width: 42, height: 42, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{emoji}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={S.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Upcoming Appointments</div>
                <div style={{ fontSize: 12, color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/doctor/appointments')}>View All</div>
              </div>
              {displayAppts.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#adb5bd', fontSize: 13, padding: '24px 0' }}>No upcoming appointments</div>
              ) : displayAppts.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < displayAppts.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#e7f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{a.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#868e96', marginTop: 1 }}>{a.sub}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{a.time}</div>
                    <div style={{ fontSize: 11, color: '#868e96', marginBottom: 4 }}>{a.day}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: ['Confirmed', 'Scheduled'].includes(a.status) ? '#ebfbee' : '#fff9db', color: ['Confirmed', 'Scheduled'].includes(a.status) ? '#2f9e44' : '#f59f00' }}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={S.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Recent Patients</div>
                <div style={{ fontSize: 12, color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/doctor/patients')}>View All</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
                    {['Patient', 'Condition', 'Last Visit', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, color: '#868e96', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayPatients.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8f9fa' }}>
                      <td style={{ padding: '12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e7f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>👤</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#868e96' }}>ID: {p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#495057' }}>{p.condition}</td>
                      <td style={{ fontSize: 12, color: '#495057' }}>{p.lastVisit}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: p.statusColor }}>{p.status}</span>
                          <button 
                            onClick={() => navigate('/doctor/chat', { state: { patient: patients.find(fullP => `P-${fullP.id}` === p.id) } })}
                            style={{ padding: '4px 8px', background: '#e7f5ff', color: '#3b5bdb', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={S.panel}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 14 }}>Appointment Status</div>
              {[
                { label: 'Confirmed', color: '#2f9e44', count: statusCounts.Confirmed },
                { label: 'Scheduled', color: '#3b5bdb', count: statusCounts.Scheduled },
                { label: 'Completed', color: '#868e96', count: statusCounts.Completed },
                { label: 'Cancelled', color: '#fa5252', count: statusCounts.Cancelled },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#495057', marginBottom: 4 }}>
                    <span>{s.label}</span><span style={{ fontWeight: 600 }}>{s.count}</span>
                  </div>
                  <div style={{ height: 6, background: '#f0f2f5', borderRadius: 10 }}>
                    <div style={{ height: '100%', width: `${Math.round((s.count / total) * 100)}%`, background: s.color, borderRadius: 10, transition: 'width 0.4s' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#3b5bdb', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Quick Actions</div>
              {[
                { icon: UserPlus, label: 'Add New Patient', path: '/doctor/patients' },
                { icon: Stethoscope, label: 'Write Prescription', path: '/doctor/reports' },
                { icon: QrCode, label: 'Generate Report QR', path: '/doctor/reports' },
              ].map(({ icon: Icon, label, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 8, textAlign: 'left' }}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}