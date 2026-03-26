import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Clock, MapPin, Video, MoreVertical,
  Bell, Mail, Shield
} from 'lucide-react';
import API from '../../utils/api';
import PatientLayout from './PatientLayout';
import { useNotifications } from '../../hooks/useNotifications';

const HEALTH_TIPS = [
  { title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water daily to maintain optimal health and energy levels.' },
  { title: 'Regular Exercise', desc: 'Aim for 30 minutes of moderate exercise daily to boost your cardiovascular health.' },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { notifications } = useNotifications();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, dRes] = await Promise.allSettled([
          API.get('/appointments'),
          API.get('/doctors')
        ]);
        if (aRes.status === 'fulfilled') setAppointments(aRes.value.data.data || []);
        if (dRes.status === 'fulfilled') setDoctors(dRes.value.data.data || []);
      } catch (err) {
        console.error('Patient dashboard fetch error:', err);
      }
    };
    fetchAll();
  }, []);

  const myAppointments = user.id
    ? appointments.filter(a => a.patient_id === user.id)
    : appointments;

  const doctorMap = {};
  doctors.forEach(d => { doctorMap[d.id] = d; });

  const now = new Date();
  const todayMidnight = new Date(now.setHours(0, 0, 0, 0));

  const upcomingAppointments = myAppointments
    .filter(a => new Date(a.appointment_date) >= todayMidnight)
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

  const completedAppointments = myAppointments.filter(
    a => (a.status || '').toLowerCase() === 'completed' || new Date(a.appointment_date) < new Date()
  );

  const pendingAppointments = myAppointments.filter(
    a => (a.status || '').toLowerCase() === 'pending'
  );

  const S = {
    panel: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
  };

  return (
    <PatientLayout activeLabel="Dashboard">
      <div style={{ padding: '24px 28px' }}>
        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Upcoming', value: upcomingAppointments.length, sub: upcomingAppointments.length > 0 ? `${upcomingAppointments.length} scheduled` : 'None scheduled', subColor: '#2f9e44', emoji: '📅', bg: '#e7f5ff' },
            { label: 'Completed', value: completedAppointments.length, sub: `${completedAppointments.length} visits done`, subColor: '#2f9e44', emoji: '✅', bg: '#ebfbee' },
            { label: 'Pending', value: pendingAppointments.length, sub: pendingAppointments.length > 0 ? 'Awaiting confirmation' : 'All confirmed', subColor: pendingAppointments.length > 0 ? '#f59f00' : '#868e96', emoji: '⏳', bg: '#fff9db' },
            { label: 'Total Visits', value: myAppointments.length, sub: 'All appointments', subColor: '#868e96', emoji: '🏥', bg: '#f3f0ff' },
          ].map(({ label, value, sub, subColor, emoji, bg }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: subColor }}>{sub}</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Upcoming Appointments */}
            <div style={S.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Upcoming Appointments</div>
                <div style={{ fontSize: 12, color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/patient/appointments')}>View All</div>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div style={{ color: '#adb5bd', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                  No upcoming appointments. Book one to get started!
                </div>
              ) : (
                upcomingAppointments.slice(0, 3).map((a, i) => {
                  const apptDate = new Date(a.appointment_date);
                  const day = apptDate.getDate();
                  const month = apptDate.toLocaleString('default', { month: 'short' });
                  const timeStr = apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  const doctor = doctorMap[a.doctor_id];
                  const doctorName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.category}` : `Doctor #${a.doctor_id}`;
                  const status = a.status || 'Scheduled';
                  const isConfirmed = ['confirmed', 'scheduled'].includes(status.toLowerCase());
                  const isToday = apptDate.toDateString() === new Date().toDateString();

                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 16, padding: '14px', background: i === 0 ? '#f8f9fa' : '#fff', borderRadius: 10, marginBottom: 8, border: '1px solid #f0f2f5' }}>
                      {/* Date Box */}
                      <div style={{ width: 48, textAlign: 'center', background: '#fff', border: '1px solid #e8eaed', borderRadius: 8, padding: '8px 6px', flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{day}</div>
                        <div style={{ fontSize: 10, color: '#868e96', marginTop: 2 }}>{month}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{a.notes || 'Appointment'}</div>
                        <div style={{ fontSize: 11, color: '#868e96', marginTop: 2 }}>{doctorName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#868e96' }}>
                            <Clock size={11} />{timeStr}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {isToday && isConfirmed ? (
                          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                            <Video size={13} /> Join
                          </button>
                        ) : (
                          <button onClick={() => navigate('/patient/appointments')} style={{ background: '#f8f9fa', color: '#495057', border: '1px solid #e8eaed', borderRadius: 8, padding: '8px 14px', fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>
                            View Details
                          </button>
                        )}
                        <MoreVertical size={16} color="#adb5bd" style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Appointment History */}
            <div style={S.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Appointment History</div>
                <div style={{ fontSize: 12, color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/patient/appointments')}>View All</div>
              </div>

              {myAppointments.length === 0 ? (
                <div style={{ color: '#adb5bd', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No appointment history yet</div>
              ) : (
                [...myAppointments]
                  .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                  .slice(0, 3)
                  .map((a, i, arr) => {
                    const doctor = doctorMap[a.doctor_id];
                    const doctorName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : `Doctor #${a.doctor_id}`;
                    const apptDate = new Date(a.appointment_date);
                    const dateStr = apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const status = a.status || 'Scheduled';

                    return (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                        <div style={{ width: 36, height: 42, background: '#f0f2f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          📋
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.notes || 'Appointment'}
                          </div>
                          <div style={{ fontSize: 11, color: '#868e96', marginTop: 1 }}>{dateStr} — {doctorName}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: status.toLowerCase() === 'confirmed' ? '#ebfbee' : status.toLowerCase() === 'pending' ? '#fff9db' : '#f0f2f5', color: status.toLowerCase() === 'confirmed' ? '#2f9e44' : status.toLowerCase() === 'pending' ? '#f59f00' : '#868e96', flexShrink: 0 }}>
                          {status}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Real Notifications */}
            <div style={S.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>Recent Notifications</div>
                <div style={{ fontSize: 11, color: '#3b5bdb', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/patient/settings')}>Settings</div>
              </div>

              {notifications.length === 0 ? (
                <div style={{ color: '#adb5bd', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No notifications</div>
              ) : (
                notifications.slice(0, 4).map((n, i, arr) => (
                  <div key={n.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.type === 'appointment' ? '#e7f0ff' : '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, borderLeft: `3px solid ${n.type === 'appointment' ? '#3b5bdb' : '#dee2e6'}` }}>
                      {n.type === 'appointment' ? '📅' : '🔔'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: '#868e96', marginTop: 1, lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: '#adb5bd', marginTop: 3 }}>{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Health Tips */}
            <div style={{ background: '#3b5bdb', borderRadius: 12, padding: '20px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Health Tips</div>
              </div>
              {HEALTH_TIPS.map((tip, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '12px 14px', marginBottom: i < HEALTH_TIPS.length - 1 ? 10 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{tip.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{tip.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}