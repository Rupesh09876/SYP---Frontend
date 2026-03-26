import { useState, useEffect } from 'react';
import { Zap, Check, Star, Shield, Mic, Share2, Crown, Loader } from 'lucide-react';
import PatientLayout from './PatientLayout';
import API from '../../utils/api';

const S = {
    card: { background: '#fff', borderRadius: 16, padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f0f2f5', flex: 1, display: 'flex', flexDirection: 'column' },
    activeCard: { border: '2px solid #3b5bdb', boxShadow: '0 10px 25px rgba(59, 91, 219, 0.1)' },
    tag: { background: '#e7f0ff', color: '#3b5bdb', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 12 },
    benefit: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#495057', marginBottom: 12 },
    btn: (primary) => ({
        width: '100%', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none',
        background: primary ? '#3b5bdb' : '#f0f2f5',
        color: primary ? '#fff' : '#495057',
        marginTop: 'auto', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
    })
};

export default function Subscription() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [tier, setTier] = useState(user.subscription_tier || 'free');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pidx = urlParams.get('pidx');
        const mockPidx = urlParams.get('mock_pidx');
        const isMockPayment = urlParams.get('mock_payment') === 'true';

        // Handle real Khalti callback
        if (pidx) {
            setVerifying(true);
            API.post('/subscription/verify', { pidx })
                .then(res => {
                    if (res.data.success) {
                        const updatedUser = res.data.user;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        setUser(updatedUser);
                        setTier(updatedUser.subscription_tier);
                        alert('✅ Subscription upgraded to Premium successfully!');
                    }
                    window.history.replaceState(null, '', window.location.pathname);
                }).catch(err => {
                    console.error('Subscription verification failed:', err);
                    alert('Subscription upgrade failed. Please contact support.');
                    window.history.replaceState(null, '', window.location.pathname);
                }).finally(() => setVerifying(false));
        }

        // Handle sandbox/mock payment callback
        if (isMockPayment && mockPidx) {
            setVerifying(true);
            // Directly activate via mock verify endpoint
            API.post('/subscription/verify', { pidx: mockPidx })
                .then(res => {
                    if (res.data.success) {
                        const updatedUser = res.data.user;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        setUser(updatedUser);
                        setTier(updatedUser.subscription_tier);
                        alert('✅ [Sandbox] Premium subscription activated successfully!');
                    }
                    window.history.replaceState(null, '', window.location.pathname);
                }).catch(err => {
                    console.error('Mock subscription failed:', err);
                    alert('Sandbox activation failed.');
                    window.history.replaceState(null, '', window.location.pathname);
                }).finally(() => setVerifying(false));
        }
    }, []);

    const handleUpgrade = async (plan) => {
        if (plan.id === 'free') return;
        setLoading(true);
        try {
            const res = await API.post('/subscription/initiate');
            if (res.data.payment_url) {
                window.location.href = res.data.payment_url;
            }
        } catch (err) {
            console.error('Failed to initiate upgrade:', err);
            alert('Failed to initiate upgrade. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            id: 'free',
            name: 'Basic',
            price: 'Free',
            tag: 'Current Plan',
            benefits: [
                'Standard Appointments',
                'Basic Medical Reports',
                'Notification Alerts',
                '24/7 Access'
            ]
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 'Rs. 100/mo',
            tag: 'Most Popular',
            icon: <Crown size={24} color="#fcc419" />,
            benefits: [
                'AI Voice Assistant',
                'Secure QR Report Sharing',
                'Priority Consultation',
                'Extended Medical History',
                'Ad-free Experience'
            ],
            primary: true
        }
    ];

    return (
        <PatientLayout activeLabel="Subscription Plans">
            <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
                {verifying && (
                    <div style={{ background: '#e7f5ff', border: '1px solid #3b5bdb', color: '#1864ab', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Loader className="animate-spin" size={18} /> Verifying your payment and upgrading account...
                    </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Upgrade your Healthcare Experience</h1>
                    <p style={{ color: '#868e96', fontSize: 16 }}>Unlock premium features like AI assistance and secure report sharing.</p>
                </div>

                <div style={{ display: 'flex', gap: 24 }}>
                    {plans.map(plan => (
                        <div key={plan.id} style={{ ...S.card, ...(tier === plan.id ? S.activeCard : {}) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ ...S.tag, background: plan.primary ? '#fff0f6' : '#e7f0ff', color: plan.primary ? '#d6336c' : '#3b5bdb' }}>{plan.tag}</span>
                                {plan.icon}
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{plan.name}</h2>
                            <div style={{ marginBottom: 24 }}>
                                <span style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{plan.price}</span>
                                {plan.id !== 'free' && <span style={{ fontSize: 14, color: '#868e96' }}> / month</span>}
                            </div>

                            <div style={{ flex: 1 }}>
                                {plan.benefits.map(b => (
                                    <div key={b} style={S.benefit}>
                                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#ebfbee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Check size={12} color="#2f9e44" />
                                        </div>
                                        {b}
                                    </div>
                                ))}
                            </div>

                            <button
                                style={S.btn(plan.primary)}
                                disabled={tier === plan.id || loading}
                                onClick={() => handleUpgrade(plan)}
                            >
                                {loading ? <Loader className="animate-spin" size={16} /> : (tier === plan.id ? 'Already Active' : `Upgrade to ${plan.name}`)}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Feature Highlights */}
                <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 50, height: 50, background: '#e7f0ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Mic size={24} color="#3b5bdb" />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>AI Voice Assistant</h3>
                        <p style={{ fontSize: 13, color: '#868e96', lineHeight: 1.5 }}>Interact with your medical data hands-free using professional voice recognition.</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 50, height: 50, background: '#fff0f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Share2 size={24} color="#d6336c" />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Secure QR Sharing</h3>
                        <p style={{ fontSize: 13, color: '#868e96', lineHeight: 1.5 }}>Share reports with family via temporary secure links that expire automatically.</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 50, height: 50, background: '#f8f9fa', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Shield size={24} color="#495057" />
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Data Privacy</h3>
                        <p style={{ fontSize: 13, color: '#868e96', lineHeight: 1.5 }}>End-to-end encryption for all shared reports and billing transactions.</p>
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}
