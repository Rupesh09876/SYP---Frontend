import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Printer, X, FileText, Calendar, User } from 'lucide-react';
import API from '../../utils/api';
import DoctorLayout from './DoctorLayout';

function ReportViewModal({ report, onClose }) {
  if (!report) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 600, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #f1f3f5' }}>
          <h2 style={{ margin: 0, color: '#1a1a2e' }}>{report.title}</h2>
          <p style={{ margin: '4px 0 0', color: '#868e96', fontSize: 13 }}>Report ID: #{report.id} • Issued on {new Date(report.created_at).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: '#868e96', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Patient</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{report.patient_name}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#868e96', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Follow-up</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{report.follow_up_date ? new Date(report.follow_up_date).toLocaleDateString() : 'Not scheduled'}</div>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#868e96', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Diagnosis</div>
          <div style={{ background: '#f8f9fa', padding: 14, borderRadius: 8, fontSize: 14, lineHeight: 1.6 }}>{report.diagnosis}</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#868e96', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Prescription & Instructions</div>
          <div style={{ background: '#e7f5ff', padding: 14, borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: '#1971c2', fontWeight: 500 }}>{report.prescription || 'No specified prescription'}</div>
        </div>
        <button onClick={() => window.print()} style={{ width: '100%', background: '#3b5bdb', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Printer size={18} /> Print Official Copy
        </button>
      </div>
    </div>
  );
}

export default function ReportSharing() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/reports');
        setReports(res.data.data || []);
      } catch { }
      setLoading(false);
    })();
  }, []);

  const filtered = reports.filter(r => 
    r.title?.toLowerCase().includes(search.toLowerCase()) || 
    r.patient_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DoctorLayout activeLabel="Report Sharing" activePath="/doctor/reports">
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Issued Medical Reports</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#868e96' }}>Manage and review all reports shared with patients</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 12, top: 10, color: '#adb5bd' }} size={16} />
            <input 
              style={{ width: 280, padding: '9px 12px 9px 38px', border: '1px solid #dee2e6', borderRadius: 8, outline: 'none' }} 
              placeholder="Search by title or patient..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 12, border: '1px solid #f0f2f5' }}>
            <FileText size={48} color="#dee2e6" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#495057' }}>No reports found</div>
            <p style={{ color: '#868e96', fontSize: 13, marginTop: 8 }}>Create a report from the Appointments tab to see it here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f2f5', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ebfbee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} color="#2f9e44" />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setSelectedReport(r)} style={{ padding: '8px 12px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#495057' }}>View Details</button>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: 15, color: '#1a1a2e' }}>{r.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#495057' }}>
                      <User size={14} color="#adb5bd" /> {r.patient_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#495057' }}>
                      <Calendar size={14} color="#adb5bd" /> {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#868e96', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.diagnosis}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedReport && <ReportViewModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </DoctorLayout>
  );
}