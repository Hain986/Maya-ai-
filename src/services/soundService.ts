// Web Audio API Sound Generator for Maya AI (Zero external file dependencies)
class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft futuristic UI click chime
  playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // ignore audio context errors
    }
  }

  // Holographic Outfit Materialization Shimmer SFX
  playOutfitShimmer() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C E G C E G chord
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.35);
      });
    } catch (e) {
      // ignore
    }
  }

  // Heartbeat / Loving Emotion Resonance SFX
  playHeartbeat() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.22].forEach((delay) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, now + delay);
        osc.frequency.exponentialRampToValueAtTime(35, now + delay + 0.12);

        gain.gain.setValueAtTime(0.35, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch (e) {
      // ignore
    }
  }

  // Hairstyle / Accessory Sparkle Magic SFX
  playSparkle() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(2400, now + 0.15);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.25);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // ignore
    }
  }

  // Ambient Gentle Drone (Togglable)
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  toggleAmbientBGM(): boolean {
    try {
      this.initCtx();
      if (!this.ctx) return false;

      if (this.isAmbientPlaying) {
        if (this.ambientGain) {
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
          setTimeout(() => {
            this.ambientOsc?.stop();
            this.ambientOsc?.disconnect();
            this.ambientGain?.disconnect();
            this.ambientOsc = null;
            this.ambientGain = null;
          }, 850);
        }
        this.isAmbientPlaying = false;
        return false;
      } else {
        const now = this.ctx.currentTime;
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientGain = this.ctx.createGain();

        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.setValueAtTime(216, now); // 216Hz relaxing A frequency

        this.ambientGain.gain.setValueAtTime(0.001, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.04, now + 1.2);

        this.ambientOsc.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        this.ambientOsc.start(now);
        this.isAmbientPlaying = true;
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundService = new SoundService();
