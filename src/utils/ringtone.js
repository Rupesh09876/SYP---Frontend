// Ringtone utility for HAMS
class Ringtone {
    constructor() {
        this.outgoing = null;
        this.incoming = null;
        // Use reliable, direct links to standard tones
        this.outgoingSrc = 'https://assets.mixkit.co/sfx/preview/mixkit-phone-calling-tone-2733.mp3'; 
        this.incomingSrc = 'https://assets.mixkit.co/sfx/preview/mixkit-phone-ring-standard-tone-2735.mp3';
    }

    playOutgoing() {
        try {
            if (this.outgoing) return;
            this.outgoing = new Audio(this.outgoingSrc);
            this.outgoing.loop = true;
            this.outgoing.play().catch(e => {
                console.warn('Outgoing ringtone play blocked or failed:', e.message);
                this.outgoing = null;
            });
        } catch (err) {
            console.error('Audio init error:', err);
        }
    }

    stopOutgoing() {
        if (this.outgoing) {
            try { this.outgoing.pause(); } catch (_) {}
            this.outgoing = null;
        }
    }

    playIncoming() {
        try {
            if (this.incoming) return;
            this.incoming = new Audio(this.incomingSrc);
            this.incoming.loop = true;
            this.incoming.play().catch(e => {
                console.warn('Incoming ringtone play blocked or failed:', e.message);
                this.incoming = null;
            });
        } catch (err) {
            console.error('Audio init error:', err);
        }
    }

    stopIncoming() {
        if (this.incoming) {
            try { this.incoming.pause(); } catch (_) {}
            this.incoming = null;
        }
    }

    stopAll() {
        this.stopOutgoing();
        this.stopIncoming();
    }
}

export const ringtone = new Ringtone();
