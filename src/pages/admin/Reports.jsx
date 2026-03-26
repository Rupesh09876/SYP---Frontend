import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CreditCard, BarChart2, Settings, LogOut, Bell, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
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

const COLORS = ['#3b5bdb', '#2f9e44', '#f59f00', '#fa5252', '#7950f2', '#20c997'];

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

export default function Reports() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  useEffect(() => {
    (async () => {
      try {
        const [aRes, dRes, pRes] = await Promise.allSettled([API.get('/appointments'), API.get('/admin/doctors'), API.get('/admin/patients')]);
        if (aRes.status === 'fulfilled') setAppointments(aRes.value.data.data || []);
        if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
        if (pRes.status === 'fulfilled') setPatients(pRes.value.data.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const doctorMap = {}; doctors.forEach(d => { doctorMap[d.id] = d; });

  const monthlyAppts = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    appointments.forEach(a => { counts[new Date(a.appointment_date).getMonth()]++; });
    return months.map((m, i) => ({ month: m, count: counts[i] }));
  })();

  const byStatus = (() => {
    const map = {};
    appointments.forEach(a => { const s = a.status || 'Scheduled'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const bySpecialty = (() => {
    const map = {};
    appointments.forEach(a => { const cat = doctorMap[a.doctor_id]?.category || 'Unknown'; map[cat] = (map[cat] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  })();

  const byWeekday = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    appointments.forEach(a => { counts[new Date(a.appointment_date).getDay()]++; });
    return days.map((d, i) => ({ day: d, count: counts[i] }));
  })();

  const newPatientsMonthly = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    patients.forEach(p => { counts[new Date(p.created_at).getMonth()]++; });
    return months.map((m, i) => ({ month: m, patients: counts[i] }));
  })();

  const topDoctors = (() => {
    const map = {};
    appointments.forEach(a => { map[a.doctor_id] = (map[a.doctor_id] || 0) + 1; });
    return Object.entries(map).map(([id, count]) => ({ id, count, doctor: doctorMap[id] })).filter(d => d.doctor).sort((a, b) => b.count - a.count).slice(0, 5);
  })();

  const thisMonthAppts = appointments.filter(a => { const d = new Date(a.appointment_date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length;

  const pS = { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #f0f2f5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
  const empty = <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: 13 }}>No data yet</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5', fontFamily: "'Inter',-apple-system,sans-serif", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div><div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>Reports & Analytics</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Live data from your hospital database</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={markAsRead} onMarkAllRead={markAllRead} onDelete={deleteNotification} />
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid #e8eaed', background: '#fff', color: '#495057', fontSize: 13, cursor: 'pointer' }}><Download size={14} />Export</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#adb5bd', fontSize: 13 }}>Loading analytics...</div> : (
            <>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                {[{ label: 'Total Appointments', value: appointments.length, bg: '#e7f5ff', color: '#3b5bdb', emoji: '📋' }, { label: 'Total Doctors', value: doctors.length, bg: '#ebfbee', color: '#2f9e44', emoji: '🩺' }, { label: 'Total Patients', value: patients.length, bg: '#fff9db', color: '#f59f00', emoji: '👥' }, { label: 'This Month', value: thisMonthAppts, bg: '#f3f0ff', color: '#7950f2', emoji: '📅' }].map(s => (
                  <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.emoji}</div>
                    <div><div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>{s.label}</div></div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={pS}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Appointments per Month</div>
                  {monthlyAppts.some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={200}><BarChart data={monthlyAppts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} /><Bar dataKey="count" name="Appointments" fill="#3b5bdb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                  ) : empty}
                </div>
                <div style={pS}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Status Breakdown</div>
                  {byStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">{byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>
                  ) : empty}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={pS}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Appointments by Specialty</div>
                  {bySpecialty.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}><BarChart data={bySpecialty} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} allowDecimals={false} /><YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#495057' }} axisLine={false} tickLine={false} width={70} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} /><Bar dataKey="count" name="Appointments" fill="#20c997" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
                  ) : empty}
                </div>
                <div style={pS}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Appointments by Day of Week</div>
                  {byWeekday.some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={200}><BarChart data={byWeekday} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} /><Bar dataKey="count" name="Appointments" fill="#f59f00" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                  ) : empty}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
                <div style={pS}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>New Patient Registrations per Month</div>
                  {newPatientsMonthly.some(d => d.patients > 0) ? (
                    <ResponsiveContainer width="100%" height={180}><LineChart data={newPatientsMonthly} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} /><Line type="monotone" dataKey="patients" name="New Patients" stroke="#7950f2" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer>
                  ) : empty}
                </div>
                <div style={pS}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Top Doctors by Appointments</div>
                  {topDoctors.length === 0 ? <div style={{ textAlign: 'center', color: '#adb5bd', fontSize: 13, padding: '40px 0' }}>No data yet</div>
                    : topDoctors.map((d, i) => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topDoctors.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS[i % COLORS.length] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length], flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {d.doctor.first_name} {d.doctor.last_name}</div>
                          <div style={{ fontSize: 11, color: '#868e96' }}>{d.doctor.category}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{d.count}</div><div style={{ fontSize: 10, color: '#adb5bd' }}>appts</div></div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}