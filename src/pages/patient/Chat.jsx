import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Loader, UserCircle, Video, Phone, X, Paperclip, Smile } from 'lucide-react';
import PatientLayout from './PatientLayout';
import API from '../../utils/api';
import CallContainer from '../../components/CallContainer';
import { ringtone } from '../../utils/ringtone';

export default function Chat() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingDoctors, setFetchingDoctors] = useState(true);
    const [activeCall, setActiveCall] = useState(null); // { roomID, isVideo }
    const [showEmojis, setShowEmojis] = useState(false);
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);
    const EMOJIS = ['👍','❤️','😂','😮','😢','🎉','😊','🙏','🩺','💊','🩹','✅'];

    const isPremium = user.subscription_tier === 'premium';

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        setDoctors(res.data.data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setFetchingDoctors(false);
      }
    };
    if (isPremium) {
      fetchDoctors();
      const interval = setInterval(fetchDoctors, 5000); // Poll list every 5s
      return () => clearInterval(interval);
    }
  }, [isPremium]);

    // Handle message history when doctor selected
    useEffect(() => {
        let interval;
        if (selectedDoctor) {
            const fetchHistory = async () => {
                try {
                    const res = await API.get(`/chat/history/${selectedDoctor.id}`);
                    setMessages(res.data.data);
                } catch (err) {
                    console.error('Chat history error:', err);
                }
            };
            fetchHistory();
            interval = setInterval(fetchHistory, 3000); // Poll every 3s
        }
        return () => clearInterval(interval);
    }, [selectedDoctor]);

    useEffect(() => { 
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // If user is within 150px of the bottom, stay sticky
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (isNearBottom) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
        }
    }, [messages]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file || !selectedDoctor) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large. Max 2MB allowed.');
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result;
            setLoading(true);
            try {
                const res = await API.post('/chat/send', { 
                    receiver_id: selectedDoctor.id, 
                    content: `[ATTACHMENT:${file.name}]\n${base64}` 
                });
                if (res.data.success) {
                    setMessages(prev => [...prev, res.data.data]);
                }
            } catch (err) {
                console.error('Attachment error:', err);
                alert('Failed to send attachment');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // reset
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedDoctor || loading) return;
        const msg = input.trim();
        setInput('');
        setLoading(true);
        try {
            const res = await API.post('/chat/send', { receiver_id: selectedDoctor.id, content: msg });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.data]);
            }
        } catch (err) {
            console.error('Send error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isPremium) {
        return (
            <PatientLayout activeLabel="Live Chat">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center', padding: 20 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff9db', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <MessageSquare size={40} color="#f59f00" />
                    </div>
                    <h2 style={{ fontSize: 24, color: '#1a1a2e', marginBottom: 12 }}>Premium Feature</h2>
                    <p style={{ color: '#495057', maxWidth: 400, lineHeight: 1.6, marginBottom: 24 }}>
                        Live chat with doctors is exclusive to our Premium members. Upgrade your account to get instant access to medical professionals.
                    </p>
                    <a href="/patient/subscription" style={{ padding: '12px 24px', background: '#3b5bdb', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
                        Upgrade to Premium
                    </a>
                </div>
            </PatientLayout>
        );
    }

    return (
        <PatientLayout activeLabel="Live Chat">
            <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
                {/* Sidebar */}
                <div style={{ width: 320, borderRight: '1px solid #e8eaed', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8eaed' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, m: 0 }}>Messages</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {fetchingDoctors ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><Loader className="animate-spin" /></div>
                        ) : (
                            doctors.map(dr => (
                                <div
                                    key={dr.id}
                                    onClick={() => setSelectedDoctor(dr)}
                                    style={{
                                        padding: '16px 24px',
                                        cursor: 'pointer',
                                        background: selectedDoctor?.id === dr.id ? '#f3f6ff' : 'transparent',
                                        borderLeft: selectedDoctor?.id === dr.id ? '4px solid #3b5bdb' : '4px solid transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserCircle size={32} color="#adb5bd" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {dr.last_name}</div>
                                        <div style={{ fontSize: 12, color: '#868e96' }}>{dr.category || 'Specialist'}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedDoctor ? (
                        <>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <UserCircle size={32} color="#adb5bd" />
                                <div style={{ fontWeight: 600, flex: 1 }}>Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button 
                                        onClick={async () => {
                                            const roomID = `room_${user.id}_${selectedDoctor.id}`;
                                            setActiveCall({ roomID, isVideo: false });
                                            ringtone.playOutgoing();
                                            await API.post('/chat/call/initiate', { receiver_id: selectedDoctor.id, roomID, isVideo: false });
                                        }}
                                        style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f9fa', border: '1px solid #e8eaed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b5bdb' }}
                                        title="Audio Call"
                                    >
                                        <Phone size={18} />
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const roomID = `room_${user.id}_${selectedDoctor.id}`;
                                            setActiveCall({ roomID, isVideo: true });
                                            ringtone.playOutgoing();
                                            await API.post('/chat/call/initiate', { receiver_id: selectedDoctor.id, roomID, isVideo: true });
                                        }}
                                        style={{ width: 36, height: 36, borderRadius: 8, background: '#f8f9fa', border: '1px solid #e8eaed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b5bdb' }}
                                        title="Video Call"
                                    >
                                        <Video size={18} />
                                    </button>
                                </div>
                            </div>
                            <div 
                                ref={scrollRef}
                                style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8f9fa' }}
                            >
                                {messages.map((m, i) => {
                                    const isMe = m.sender_id === user.id;
                                    
                                    let renderedContent = m.content;
                                    if (typeof m.content === 'string' && m.content.startsWith('[ATTACHMENT:')) {
                                        const lines = m.content.split('\n');
                                        const fileNameInfo = lines[0].match(/\[ATTACHMENT:(.*?)\]/);
                                        const fileName = fileNameInfo ? fileNameInfo[1] : 'Document';
                                        const base64Data = lines.slice(1).join('\n');
                                        const isImage = base64Data.startsWith('data:image/');
                                        renderedContent = (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>📎 {fileName}</div>
                                                {isImage ? (
                                                    <img src={base64Data} alt="attachment" style={{ maxWidth: 220, borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
                                                ) : (
                                                    <a href={base64Data} download={fileName} style={{ color: 'inherit', textDecoration: 'underline', fontSize: 13 }}>Download / View File</a>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                                            <div style={{
                                                maxWidth: '75%',
                                                padding: '10px 14px',
                                                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                background: isMe ? '#3b5bdb' : '#fff',
                                                color: isMe ? '#fff' : '#1a1a2e',
                                                fontSize: 14,
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                border: isMe ? 'none' : '1px solid #e8eaed',
                                                wordBreak: 'break-word'
                                            }}>
                                                {renderedContent}
                                                <div style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.7)' : '#adb5bd', marginTop: 4, textAlign: 'right' }}>
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <div style={{ padding: '20px 24px', borderTop: '1px solid #e8eaed', position: 'relative' }}>
                                {showEmojis && (
                                    <div style={{ position: 'absolute', bottom: 80, left: 24, background: '#fff', border: '1px solid #e8eaed', borderRadius: 12, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, zIndex: 10 }}>
                                        {EMOJIS.map(emoji => (
                                            <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojis(false); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4, borderRadius: 8, transition: 'background 0.2s' }}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 12, background: '#f8f9fa', borderRadius: 12, padding: '8px 12px', border: '1px solid #e8eaed', alignItems: 'center' }}>
                                    <button onClick={() => setShowEmojis(!showEmojis)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#868e96', display: 'flex', alignItems: 'center', padding: 4 }}>
                                        <Smile size={20} />
                                    </button>
                                    <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#868e96', display: 'flex', alignItems: 'center', padding: 4 }}>
                                        <Paperclip size={20} />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx" />
                                    <input
                                        id="patient-chat-input"
                                        name="patient-chat-input"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message..."
                                        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14 }}
                                    />
                                    <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: 8, background: '#3b5bdb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Send size={18} color="#fff" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#868e96' }}>
                            <MessageSquare size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                            <div>Select a doctor to start chatting</div>
                        </div>
                    )}
                </div>
            </div>
            {activeCall && (
                <CallContainer 
                    roomID={activeCall.roomID} 
                    userID={user.id} 
                    userName={user.first_name} 
                    isVideoCall={activeCall.isVideo} 
                    onLeave={() => setActiveCall(null)} 
                />
            )}
        </PatientLayout>
    );
}
