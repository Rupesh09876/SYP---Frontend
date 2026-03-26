import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, CreditCard,
  BarChart2, Settings, LogOut, Bell,
  AlertCircle, CheckCircle, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import API from '../../utils/api';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../../components/NotificationPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, dRes, aRes, bRes] = await Promise.allSettled([
          API.get('/admin/patients'),
          API.get('/admin/doctors'),
          API.get('/appointments'),
          API.get('/billing')
        ]);
        if (pRes.status === 'fulfilled') setPatients(pRes.value.data.data || []);
        if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
        if (aRes.status === 'fulfilled') setAppointments(aRes.value.data.data || []);
        
        let fetchedBills = [];
        if (bRes.status === 'fulfilled') {
          fetchedBills = bRes.value.data.data || [];
          setBills(fetchedBills);
        }

        // calculate ONLY paid bills for total revenue shown
        const totalRev = fetchedBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        setMonthlyRevenue(totalRev);
        
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchAll();
  }, []);

  // Today's appointments
  const todayStr = new Date().toDateString();
  const todayAppointments = appointments.filter(
    a => new Date(a.appointment_date).toDateString() === todayStr
  );

  // Pending appointments
  const pendingCount = appointments.filter(
    a => (a.status || '').toLowerCase() === 'pending'
  ).length;

  // Build weekly bar chart data from real appointments
  const getWeekData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);

    appointments.forEach(a => {
      const d = new Date(a.appointment_date);
      if (d >= weekAgo && d <= now) counts[d.getDay()]++;
    });

    // Rotate so today is last
    const todayIdx = now.getDay();
    const rotated = [];
    for (let i = 6; i >= 0; i--) {
      const idx = (todayIdx - i + 7) % 7;
      rotated.push({ day: days[idx], count: counts[idx] });
    }
    return rotated;
  };

  // Build monthly line chart — count appointments per month

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenue = Array(12).fill(0);

    bills.filter(b => b.status === 'Paid').forEach(b => {
      const m = new Date(b.created_at).getMonth();
      const amount = Number(b.amount) || 0;
      revenue[m] += amount;
    });

    return months.map((month, i) => ({
      month,
      value: revenue[i]
    })).filter(d => d.value > 0);
  };
  const weekData = getWeekData();
  const monthlyData = getMonthlyData();

  // Recent appointments — last 3
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
    .slice(0, 3);

  // Patient name lookup map
  const patientMap = {};
  patients.forEach(p => { patientMap[p.id] = `${p.first_name} ${p.last_name}`; });

  // Doctor name lookup map
  const doctorMap = {};
  doctors.forEach(d => { doctorMap[d.id] = `${d.first_name} ${d.last_name}`; });

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const S = {
    wrap: { display: 'flex', height: '100vh', background: '#f0f2f5', fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden' },
    sidebar: { width: 210, background: '#fff', borderRight: '1px solid #e8eaed', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    navItemActive: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: '#e7f0ff', color: '#3b5bdb', fontWeight: 600, fontSize: 13 },
    navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', color: '#495057', fontSize: 13 },
    panel: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
  };


  return (
    <div style={S.wrap}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#3b5bdb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>MedCare</div>
            <div style={{ fontSize: 11, color: '#868e96' }}>Hospital Management</div>
          </div>
        </div>

        <div style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#adb5bd', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 6px 4px' }}>Admin Panel</div>
          <div
            style={S.navItemActive}
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard size={16} /> Dashboard
          </div>
          {[
            [Users, 'User Management', '/admin/users'],
            [Calendar, 'Appointments', '/admin/appointments'],
            [CreditCard, 'Billing', '/admin/billing'],
            [BarChart2, 'Reports', '/admin/reports'],
            [Settings, 'Settings', '/admin/settings']
          ].map(([Icon, label, path]) => (
            <div
              key={label}
              style={S.navItem}
              onClick={() => navigate(path)}
            >
              <Icon size={16} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
            {user.first_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.first_name ? ` ${user.first_name} ${user.last_name}` : 'Admin'}
            </div>
            <div style={{ fontSize: 10, color: '#868e96' }}>Administrator</div>
          </div>
          <LogOut size={14} color="#adb5bd" style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => { localStorage.clear(); navigate('/login'); }} />
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{ background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>Dashboard Overview</div>
            <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Monitor hospital operations and key metrics</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={markAsRead} onMarkAllRead={markAllRead} onDelete={deleteNotification} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8f9fa', border: '1px solid #e8eaed', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#495057' }}>
              <Calendar size={12} /> Today: {today}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { title: 'Total Patients', value: patients.length, sub: `${patients.length} registered`, subColor: '#2f9e44', bg: '#e7f5ff', emoji: '👥' },
              { title: 'Active Doctors', value: doctors.length, sub: `${doctors.length} on record`, subColor: '#2f9e44', bg: '#ebfbee', emoji: '🩺' },
              { title: "Today's Appointments", value: todayAppointments.length, sub: `${pendingCount} pending approval`, subColor: pendingCount > 0 ? '#f59f00' : '#868e96', bg: '#fff9db', emoji: '📅' },
              {
                title: 'Monthly Revenue',
                value: `$${monthlyRevenue}`,
                sub: 'Total appointment earnings',
                subColor: '#2f9e44',
                bg: '#f3f0ff',
                emoji: '💰'
              },
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

          {/* CHARTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={S.panel}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Appointments This Week</div>
              {weekData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={215}>
                  <BarChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f0f2f5' }} contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} />
                    <Bar dataKey="count" name="Appointments" fill="#4c6ef5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 215, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: 13 }}>
                  No appointments this week
                </div>
              )}
            </div>

            <div style={S.panel}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Revenue by Month</div>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={215}>
                  <LineChart data={monthlyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" name="Appointments" stroke="#20c997" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 215, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: 13 }}>
                  No appointment data yet
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>

            {/* Recent Appointments */}
            <div style={S.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Recent Appointments</div>
                <div style={{ fontSize: 12, color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }}>View All</div>
              </div>

              {recentAppointments.length === 0 ? (
                <div style={{ color: '#adb5bd', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No appointments yet</div>
              ) : (
                recentAppointments.map((a, i) => {
                  const apptDate = new Date(a.appointment_date);
                  const timeStr = apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  const status = a.status || 'Scheduled';
                  const isConfirmed = ['confirmed', 'scheduled'].includes(status.toLowerCase());
                  const patientName = patientMap[a.patient_id] || `Patient #${a.patient_id}`;
                  const doctorName = doctorMap[a.doctor_id]
                    ? `Dr. ${doctorMap[a.doctor_id]}`
                    : `Doctor #${a.doctor_id}`;
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < recentAppointments.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e7f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patientName}</div>
                        <div style={{ fontSize: 11, color: '#868e96', marginTop: 1 }}>{doctorName}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: '#495057', marginBottom: 3 }}>{timeStr}</div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: isConfirmed ? '#ebfbee' : '#fff9db', color: isConfirmed ? '#2f9e44' : '#f59f00' }}>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Doctors Overview */}
            <div style={S.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Doctors Overview</div>
                <div style={{ fontSize: 12, color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }}>View All</div>
              </div>

              {doctors.length === 0 ? (
                <div style={{ color: '#adb5bd', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No doctors registered yet</div>
              ) : (
                doctors.slice(0, 4).map((d, i) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(doctors.length, 4) - 1 ? '1px solid #f8f9fa' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ebfbee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🩺</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Dr. {d.first_name} {d.last_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#868e96', marginTop: 1 }}>{d.category}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: '#ebfbee', color: '#2f9e44', flexShrink: 0 }}>
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}