import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CreditCard, BarChart2, Settings, LogOut, Bell, Search, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const RATE = 1500;
const statusColor = (s = '') => ({ paid: { bg: '#ebfbee', color: '#2f9e44' }, pending: { bg: '#fff9db', color: '#f59f00' }, overdue: { bg: '#fff5f5', color: '#fa5252' } }[s.toLowerCase()] || { bg: '#f0f2f5', color: '#868e96' });

export default function Billing() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  useEffect(() => {
    (async () => {
      try {
        const [aRes, dRes, pRes, bRes] = await Promise.allSettled([API.get('/appointments'), API.get('/admin/doctors'), API.get('/admin/patients'), API.get('/billing')]);
        if (aRes.status === 'fulfilled') setAppointments(aRes.value.data.data || []);
        if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
        if (pRes.status === 'fulfilled') setPatients(pRes.value.data.data || []);
        if (bRes.status === 'fulfilled') setBills(bRes.value.data.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const doctorMap = {}; doctors.forEach(d => { doctorMap[d.id] = d; });
  const patientMap = {}; patients.forEach(p => { patientMap[p.id] = p; });

  const apptBillingRecords = appointments.map(a => {
    const date = new Date(a.appointment_date);
    const isPast = date < new Date();
    const status = (a.status || '').toLowerCase();
    let billingStatus;
    if (status === 'completed') billingStatus = 'Paid';
    else if (status === 'cancelled') billingStatus = 'Overdue';
    else if (isPast) billingStatus = 'Overdue';
    else billingStatus = 'Pending';
    return { id: a.id, patient_id: a.patient_id, doctor_id: a.doctor_id, date, amount: RATE, billingStatus, isSub: false };
  });

  const subscriptionRecords = bills.filter(b => b.appointment_id === 0).map(b => ({
    id: b.id,
    patient_id: b.patient_id,
    doctor_id: null,
    date: new Date(b.created_at),
    amount: b.amount,
    billingStatus: b.status,
    isSub: true
  }));

  const billingRecords = [...apptBillingRecords, ...subscriptionRecords];

  const totalRevenue = billingRecords.filter(b => b.billingStatus === 'Paid').reduce((s, b) => s + b.amount, 0);
  const pendingRevenue = billingRecords.filter(b => b.billingStatus === 'Pending').reduce((s, b) => s + b.amount, 0);
  const overdueRevenue = billingRecords.filter(b => b.billingStatus === 'Overdue').reduce((s, b) => s + b.amount, 0);

  const monthlyRevenue = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = Array(12).fill(0);
    billingRecords.filter(b => b.billingStatus === 'Paid').forEach(b => { data[b.date.getMonth()] += b.amount; });
    return months.map((m, i) => ({ month: m, revenue: data[i] })).filter(d => d.revenue > 0);
  })();

  const filtered = billingRecords.filter(b => {
    const p = patientMap[b.patient_id]; const d = doctorMap[b.doctor_id];
    const s = `${p?.first_name || ''} ${p?.last_name || ''} ${d?.first_name || ''} ${d?.last_name || ''}`.toLowerCase();
    return s.includes(search.toLowerCase()) && (filter === 'All' || b.billingStatus === filter);
  });

  const thS = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const tdS = { padding: '13px 16px', fontSize: 13, color: '#495057' };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5', fontFamily: "'Inter',-apple-system,sans-serif", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8eaed', flexShrink: 0 }}>
          <div><div style={{ fontSize: 21, fontWeight: 700, color: '#1a1a2e' }}>Billing</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Revenue and payment overview</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={markAsRead} onMarkAllRead={markAllRead} onDelete={deleteNotification} />
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid #e8eaed', background: '#fff', color: '#495057', fontSize: 13, cursor: 'pointer' }}><Download size={14} />Export</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[{ label: 'Total Revenue', value: `NPR ${totalRevenue.toLocaleString()}`, bg: '#e7f5ff', color: '#3b5bdb', emoji: '💰' }, { label: 'Pending', value: `NPR ${pendingRevenue.toLocaleString()}`, bg: '#fff9db', color: '#f59f00', emoji: '⏳' }, { label: 'Overdue', value: `NPR ${overdueRevenue.toLocaleString()}`, bg: '#fff5f5', color: '#fa5252', emoji: '⚠️' }, { label: 'Total Invoices', value: billingRecords.length, bg: '#f3f0ff', color: '#7950f2', emoji: '📄' }].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.emoji}</div>
                <div><div style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>{s.label}</div></div>
              </div>
            ))}
          </div>

          {/* Chart */}
          {monthlyRevenue.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #f0f2f5', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 }}>Monthly Revenue (NPR)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`NPR ${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="#3b5bdb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
                <div key={s} onClick={() => setFilter(s)} style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === s ? '#3b5bdb' : '#f0f2f5', color: filter === s ? '#fff' : '#495057', transition: 'all 0.15s' }}>{s}</div>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#adb5bd" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor..." style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #e8eaed', borderRadius: 8, fontSize: 13, width: 250, outline: 'none', color: '#1a1a2e', background: '#fff' }} />
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f2f5', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {loading ? <div style={{ padding: 60, textAlign: 'center', color: '#adb5bd', fontSize: 13 }}>Loading billing data...</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8f9fa', borderBottom: '2px solid #f0f2f5' }}>{['Invoice #', 'Patient', 'Doctor', 'Date', 'Amount', 'Status'].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: 50, textAlign: 'center', color: '#adb5bd', fontSize: 13 }}>No billing records found</td></tr>
                    : filtered.map((b, i) => {
                      const p = patientMap[b.patient_id]; const d = doctorMap[b.doctor_id]; const sc = statusColor(b.billingStatus);
                      return (
                        <tr key={`${b.isSub ? 'sub' : 'appt'}-${b.id}`} style={{ borderBottom: '1px solid #f8f9fa', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                          <td style={tdS}><span style={{ fontWeight: 600, color: '#3b5bdb' }}>{b.isSub ? 'SUB' : 'INV'}-{String(b.id).padStart(4, '0')}</span></td>
                          <td style={tdS}><div style={{ fontWeight: 600, color: '#1a1a2e' }}>{p ? `${p.first_name} ${p.last_name}` : `Patient #${b.patient_id}`}</div>{b.isSub && <div style={{fontSize: 10, color: '#7950f2'}}>Premium Sub</div>}</td>
                          <td style={tdS}>{b.isSub ? <span style={{color: '#adb5bd'}}>-</span> : (d ? `Dr. ${d.first_name} ${d.last_name}` : `Doctor #${b.doctor_id}`)}</td>
                          <td style={tdS}>{b.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td style={{ ...tdS, fontWeight: 600, color: '#1a1a2e' }}>NPR {b.amount.toLocaleString()}</td>
                          <td style={tdS}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{b.billingStatus}</span></td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#adb5bd', marginTop: 12 }}>Showing {filtered.length} of {billingRecords.length} records · Rate: NPR {RATE.toLocaleString()} per appointment</div>
        </div>
      </div>
    </div>
  );
}