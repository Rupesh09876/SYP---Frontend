import { useEffect, useState } from 'react';
import { FileText, Download, Eye, Search, X, Calendar, Loader, Stethoscope, Share2, ShieldCheck, Clock } from 'lucide-react';
import PatientLayout from './PatientLayout';
import API from '../../utils/api';

const S = {
  panel: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
  btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer', border: 'none' },
};

export default function MedicalReports() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [sharing, setSharing] = useState(null); // Report being shared
  const [shareToken, setShareToken] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    API.get('/reports').then(r => setReports(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r =>
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.doctor_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.diagnosis || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (report) => {
    // Professional Printable Report
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>Medical Report - ${report.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b5bdb; padding-bottom: 20px; margin-bottom: 30px; }
            .hospital-info h1 { margin: 0; color: #3b5bdb; font-size: 24px; }
            .hospital-info p { margin: 2px 0; color: #868e96; font-size: 12px; }
            .report-title { text-align: center; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; font-size: 20px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8f9fa; padding: 20px; borderRadius: 12px; }
            .meta-item label { display: block; font-size: 10px; font-weight: 700; color: #868e96; text-transform: uppercase; margin-bottom: 4px; }
            .meta-item span { font-size: 14px; font-weight: 600; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 12px; font-weight: 700; color: #3b5bdb; text-transform: uppercase; border-bottom: 1px solid #e9ecef; padding-bottom: 5px; margin-bottom: 10px; }
            .section-content { font-size: 14px; white-space: pre-wrap; background: #fff; border: 1px solid #f0f2f5; padding: 15px; borderRadius: 8px; }
            .footer { margin-top: 50px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 20px; font-size: 11px; color: #adb5bd; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-info">
              <h1>🏥 MediCare Hospital</h1>
              <p>Kathmandu, Nepal | +977 1-4XXXXXX</p>
              <p>support@medicare.com.np</p>
            </div>
            <div style="text-align: right">
              <div style="font-weight: 700; color: #3b5bdb">CONFIDENTIAL</div>
              <div style="font-size: 12px; color: #868e96">Ref: #REP-${report.id}</div>
            </div>
          </div>

          <div class="report-title">Medical Consultation Report</div>

          <div class="meta-grid">
            <div class="meta-item">
              <label>Patient Name</label>
              <span>${JSON.parse(localStorage.getItem('user') || '{}').first_name} ${JSON.parse(localStorage.getItem('user') || '{}').last_name}</span>
            </div>
            <div class="meta-item">
              <label>Report Date</label>
              <span>${new Date(report.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div class="meta-item">
              <label>Attending Doctor</label>
              <span>${report.doctor_name || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <label>Specialization</label>
              <span>General Medicine</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Clinical Diagnosis</div>
            <div class="section-content">${report.diagnosis || 'No diagnosis recorded.'}</div>
          </div>

          <div class="section">
            <div class="section-title">Prescription & Medication</div>
            <div class="section-content">${report.prescription || 'No prescription provided.'}</div>
          </div>

          ${report.notes ? `
          <div class="section">
            <div class="section-title">Additional Notes</div>
            <div class="section-content">${report.notes}</div>
          </div>
          ` : ''}

          <div class="footer">
            <p>This is a computer-generated document and remains valid for medical reference. Authorized by MediCare Clinical Board.</p>
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleShare = async (report) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.subscription_tier !== 'premium') {
      alert('Secure QR sharing is a Premium Feature. Please upgrade your plan to access this.');
      return;
    }
    setSharing(report);
    setShareLoading(true);
    try {
      const res = await API.post(`/reports/${report.id}/share`);
      setShareToken(res.data.data.token);
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to generate secure share link.');
      setSharing(null);
    } finally {
      setShareLoading(false);
    }
  };



  return (
    <PatientLayout activeLabel="Medical Reports">
      <div style={{ padding: '24px 28px', fontFamily: "'Inter', sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#adb5bd" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input id="report-search" name="report-search" style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #dee2e6', borderRadius: 8, fontSize: 13, width: 260, outline: 'none', fontFamily: 'inherit' }} placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ fontSize: 12, color: '#868e96' }}>{filtered.length} report{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ ...S.panel, textAlign: 'center', padding: '60px', color: '#adb5bd' }}>
            <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>No medical reports found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Your doctor will upload reports after consultations</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map(r => (
              <div key={r.id} style={S.panel}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e7f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="#3b5bdb" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Medical Report'}</div>
                    <div style={{ fontSize: 12, color: '#868e96', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Stethoscope size={11} /> {r.doctor_name || 'Doctor'} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#ebfbee', color: '#2f9e44', flexShrink: 0 }}>Available</span>
                </div>

                {r.diagnosis && (
                  <div style={{ marginBottom: 10, padding: '10px 12px', background: '#f8f9fa', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#868e96', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Diagnosis</div>
                    <div style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 1.4 }}>{r.diagnosis}</div>
                  </div>
                )}

                {r.prescription && (
                  <div style={{ marginBottom: 12, padding: '10px 12px', background: '#f8f9fa', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#868e96', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prescription</div>
                    <div style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 1.4 }}>{r.prescription}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setSelected(r)} style={{ ...S.btn, flex: 1, background: '#e7f0ff', color: '#3b5bdb', justifyContent: 'center' }}>
                    <Eye size={13} /> View
                  </button>
                  <button onClick={() => handleDownload(r)} style={{ ...S.btn, flex: 1, background: '#3b5bdb', color: '#fff', justifyContent: 'center' }}>
                    <Download size={13} /> Download
                  </button>
                </div>
                <button
                  onClick={() => handleShare(r)}
                  style={{
                    ...S.btn,
                    width: '100%',
                    marginTop: 8,
                    background: user.subscription_tier === 'premium' ? '#fff' : '#f8f9fa',
                    border: '1px solid #e8eaed',
                    color: user.subscription_tier === 'premium' ? '#495057' : '#adb5bd',
                    justifyContent: 'center',
                    cursor: user.subscription_tier === 'premium' ? 'pointer' : 'default'
                  }}
                >
                  <Share2 size={13} />
                  Secure QR Share
                  {user.subscription_tier !== 'premium' && (
                    <span style={{ marginLeft: 'auto', fontSize: 9, background: '#fff0f6', color: '#d6336c', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>PREMIUM</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e' }}>{selected.title || 'Medical Report'}</div>
                <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>{selected.doctor_name} · {new Date(selected.created_at).toLocaleDateString()}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#868e96" /></button>
            </div>

            {[
              { label: 'Diagnosis', value: selected.diagnosis },
              { label: 'Prescription', value: selected.prescription },
              { label: 'Notes', value: selected.notes },
            ].filter(f => f.value).map(f => (
              <div key={f.label} style={{ marginBottom: 16, padding: '14px', background: '#f8f9fa', borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{f.label}</div>
                <div style={{ fontSize: 14, color: '#1a1a2e', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{f.value}</div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button onClick={() => setSelected(null)} style={{ ...S.btn, flex: 1, background: '#f0f2f5', color: '#495057', justifyContent: 'center' }}>Close</button>
              <button onClick={() => handleDownload(selected)} style={{ ...S.btn, flex: 1, background: '#3b5bdb', color: '#fff', justifyContent: 'center' }}>
                <Download size={13} /> Download Report
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Share Modal */}
      {sharing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -20 }}>
              <button onClick={() => setSharing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#868e96" /></button>
            </div>

            <div style={{ width: 60, height: 60, background: '#f8f9fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldCheck size={32} color="#3b5bdb" />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Secure Share Link</h3>
            <p style={{ fontSize: 13, color: '#868e96', marginBottom: 24 }}>Scan this QR code to view the report. This link will expire in 15 minutes.</p>

            {window.location.hostname === 'localhost' && (
              <div style={{ background: '#fff9db', border: '1px solid #ffe066', padding: '10px 14px', borderRadius: 8, fontSize: 11, color: '#856404', marginBottom: 20, textAlign: 'left', display: 'flex', gap: 8, alignItems: 'start' }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span>
                  <strong>Tip:</strong> Scanning `localhost` on mobile won't work. To test on mobile, open the system using your computer's IP address.
                </span>
              </div>
            )}

            <div style={{ background: '#fff', padding: 16, border: '1px solid #f0f2f5', borderRadius: 12, display: 'inline-block', marginBottom: 20, minHeight: 212, minWidth: 212, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {shareLoading ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #3b5bdb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 12, color: '#868e96' }}>Generating...</div>
                </div>
              ) : shareToken ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `${window.location.origin}/share/report/${sharing.id}?token=${shareToken}`
                  )}`}
                  alt="QR Code"
                  style={{ width: 180, height: 180 }}
                />
              ) : null}
            </div>

            {shareToken && (
               <div style={{ marginBottom: 20 }}>
                 <div style={{ fontSize: 11, fontWeight: 700, color: '#868e96', textTransform: 'uppercase', marginBottom: 6, textAlign: 'left' }}>Manual Link</div>
                 <div style={{ display: 'flex', gap: 6 }}>
                    <input 
                      readOnly 
                      value={`${window.location.origin}/share/report/${sharing.id}?token=${shareToken}`} 
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #e8eaed', borderRadius: 8, fontSize: 12, background: '#f8f9fa', color: '#495057' }}
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/report/${sharing.id}?token=${shareToken}`)}
                      style={{ padding: '8px 12px', background: '#e7f0ff', color: '#3b5bdb', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Copy
                    </button>
                 </div>
               </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 12, color: '#d9480f', background: '#fff4e6', padding: '10px', borderRadius: 8 }}>
              <Clock size={14} /> Link Expires: {new Date(Date.now() + 15 * 60000).toLocaleTimeString()}
            </div>

            <button onClick={() => { setSharing(null); setShareToken(null); }} style={{ ...S.btn, width: '100%', marginTop: 24, background: '#3b5bdb', color: '#fff', justifyContent: 'center', padding: '12px' }}>
              Done
            </button>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
