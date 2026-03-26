import { useState, useEffect } from 'react';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import PatientLayout from './PatientLayout';
import API from '../../utils/api';

const S = {
    card: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
    status: (s) => ({
        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
        background: s === 'Paid' ? '#ebfbee' : '#fff4e6',
        color: s === 'Paid' ? '#2f9e44' : '#d9480f',
        display: 'inline-flex', alignItems: 'center', gap: 4
    }),
    payBtn: { background: '#3b5bdb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }
};

export default function Billing() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = () => {
        API.get('/billing').then(res => setBills(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBills();

        const urlParams = new URLSearchParams(window.location.search);
        const pidx = urlParams.get('pidx');
        const purchase_order_id = urlParams.get('purchase_order_id');
        if (pidx) {
            API.post('/billing/khalti/verify', { pidx, purchase_order_id })
                .then(res => {
                    alert('Payment successful!');
                    window.history.replaceState(null, '', window.location.pathname);
                    fetchBills();
                }).catch(err => {
                    alert('Payment verification failed.');
                    window.history.replaceState(null, '', window.location.pathname);
                });
        }
    }, []);

    const handlePay = (bill) => {
        API.post('/billing/khalti/initiate', { bill_id: bill.id })
            .then(res => {
                if (res.data.payment_url) {
                    window.location.href = res.data.payment_url;
                }
            }).catch(err => {
                console.error(err);
                alert('Failed to initiate payment. Please try again.');
            });
    };

    return (
        <PatientLayout activeLabel="Billing & Invoices">
            <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
                    {bills.length === 0 ? (
                        <div style={{ ...S.card, textAlign: 'center', padding: '60px', gridColumn: '1/-1' }}>
                            <CreditCard size={48} color="#adb5bd" style={{ margin: '0 auto 16px' }} />
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#495057' }}>No invoices found</div>
                            <p style={{ color: '#868e96', fontSize: 13, marginTop: 4 }}>Invoices are generated after completed appointments.</p>
                        </div>
                    ) : (
                        bills.map(bill => (
                            <div key={bill.id} style={S.card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Service Invoice #{bill.id}</div>
                                        <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>Issued on {new Date(bill.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <span style={S.status(bill.status)}>
                                        {bill.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {bill.status}
                                    </span>
                                </div>

                                <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                        <span style={{ color: '#868e96' }}>{bill.services || 'Consultation Fee'}</span>
                                        <span style={{ fontWeight: 600 }}>Rs. {bill.amount}</span>
                                    </div>
                                    <div style={{ height: 1, background: '#e9ecef', margin: '8px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
                                        <span>Total Amount</span>
                                        <span style={{ color: '#3b5bdb' }}>Rs. {bill.amount}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    {bill.status === 'Pending' ? (
                                        <button style={S.payBtn} onClick={() => handlePay(bill)}>
                                            Pay via Khalti <ExternalLink size={14} />
                                        </button>
                                    ) : (
                                        <div style={{ fontSize: 12, color: '#868e96' }}>
                                            <div style={{ fontWeight: 600, color: '#2f9e44' }}>Success · {bill.payment_method}</div>
                                            <div>Tx ID: {bill.transaction_id}</div>
                                        </div>
                                    )}
                                    <button style={{ ...S.payBtn, background: '#f0f2f5', color: '#495057', marginLeft: 'auto' }}>
                                        <Download size={14} /> Invoice
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PatientLayout>
    );
}
