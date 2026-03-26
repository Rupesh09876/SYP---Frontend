// Ringtone utility for HAMS
class Ringtone {
    constructor() {
        this.outgoing = null;
        this.incoming = null;
        // Updated with even more realistic, standard telephone sounds
        this.outgoingSrc = 'https://www.soundjay.com/phone/sounds/phone-calling-1.mp3'; // Standard US calling tone
        this.incomingSrc = 'https://www.soundjay.com/phone/sounds/telephone-ring-03a.mp3'; // Classic ringing sound
    }

    playOutgoing() {
        if (this.outgoing) return;
        this.outgoing = new Audio(this.outgoingSrc);
        this.outgoing.loop = true;
        this.outgoing.play().catch(e => console.warn('Ringtone play failed:', e));
    }

    stopOutgoing() {
        if (this.outgoing) {
            this.outgoing.pause();
            this.outgoing = null;
        }
    }

    playIncoming() {
        if (this.incoming) return;
        this.incoming = new Audio(this.incomingSrc);
        this.incoming.loop = true;
        this.incoming.play().catch(e => console.warn('Ringtone play failed:', e));
    }

    stopIncoming() {
        if (this.incoming) {
            this.incoming.pause();
            this.incoming = null;
        }
    }

    stopAll() {
        this.stopOutgoing();
        this.stopIncoming();
    }
}

export const ringtone = new Ringtone();
