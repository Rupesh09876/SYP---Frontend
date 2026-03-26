// frontend/src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import API from '../utils/api';
import { ringtone } from '../utils/ringtone';

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [incomingCall, setIncomingCall] = useState(null); // { roomID, isVideo, senderName, notificationId }

    const fetchNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            const data = res.data?.data || [];
            
            // Check for new, unread call notifications
            const callNotif = data.find(n => n.type === 'call' && !n.is_read);
            if (callNotif) {
                try {
                    const meta = JSON.parse(callNotif.message);
                    setIncomingCall({
                        ...meta,
                        notificationId: callNotif.id
                    });
                    ringtone.playIncoming();
                } catch (e) {
                    console.warn('Failed to parse call metadata', e);
                    setIncomingCall({
                        roomID: 'unknown',
                        isVideo: true,
                        senderName: 'Someone',
                        notificationId: callNotif.id
                    });
                    ringtone.playIncoming();
                }
            } else {
                setIncomingCall(null);
                ringtone.stopIncoming();
            }

            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 10 seconds for real-time call alerts
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (incomingCall?.notificationId === id) setIncomingCall(null);
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            setIncomingCall(null);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (incomingCall?.notificationId === id) setIncomingCall(null);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    };

    return { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllRead, 
        deleteNotification, 
        refresh: fetchNotifications,
        incomingCall,
        setIncomingCall
    };
}
