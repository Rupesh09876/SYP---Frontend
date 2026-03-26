import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FileText, ShieldCheck, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import API from '../../utils/api';

export default function PublicReportView() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get(`/reports/public/${id}?token=${searchParams.get('token')}`)
            .then(res => setReport(res.data.data))
            .catch(err => {
                console.error('Public report fetch error:', err);
                if (err.response?.status === 403) {
                    setError(err.response.data.message || 'This secure link has expired or is invalid.');
                } else if (err.response?.status === 404) {
                    setError('The requested report could not be found.');
                } else {
                    setError(`Unable to connect to the medical server. Please check your internet connection. (Error: ${err.message})`);
                }
            })
            .finally(() => setLoading(false));
    }, [id, searchParams]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e7f0ff', borderTopColor: '#3b5bdb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ color: '#868e96', fontSize: 14 }}>Securing connection...</div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 20 }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: 450, width: '100%', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: '#fff5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <AlertCircle size={32} color="#fa5252" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>Access Denied</h2>
                <p style={{ color: '#868e96', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>{error}</p>
                <div style={{ fontSize: 12, color: '#adb5bd', borderTop: '1px solid #f0f2f5', paddingTop: 20 }}>
                    MediCare Secure Sharing System
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: '#3b5bdb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏥</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>MediCare</div>
                            <div style={{ fontSize: 11, color: '#868e96' }}>SECURE REPORT VIEW</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ebfbee', color: '#2f9e44', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        <ShieldCheck size={14} /> Verified Access
                    </div>
                </div>

                {/* Report Card */}
                <div style={{ background: '#fff', borderRadius: 24, padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e8eaed' }}>
                    <div style={{ borderBottom: '1px solid #f0f2f5', paddingBottom: 24, marginBottom: 32 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>{report.title}</h1>
                        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#868e96' }}>
                            <span>Doctor: <strong>Dr. {report.doctor_name || 'Medical Specialist'}</strong></span>
                            <span>Date: <strong>{new Date(report.created_at).toLocaleDateString()}</strong></span>
                            {report.view_count !== undefined && (
                                <span style={{ color: '#3b5bdb' }}>Views: <strong>{report.view_count} / {report.max_views || 8}</strong></span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: 32 }}>
                        <section>
                            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#3b5bdb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Clinical Diagnosis</h3>
                            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, color: '#495057', lineHeight: 1.6, fontSize: 15 }}>
                                {report.diagnosis}
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#3b5bdb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Prescription</h3>
                            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, color: '#495057', lineHeight: 1.6, fontSize: 15 }}>
                                {report.prescription || 'No medication prescribed.'}
                            </div>
                        </section>

                        {report.notes && (
                            <section>
                                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#3b5bdb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Additional Notes</h3>
                                <div style={{ color: '#868e96', lineHeight: 1.6, fontSize: 14 }}>
                                    {report.notes}
                                </div>
                            </section>
                        )}
                    </div>

                    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #f0f2f5', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#adb5bd', fontSize: 12 }}>
                            <Clock size={14} /> This temporary view will expire soon. Please contact the patient for a fresh link if needed.
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32, color: '#adb5bd', fontSize: 12 }}>
                    &copy; {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.
                </div>
            </div>
        </div>
    );
}
