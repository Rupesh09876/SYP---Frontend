import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, User, Bot, Loader } from 'lucide-react';
import API from '../utils/api';

export default function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]); // Keep track of the voice conversation
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Voice recognition not supported. Please use Chrome or Edge.');
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = 'en-US';
        rec.interimResults = false;

        rec.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            fetchAIResponse(text);
        };
        rec.onerror = (e) => {
            console.error('Speech recognition error:', e.error);
            setIsListening(false);
            setError('Microphone error. Please allow microphone access and try again.');
        };
        rec.onend = () => setIsListening(false);

        recognitionRef.current = rec;
        return () => { recognitionRef.current?.abort(); };
    }, []);

    const fetchAIResponse = async (text) => {
        setLoading(true);
        setResponse('');
        
        const makeRequest = async () => {
            const systemPrompt = "You are a professional AI health assistant for MediCare hospital. " +
                "Provide helpful, extremely detailed, and clear health guidance. Your responses MUST be " +
                "at least 200 words and up to 400 words. Do not give short one-sentence answers. " +
                "Explain the 'why' behind your advice and provide multiple helpful tips. Format for natural speech.";
            
            // Build contents from history
            const contents = history.slice(-6).map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));
            
            // Add current message
            contents.push({ role: 'user', parts: [{ text: text }] });

            return API.post('/ai/chat', {
                contents,
                system_instruction: { parts: [{ text: systemPrompt }] },
                model: "gemini-flash-latest",
                generationConfig: { maxOutputTokens: 1000, temperature: 0.8 }
            });
        };

        try {
            const res = await makeRequest();
            const data = res.data;
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";
            
            // Update history
            setHistory(prev => [...prev.slice(-9), 
                { role: 'user', content: text },
                { role: 'model', content: reply }
            ]);
            
            setResponse(reply);
            speak(reply);
        } catch (err) {
            console.error('Voice Assistant Catch:', err);
            const errMsg = err.response?.data?.error || "Sorry, I encountered an error. Please try again.";
            setResponse(errMsg);
            speak(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            setResponse('');
            setError(null);
            setIsListening(true);
            window.speechSynthesis.cancel();
            recognitionRef.current.start();
        }
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #e7f0ff 0%, #f8f9fa 100%)', borderRadius: 16, padding: '24px', border: '1px solid #d0e0ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isListening ? '#f03e3e' : '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', animation: isListening ? 'pulse 1s infinite' : 'none' }}>
                        {isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Voice Assistant</div>
                        <div style={{ fontSize: 12, color: isListening ? '#f03e3e' : isSpeaking ? '#2f9e44' : '#868e96', fontWeight: 600 }}>
                            {isListening ? '🔴 Listening...' : isSpeaking ? '🔊 Speaking...' : loading ? '⏳ Thinking...' : '🎙️ Click to speak'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={toggleListening}
                    disabled={loading}
                    style={{ padding: '10px 20px', borderRadius: 12, background: isListening ? '#fff5f5' : '#3b5bdb', color: isListening ? '#fa5252' : '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? 'Stop' : 'Speak'}
                </button>
            </div>

            {transcript && (
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 10, marginBottom: 12, border: '1px solid #e1eaff' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#adb5bd', textTransform: 'uppercase', marginBottom: 4 }}>You said</div>
                    <p style={{ fontSize: 14, color: '#1a1a2e', lineHeight: 1.5, margin: 0 }}>{transcript}</p>
                </div>
            )}

            {loading && (
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: '#868e96', fontSize: 13 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid #dee2e6', borderTop: '2px solid #3b5bdb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    AI is thinking...
                </div>
            )}

            {response && !loading && (
                <div style={{ background: '#3b5bdb', padding: '14px 16px', borderRadius: 10, display: 'flex', gap: 10 }}>
                    <Bot size={16} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>AI Response</div>
                        <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.6, margin: 0 }}>{response}</p>
                    </div>
                    {isSpeaking ? (
                        <button onClick={stopSpeaking} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', alignSelf: 'start' }}><VolumeX size={16} /></button>
                    ) : (
                        <button onClick={() => speak(response)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', alignSelf: 'start' }}><Volume2 size={16} /></button>
                    )}
                </div>
            )}

            {error && (
                <div style={{ marginTop: 12, fontSize: 12, color: '#fa5252', background: '#fff5f5', padding: '10px 12px', borderRadius: 8, border: '1px solid #ffc9c9' }}>{error}</div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
            `}</style>
        </div>
    );
}
