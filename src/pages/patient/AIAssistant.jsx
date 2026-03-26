import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import PatientLayout from './PatientLayout';
import VoiceAssistant from '../../components/VoiceAssistant';
import API from '../../utils/api';

const SUGGESTIONS = [
  'What are common symptoms of diabetes?',
  'How can I improve my sleep quality?',
  'What should I know about blood pressure?',
  'Tips for managing stress and anxiety',
];

const WELCOME = {
  role: 'assistant',
  content: `Hello! I'm your AI Health Assistant 👋\n\nI can help you with:\n• Explaining medical terms and conditions\n• General health information and wellness tips\n• Understanding your symptoms (not a diagnosis)\n• Medication general information\n• Preparing questions for your doctor\n\nImportant: I'm an AI and cannot replace professional medical advice. Always consult your doctor for medical decisions.\n\nHow can I help you today?`,
  ts: new Date(),
};

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: isUser ? '#3b5bdb' : '#2f9e44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isUser ? <User size={14} color="#fff" /> : <Bot size={14} color="#fff" />}
      </div>
      <div style={{ maxWidth: '72%' }}>
        <div style={{ background: isUser ? '#3b5bdb' : '#fff', color: isUser ? '#fff' : '#1a1a2e', padding: '10px 14px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 13, lineHeight: 1.6, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', whiteSpace: 'pre-wrap', border: isUser ? 'none' : '1px solid #f0f2f5' }}>
          {msg.content}
        </div>
        <div style={{ fontSize: 10, color: '#adb5bd', marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
          {msg.ts?.toLocaleTimeString?.('en-US', { hour: '2-digit', minute: '2-digit' }) || ''}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: txt, ts: new Date() }]);
    setInput(''); setLoading(true);
    try {
      const currentHistory = messages
        .filter(m => m.content !== WELCOME.content) 
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
      
      // Ensure the history is correctly sequenced: User -> Model -> User
      // If the first message is from the model, we must remove it as Gemini requires history to start with User
      if (currentHistory.length > 0 && currentHistory[0].role === 'model') {
        currentHistory.shift();
      }

      // Add the current message
      currentHistory.push({ role: 'user', parts: [{ text: txt }] });
      
      let res;
      let retries = 1;
      const model = "gemini-2.0-flash"; 
      
      const makeRequest = async () => {
        const systemPrompt = "You are a professional AI health assistant for MedCare hospital. Provide general health information, explain medical terms, and prepare patients for visits. Always recommend consulting a healthcare professional for specific medical advice. Be empathetic, professional, and EXTREMELY thorough. Your responses MUST be between 200 and 400 words. Provide detailed explanations and avoid brief summaries. Format responses in Markdown.";
        
        const contents = [];
        const relevantHistory = messages.slice(-10).filter(m => m.content !== WELCOME.content);
        
        relevantHistory.forEach((m) => {
          const role = m.role === 'assistant' ? 'model' : 'user';
          if (contents.length === 0 && role !== 'user') return;
          
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += "\n" + m.content;
          } else {
            contents.push({ role, parts: [{ text: m.content }] });
          }
        });

        if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
            contents.push({ role: 'user', parts: [{ text: txt }] });
        } else if (contents[contents.length - 1].parts[0].text !== txt) {
            contents[contents.length - 1].parts[0].text += "\n" + txt;
        }

        return API.post('/ai/chat', {
            contents,
            system_instruction: { parts: [{ text: systemPrompt }] },
            model: "gemini-flash-latest",
            generationConfig: { 
                maxOutputTokens: 1500, 
                temperature: 0.8 
            }
        });
      };
      const response = await makeRequest();
      const data = response.data;
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not respond.';

      setMessages(prev => [...prev, { role: 'assistant', content: responseText, ts: new Date() }]);
    } catch (err) {
        console.error('AI Assistant Catch:', err);
        let errMsg = 'Sorry, I encountered an error. Please try again.';
        
        if (err.response?.data?.error) {
            errMsg = `AI Error: ${err.response.data.error}`;
        } else if (err.message) {
            errMsg = `System Error: ${err.message}`;
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg, ts: new Date() }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  return (
    <PatientLayout activeLabel="AI Assistant">
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', fontFamily: "'Inter', sans-serif" }}>

        {/* Header */}
        <div style={{ padding: '12px 28px', background: '#fff', borderBottom: '1px solid #e8eaed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: '#2f9e44', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Health AI Assistant</div>
              <div style={{ fontSize: 11, color: '#2f9e44', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2f9e44', flexShrink: 0 }} /> Online
              </div>
            </div>
          </div>
          <button onClick={() => { setMessages([WELCOME]); inputRef.current?.focus(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f0f2f5', border: 'none', borderRadius: 8, color: '#495057', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={12} /> New Chat
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ padding: '8px 28px', background: '#fff9db', borderBottom: '1px solid #ffe066', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <AlertCircle size={13} color="#f59f00" />
          <span style={{ fontSize: 11, color: '#e67700' }}>AI responses are for informational purposes only. Always consult a qualified healthcare professional.</span>
        </div>

        {/* Voice Assistant (Premium Only) */}
        {user.subscription_tier === 'premium' && (
          <div style={{ padding: '24px 28px 0', background: '#f8f9fa' }}>
            <VoiceAssistant />
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', background: '#f8f9fa' }}>
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}

          {/* Typing */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2f9e44', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color="#fff" />
              </div>
              <div style={{ background: '#fff', border: '1px solid #f0f2f5', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#868e96', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 12, color: '#868e96', marginBottom: 8, fontWeight: 600 }}>Try asking:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #dee2e6', borderRadius: 20, fontSize: 12, color: '#495057', cursor: 'pointer', fontWeight: 500 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '14px 28px', background: '#fff', borderTop: '1px solid #e8eaed', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#f8f9fa', borderRadius: 12, padding: '8px 10px', border: '1px solid #dee2e6' }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Type your health question... (Enter to send)" rows={1} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#1a1a2e', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto' }} />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: 8, background: input.trim() && !loading ? '#3b5bdb' : '#dee2e6', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {loading ? <Loader size={15} color="#868e96" /> : <Send size={15} color={input.trim() ? '#fff' : '#868e96'} />}
            </button>
          </div>
          <div style={{ fontSize: 10, color: '#adb5bd', marginTop: 5, textAlign: 'center' }}>Powered by Google Gemini AI · Shift+Enter for new line</div>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </PatientLayout>
  );
}
