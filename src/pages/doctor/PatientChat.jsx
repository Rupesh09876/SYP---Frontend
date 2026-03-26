import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Loader, UserCircle, Search, MoreVertical, Phone, Video, Paperclip, Smile, X } from 'lucide-react';
import DoctorLayout from './DoctorLayout';
import API from '../../utils/api';
import CallContainer from '../../components/CallContainer';
import { useLocation } from 'react-router-dom';
import { ringtone } from '../../utils/ringtone';

export default function PatientChat() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingPatients, setFetchingPatients] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCall, setActiveCall] = useState(null);
    const bottomRef = useRef(null);

    const location = useLocation();

    // Fetch patients who have sent messages
    useEffect(() => {
        const fetchChatList = async () => {
            try {
                const res = await API.get('/chat/list');
                const list = res.data.data;
                setPatients(list);
                
                // Handle initial selection from navigation state (proactive messaging)
                if (location.state?.patient && !selectedPatient) {
                    const p = location.state.patient;
                    if (!list.find(item => item.id === p.id)) {
                        setPatients(prev => [p, ...prev]);
                    }
                    setSelectedPatient(p);
                }
            } catch (err) {
                console.error('Failed to fetch patients:', err);
            } finally {
                setFetchingPatients(false);
            }
        };
        fetchChatList();
        const interval = setInterval(fetchChatList, 5000); // Poll list every 5s
        return () => clearInterval(interval);
    }, [location.state, selectedPatient]);

    // Handle message history when patient selected
    useEffect(() => {
        let interval;
        if (selectedPatient) {
            const fetchHistory = async () => {
                try {
                    const res = await API.get(`/chat/history/${selectedPatient.id}`);
                    setMessages(res.data.data);
                } catch (err) {
                    console.error('Chat history error:', err);
                }
            };
            fetchHistory();
            interval = setInterval(fetchHistory, 3000); // Poll every 3s
        }
        return () => clearInterval(interval);
    }, [selectedPatient]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !selectedPatient || loading) return;
        const msg = input.trim();
        setInput('');
        setLoading(true);
        try {
            const res = await API.post('/chat/send', { receiver_id: selectedPatient.id, content: msg });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.data]);
            }
        } catch (err) {
            console.error('Send error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DoctorLayout activeLabel="Patient Consultation" activePath="/doctor/chat">
            <div style={{
                display: 'flex',
                height: 'calc(100vh - 84px)',
                background: '#f8f9fa',
                fontFamily: "'Inter', sans-serif",
                margin: '10px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.8)'
            }}>
                {/* Sidebar */}
                <div style={{
                    width: 320,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRight: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 16 }}>Messages</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} color="#868e96" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                id="patient-search"
                                name="patient-search"
                                type="text"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 38px',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef',
                                    background: '#fff',
                                    fontSize: 14,
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                        {fetchingPatients ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><Loader className="animate-spin" color="#3b5bdb" /></div>
                        ) : filteredPatients.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#868e96' }}>
                                <MessageSquare size={40} style={{ marginBottom: 12, opacity: 0.1 }} />
                                <div style={{ fontSize: 13, fontWeight: 500 }}>No results found</div>
                            </div>
                        ) : (
                            filteredPatients.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPatient(p)}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderRadius: '12px',
                                        background: selectedPatient?.id === p.id ? '#3b5bdb' : 'transparent',
                                        marginBottom: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: selectedPatient?.id === p.id ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: selectedPatient?.id === p.id ? '0 4px 12px rgba(59, 91, 219, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '14px',
                                        background: selectedPatient?.id === p.id ? 'rgba(255,255,255,0.2)' : '#e7f5ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: selectedPatient?.id === p.id ? '#fff' : '#3b5bdb'
                                    }}>
                                        {p.first_name[0]}{p.last_name[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: selectedPatient?.id === p.id ? '#fff' : '#1a1a2e',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {p.first_name} {p.last_name}
                                        </div>
                                        <div style={{
                                            fontSize: 11,
                                            color: selectedPatient?.id === p.id ? 'rgba(255,255,255,0.8)' : '#2f9e44',
                                            fontWeight: 600,
                                            marginTop: 2
                                        }}>
                                            Premium Patient
                                        </div>
                                    </div>
                                    {selectedPatient?.id === p.id && (
                                        <div style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%' }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                    {selectedPatient ? (
                        <>
                            <div style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid #f1f3f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#fff'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#e7f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={24} color="#3b5bdb" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#1a1a2e' }}>{selectedPatient.first_name} {selectedPatient.last_name}</div>
                                        <div style={{ fontSize: 12, color: '#2f9e44', fontWeight: 600 }}>Currently Online</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button 
                                        onClick={async () => {
                                            const roomID = `room_${selectedPatient.id}_${user.id}`;
                                            setActiveCall({ roomID, isVideo: false });
                                            ringtone.playOutgoing();
                                            await API.post('/chat/call/initiate', { receiver_id: selectedPatient.id, roomID, isVideo: false });
                                        }}
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#f8f9fa',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#3b5bdb',
                                            transition: 'background 0.2s'
                                        }}>
                                        <Phone size={18} />
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const roomID = `room_${selectedPatient.id}_${user.id}`;
                                            setActiveCall({ roomID, isVideo: true });
                                            ringtone.playOutgoing();
                                            await API.post('/chat/call/initiate', { receiver_id: selectedPatient.id, roomID, isVideo: true });
                                        }}
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#f8f9fa',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#3b5bdb',
                                            transition: 'background 0.2s'
                                        }}>
                                        <Video size={18} />
                                    </button>
                                    <button style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: '#f8f9fa',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#495057',
                                        transition: 'background 0.2s'
                                    }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                flex: 1,
                                padding: '32px 24px',
                                overflowY: 'auto',
                                background: '#f8f9fa',
                                backgroundImage: 'radial-gradient(#dee2e6 0.5px, transparent 0.5px)',
                                backgroundSize: '24px 24px'
                            }}>
                                {messages.map((m, i) => {
                                    const isMe = m.sender_id === user.id;
                                    const showTime = true; // Could add logic for grouping

                                    return (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                                            marginBottom: 16,
                                            animation: 'fadeIn 0.3s ease-out'
                                        }}>
                                            <div style={{
                                                maxWidth: '65%',
                                                padding: '12px 16px',
                                                borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                                background: isMe ? '#e67700' : '#fff',
                                                color: isMe ? '#fff' : '#1a1a2e',
                                                fontSize: 14,
                                                fontWeight: 500,
                                                lineHeight: 1.5,
                                                boxShadow: isMe ? '0 4px 12px rgba(230, 119, 0, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                                                border: isMe ? 'none' : '1px solid #f1f3f5'
                                            }}>
                                                {m.content}
                                                {showTime && (
                                                    <div style={{
                                                        fontSize: 10,
                                                        color: isMe ? 'rgba(255,255,255,0.7)' : '#adb5bd',
                                                        marginTop: 6,
                                                        textAlign: 'right',
                                                        fontWeight: 600
                                                    }}>
                                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            <div style={{ padding: '24px', background: '#fff', borderTop: '1px solid #f1f3f5' }}>
                                <div style={{
                                    display: 'flex',
                                    gap: 12,
                                    background: '#f8f9fa',
                                    borderRadius: '16px',
                                    padding: '10px 16px',
                                    border: '1px solid #e9ecef',
                                    alignItems: 'center'
                                }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd' }}><Paperclip size={20} /></button>
                                    <input
                                        id="chat-input"
                                        name="chat-input"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type your medical response..."
                                        style={{
                                            flex: 1,
                                            background: 'none',
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: '#1a1a2e'
                                        }}
                                    />
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd' }}><Smile size={20} /></button>
                                    <button
                                        onClick={sendMessage}
                                        disabled={!input.trim() || loading}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '12px',
                                            background: '#e67700',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'transform 0.2s',
                                            opacity: !input.trim() || loading ? 0.6 : 1
                                        }}
                                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Send size={18} color="#fff" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#868e96',
                            background: '#f8f9fa'
                        }}>
                            <div style={{
                                width: 120,
                                height: 120,
                                borderRadius: '40px',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 24,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
                            }}>
                                <MessageSquare size={48} color="#dee2e6" />
                            </div>
                            <h3 style={{ fontSize: 20, color: '#1a1a2e', fontWeight: 800, marginBottom: 8 }}>Select a conversation</h3>
                            <p style={{ fontSize: 14, color: '#868e96', maxWidth: 280, textAlign: 'center', lineHeight: 1.6 }}>
                                Choose a patient from the left to start or continue your medical consultation.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #e9ecef;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #dee2e6;
                }
            `}</style>
            {activeCall && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' }}>
                    <button 
                        onClick={() => setActiveCall(null)}
                        style={{ position: 'absolute', top: 20, right: 20, zIndex: 10001, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={24} />
                    </button>
                    <CallContainer 
                        roomID={activeCall.roomID}
                        userID={user.id.toString()}
                        userName={`Dr. ${user.first_name} ${user.last_name}`}
                        isVideoCall={activeCall.isVideo}
                        onLeave={() => { setActiveCall(null); ringtone.stopAll(); }}
                    />
                </div>
            )}
        </DoctorLayout>
    );
}
