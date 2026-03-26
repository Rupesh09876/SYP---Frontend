// frontend/src/components/NotificationPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, FileText, Info, XCircle, Clock, MessageCircle, Star, Phone } from 'lucide-react';

export default function NotificationPanel({ notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead, onDelete, isDark = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'appointment': return <Calendar size={14} color="#3b82f6" />;
            case 'report': return <FileText size={14} color="#10b981" />;
            case 'confirmation': return <Check size={14} color="#10b981" />;
            case 'cancelled': return <XCircle size={14} color="#ef4444" />;
            case 'chat': return <MessageCircle size={14} color="#8b5cf6" />;
            case 'call': return <Phone size={14} color="#fff" />;
            case 'subscription': return <Star size={14} color="#f59f00" />;
            default: return <Info size={14} color="#8b5cf6" />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'appointment': return '#eff6ff';
            case 'report': return '#ecfdf5';
            case 'confirmation': return '#ecfdf5';
            case 'cancelled': return '#fef2f2';
            case 'chat': return '#f5f3ff';
            case 'call': return '#fa5252';
            case 'subscription': return '#fff9db';
            default: return '#f5f3ff';
        }
    };

    const formatTime = (date) => {
        try {
            const d = new Date(date);
            const now = new Date();
            const diff = (now - d) / 1000; // seconds
            if (diff < 60) return 'Just now';
            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
            return d.toLocaleDateString();
        } catch { return ''; }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#f8f9fa',
                    border: isDark ? 'none' : '1px solid #e8eaed',
                    width: 40, height: 40,
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: isDark ? '#f1f5f9' : '#1e293b'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f8f9fa';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <Bell size={19} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 8, right: 10, width: 8, height: 8,
                        background: '#ef4444', borderRadius: '50%',
                        boxShadow: isDark ? '0 0 0 2px #0f1729' : '0 0 0 2px #fff',
                        animation: 'pulse 2s infinite'
                    }} />
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 52, right: 0, width: 360, background: '#fff',
                    borderRadius: 18, boxShadow: '0 20px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                    zIndex: 1000, overflow: 'hidden', animation: 'scaleUp 0.2s ease-out'
                }}>
                    <div style={{
                        padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: '#fcfdfe'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Notifications</h3>
                            {unreadCount > 0 && (
                                <span style={{ background: '#eff6ff', color: '#3b82f6', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={onMarkAllRead} style={{
                                background: 'none', border: 'none', color: '#6366f1', fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
                                transition: 'background 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                                <div style={{
                                    width: 56, height: 56, background: '#f8f9fa', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Bell size={24} style={{ color: '#cbd5e1' }} />
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>All Caught Up!</div>
                                <div style={{ fontSize: 13, color: '#64748b' }}>No notifications to show right now.</div>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
                                    background: n.is_read ? '#fff' : 'rgba(99, 102, 241, 0.04)',
                                    transition: 'all 0.2s ease', cursor: 'pointer'
                                }} onMouseEnter={e => e.currentTarget.style.background = n.is_read ? '#fcfdfe' : 'rgba(99, 102, 241, 0.06)'}>
                                    <div style={{ display: 'flex', gap: 14 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                            background: getBg(n.type), display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                                                <div style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0, marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={10} /> {formatTime(n.created_at)}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {n.message}
                                            </div>
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                {!n.is_read && (
                                                    <button onClick={() => onMarkRead(n.id)} style={{
                                                        background: 'none', border: 'none', color: '#6366f1', fontSize: 11,
                                                        fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4
                                                    }}>
                                                        <Check size={12} /> Mark as read
                                                    </button>
                                                )}
                                                <button onClick={() => onDelete(n.id)} style={{
                                                    background: 'none', border: 'none', color: '#ef4444', fontSize: 11,
                                                    fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4
                                                }}>
                                                    <Trash2 size={12} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div style={{ padding: '12px 24px', background: '#f8fafc', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <style>
                {`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                @keyframes scaleUp {
                    from { opacity: 0; transform: scale(0.95) translateY(-5px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                `}
            </style>
        </div>
    );
}
