import crowdMusicSrc from "../../imports/crowd_music.mp3";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isMuted: boolean = false;
  private lastPlayed: Map<string, number> = new Map();
  private hoverScale = [196.0, 220.0, 246.9, 293.7, 329.6, 349.2, 392.0];
  private cardScale = [130.8, 146.8, 164.8, 196.0, 220.0, 246.9];
  private crowdAudio: HTMLAudioElement | null = null;
  private targetCrowdVolume: number = 0.0;

  public init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -20;
      this.compressor.knee.value = 20;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.15;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.35;

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
    
    try {
      if (!this.crowdAudio) {
        this.crowdAudio = new Audio(crowdMusicSrc);
        this.crowdAudio.loop = true;
        this.crowdAudio.volume = 0;
        this.targetCrowdVolume = 0.05;
      }
    } catch (e) {
      console.warn('Audio tag not supported', e);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.35, this.ctx?.currentTime || 0, 0.05);
    }
    if (this.crowdAudio) {
      this.crowdAudio.volume = this.isMuted ? 0 : this.targetCrowdVolume;
    }
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.35, this.ctx?.currentTime || 0, 0.05);
    }
    if (this.crowdAudio) {
      this.crowdAudio.volume = this.isMuted ? 0 : this.targetCrowdVolume;
    }
  }

  public get isMutedState() {
    return this.isMuted;
  }

  public playCrowdBackground() {
    this.init();
    if (this.crowdAudio && this.crowdAudio.paused) {
      this.crowdAudio.play().catch(e => console.warn("Crowd audio autoplay blocked", e));
    }
  }

  public setCrowdIntensity(intensity: 'low' | 'high') {
    this.targetCrowdVolume = intensity === 'high' ? 0.15 : 0.05;
    if (this.crowdAudio && !this.isMuted) {
      // Simple fade
      const fade = setInterval(() => {
        if (!this.crowdAudio || this.isMuted) {
          clearInterval(fade);
          return;
        }
        const diff = this.targetCrowdVolume - this.crowdAudio.volume;
        if (Math.abs(diff) < 0.01) {
          this.crowdAudio.volume = this.targetCrowdVolume;
          clearInterval(fade);
        } else {
          this.crowdAudio.volume += diff * 0.1;
        }
      }, 50);
    }
  }

  private _rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  private _checkDebounce(key: string, delayMs: number): boolean {
    const now = performance.now();
    const last = this.lastPlayed.get(key) || 0;
    if (now - last < delayMs) return false;
    this.lastPlayed.set(key, now);
    return true;
  }

  private _createSoftener(freq: number, q: number = 0.7) {
    if (!this.ctx || !this.compressor) return null;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    filter.connect(this.compressor);
    return filter;
  }

  public clickPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('clickPop', 90)) return;

    const t = this.ctx.currentTime;
    const baseFreq = this._rand(280, 340);
    const softener = this._createSoftener(1400);
    if (!softener) return;

    // Layer 1: Main pop body
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, t + 0.09);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.5, t);
    g1.gain.setValueAtTime(0.5, t + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.12);

    // Layer 2: Sub thump
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 0.5, t);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.15, t + 0.1);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.3, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t);
    osc2.stop(t + 0.1);

    // Layer 3: Noise snap
    const bufferSize = this.ctx.sampleRate * 0.025;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 600;
    noiseFilter.Q.value = 2;
    const gNoise = this.ctx.createGain();
    gNoise.gain.setValueAtTime(0.15, t);
    gNoise.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    noise.connect(noiseFilter);
    noiseFilter.connect(gNoise);
    gNoise.connect(softener);
    noise.start(t);
  }

  public clickSwitch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('clickSwitch', 90)) return;

    const t = this.ctx.currentTime;
    const f = this._rand(250, 320);
    const softener = this._createSoftener(1200);
    if (!softener) return;

    // Pop 1
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(f, t);
    osc1.frequency.exponentialRampToValueAtTime(f * 0.4, t + 0.06);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.35, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc1.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.07);

    // Pop 2
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f * 1.3, t + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.12);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.setValueAtTime(0.2, t + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t + 0.05);
    osc2.stop(t + 0.13);
  }

  public clickWood() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('clickWood', 90)) return;

    const t = this.ctx.currentTime;
    const f = this._rand(140, 180);
    const softener = this._createSoftener(900);
    if (!softener) return;

    // Body
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, t);
    osc1.frequency.exponentialRampToValueAtTime(f * 0.3, t + 0.12);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.55, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc1.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.14);

    // Resonance
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(f * 2.2, t);
    osc2.frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.08);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.12, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t);
    osc2.stop(t + 0.08);
  }

  public clickBubble() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('clickBubble', 90)) return;

    const t = this.ctx.currentTime;
    const f = this._rand(380, 480);
    const softener = this._createSoftener(1300);
    if (!softener) return;

    // Bubble
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, t);
    osc1.frequency.exponentialRampToValueAtTime(f * 0.2, t + 0.1);
    
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(f * 0.8, t);
    bp.frequency.linearRampToValueAtTime(200, t + 0.1);
    bp.Q.value = 4;

    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc1.connect(bp);
    bp.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.1);

    // Sub
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f * 0.4, t);
    osc2.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t);
    osc2.stop(t + 0.1);
  }

  public clickThunk() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('clickThunk', 90)) return;

    const t = this.ctx.currentTime;
    const f = this._rand(100, 130);
    const softener = this._createSoftener(800);
    if (!softener) return;

    // Deep
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, t);
    osc1.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.6, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc1.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.18);

    // Transient
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(f * 3, t);
    osc2.frequency.exponentialRampToValueAtTime(f, t + 0.04);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t);
    osc2.stop(t + 0.05);
  }

  public clickSnap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('clickSnap', 90)) return;

    const t = this.ctx.currentTime;
    const f = this._rand(500, 650);
    const softener = this._createSoftener(1100);
    if (!softener) return;

    // Snap
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, t);
    osc1.frequency.exponentialRampToValueAtTime(f * 0.25, t + 0.06);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.3, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc1.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.06);

    // Body
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f * 0.35, t);
    osc2.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t);
    osc2.stop(t + 0.1);
  }

  public hoverNote(index: number = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('hoverNote', 150)) return;

    const t = this.ctx.currentTime;
    const baseFreq = this.hoverScale[index % this.hoverScale.length];
    const f = baseFreq * this._rand(0.98, 1.02);
    const softener = this._createSoftener(1000);
    if (!softener) return;

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, t);
    osc1.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.08);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.2, t + 0.005);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc1.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.1);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f * 0.5, t);
    osc2.frequency.exponentialRampToValueAtTime(f * 0.2, t + 0.08);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.15, t + 0.005);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t);
    osc2.stop(t + 0.1);
  }

  public cardHover(index: number = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this._checkDebounce('cardHover', 280)) return;

    const t = this.ctx.currentTime;
    const baseFreq = this.cardScale[index % this.cardScale.length];
    const f = baseFreq * this._rand(0.98, 1.02);
    const softener = this._createSoftener(900);
    if (!softener) return;

    // Fundamental
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, t);
    osc1.frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.15);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.3, t + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc1.connect(g1);
    g1.connect(softener);
    osc1.start(t);
    osc1.stop(t + 0.2);

    // Sub
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f * 0.5, t);
    osc2.frequency.exponentialRampToValueAtTime(f * 0.4, t + 0.15);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.15, t + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc2.connect(g2);
    g2.connect(softener);
    osc2.start(t);
    osc2.stop(t + 0.2);

    // Overtone
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(f * 1.5, t);
    osc3.frequency.exponentialRampToValueAtTime(f * 1.2, t + 0.1);
    const g3 = this.ctx.createGain();
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(0.06, t + 0.008);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc3.connect(g3);
    g3.connect(softener);
    osc3.start(t);
    osc3.stop(t + 0.15);
  }
}

export const soundEngine = new AudioEngine();
