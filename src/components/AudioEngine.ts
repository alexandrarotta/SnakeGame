import { Track } from '../types';

export const DUMMY_TRACKS: Track[] = [
  {
    id: 'track_1',
    title: 'Vapor Synthwave',
    genre: 'Synthwave / Retro',
    bpm: 115,
    description: 'A driving driving eighth-note cyber bassline with a soaring neon lead theme.',
    accentColor: '#ec4899', // Pink
    author: 'AI Synth Engine v1.0',
  },
  {
    id: 'track_2',
    title: 'Cyberpunk Glitch',
    genre: 'Industrial Cyber',
    bpm: 92,
    description: 'Dark, slow-burning rhythmic grinds, deep heavy basses, and space atmosphere.',
    accentColor: '#22c55e', // Green
    author: 'AI Synth Engine v1.0',
  },
  {
    id: 'track_3',
    title: 'Retro Chiptune',
    genre: '8-Bit Arcade',
    bpm: 138,
    description: 'Upbeat, nostalgic bubblegum bubble arpeggios and fast pace game tones.',
    accentColor: '#06b6d4', // Cyan
    author: 'AI Synth Engine v1.0',
  },
];

// Note frequencies map (A minor, C major scales)
const FREQS: Record<string, number> = {
  // Bass roots
  'A1': 55.00, 'B1': 61.74, 'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00,
  // Cyberpunk bass roots
  'E1': 41.20, 'F#1': 46.25, 'G1': 49.00, 'B0': 30.87, 'D1': 36.71,
  // Midrange / Lead notes
  'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
  'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
  'A5': 880.00, 'B5': 987.77, 'C6': 1046.50,
};

// Sequences represent note strings (or empty for silences) over 32 steps (2 bars of 16 steps)
interface TrackSequence {
  bass: (string | null)[];
  lead: (string | null)[];
  drums: ('K' | 'S' | 'H' | null)[]; // K = Kick, S = Snare, H = Hat
}

const SEQUENCES: Record<string, TrackSequence> = {
  track_1: {
    bass: [
      'A1', 'A1', 'A1', 'A1', 'C2', 'C2', 'C2', 'C2',
      'G2', 'G2', 'G2', 'G2', 'D2', 'D2', 'E2', 'G2',
      'A1', 'A1', 'A1', 'A1', 'C2', 'C2', 'C2', 'C2',
      'G2', 'G2', 'G2', 'G2', 'D2', 'D2', 'E2', 'C2',
    ],
    lead: [
      'E4', null, 'G4', null, 'A4', null, null, null,
      'G4', null, 'E4', null, 'D4', null, null, null,
      'E4', null, 'G4', null, 'A4', null, null, null,
      'B4', null, 'A4', null, 'G4', null, 'E4', null,
    ],
    drums: [
      'K', null, 'H', null, 'S', null, 'H', null,
      'K', null, 'H', null, 'S', null, 'H', null,
      'K', null, 'H', null, 'S', null, 'H', null,
      'K', 'K', 'H', null, 'S', null, 'H', 'H',
    ],
  },
  track_2: {
    bass: [
      'E1', null, 'E1', null, 'G1', null, 'F#1', null,
      'E1', null, 'E1', null, 'D1', null, 'B0', null,
      'E1', null, 'E1', null, 'G1', null, 'F#1', null,
      'E1', null, 'E1', null, 'D1', null, 'D1', 'F#1',
    ],
    lead: [
      'B3', null, null, 'G4', null, null, 'E4', null,
      null, 'F4', null, null, 'D4', null, null, null,
      'B3', null, null, 'G4', null, null, 'E4', null,
      null, 'F#4', null, 'A4', 'B4', null, 'A4', null,
    ],
    drums: [
      'K', null, null, null, 'S', null, null, null,
      'K', null, 'K', null, 'S', null, null, null,
      'K', null, null, null, 'S', null, null, null,
      'K', null, 'K', null, 'S', null, 'H', 'H',
    ],
  },
  track_3: {
    bass: [
      'C2', null, 'C2', null, 'E2', null, 'E2', null,
      'G2', null, 'G2', null, 'B1', null, 'B1', null,
      'C2', null, 'C2', null, 'E2', null, 'E2', null,
      'A1', null, 'A1', null, 'F2', null, 'G2', null,
    ],
    // Uplifting fast bubble arpeggio notes
    lead: [
      'C4', 'E4', 'G4', 'C5', 'E4', 'G4', 'C5', 'E5',
      'G4', 'C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'E4',
      'D4', 'F4', 'A4', 'D5', 'F4', 'A4', 'D5', 'F5',
      'G4', 'B4', 'D5', 'G5', 'F5', 'D5', 'B4', 'G4',
    ],
    drums: [
      'K', 'H', 'H', 'H', 'S', 'H', 'H', 'H',
      'K', 'H', 'H', 'H', 'S', 'H', 'H', 'H',
      'K', 'H', 'H', 'H', 'S', 'H', 'H', 'H',
      'K', 'K', 'H', 'H', 'S', 'H', 'S', 'H',
    ],
  },
};

export class AudioEngine {
  public ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;

  // Track status
  private currentTrackId: string = 'track_1';
  private currentBpm: number = 115;
  private isPlaying: boolean = false;
  private stepDuration: number = 0.13; // seconds per step, recalculated from BPM
  private currentStep: number = 0;
  private timerId: number | null = null;
  private nextStepTime: number = 0;

  // Synthesizer parameters (user controlled)
  public filterCutoff: number = 1500; // Hz
  public filterResonance: number = 4; // Q value
  public synthType: 'sawtooth' | 'square' | 'triangle' | 'sine' = 'sawtooth';
  public volumePercent: number = 80; // 0 - 100
  public delayWet: number = 0.3; // 0 - 1

  // Callbacks
  private onStepCallback: ((step: number) => void) | null = null;

  constructor() {
    // Lazy initialized on click to comply with browser autoplay policies
  }

  public init() {
    if (this.ctx) return;

    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Create main graph nodes
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volumePercent / 100;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = this.filterCutoff;
    this.filter.Q.value = this.filterResonance;

    // Set up a slapback spatial delay/echo effect
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayFeedback = this.ctx.createGain();

    this.delayNode.delayTime.value = 0.25; // 250 milliseconds echo
    this.delayFeedback.gain.value = this.delayWet * 0.5;

    // Wire up: [Synths] -> [Filter] -> [Delay Splitter] -> [MasterGain] -> [Analyser] -> [Destination]
    // Loop delay delayFeedback
    this.filter.connect(this.masterGain);
    
    // Connect filter to delay
    this.filter.connect(this.delayNode);
    // Connect delay output back to its feedback input with gain
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    // Connect delay output to master Gain so we hear the echo
    this.delayNode.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setOnStep(callback: (step: number) => void) {
    this.onStepCallback = callback;
  }

  public play(trackId: string, speedModifier: number = 1.0) {
    this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    const track = DUMMY_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    this.currentTrackId = trackId;
    // Scale BPM with speedModifier (increases intensity during high score!)
    this.currentBpm = track.bpm * speedModifier;
    
    // 4 steps per beat. Each step duration = (60 / BPM) / 4
    this.stepDuration = (60 / this.currentBpm) / 4;

    if (this.isPlaying) {
      // Just update sequencer settings dynamically
      return;
    }

    this.isPlaying = true;
    this.nextStepTime = this.ctx!.currentTime;
    this.scheduler();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public togglePlay(trackId: string, speedModifier: number = 1.0) {
    if (this.isPlaying && this.currentTrackId === trackId) {
      this.pause();
      return false;
    } else {
      this.play(trackId, speedModifier);
      return true;
    }
  }

  public setVolume(percent: number) {
    this.volumePercent = percent;
    if (this.masterGain && this.ctx) {
      const targetGain = percent / 100;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public setFilterCutoff(hz: number) {
    this.filterCutoff = hz;
    if (this.filter && this.ctx) {
      this.filter.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.05);
    }
  }

  public setFilterResonance(q: number) {
    this.filterResonance = q;
    if (this.filter && this.ctx) {
      this.filter.Q.setTargetAtTime(q, this.ctx.currentTime, 0.05);
    }
  }

  public setSynthType(type: 'sawtooth' | 'square' | 'triangle' | 'sine') {
    this.synthType = type;
  }

  public setDelayIntensity(wet: number) {
    this.delayWet = wet;
    if (this.delayFeedback && this.ctx) {
      this.delayFeedback.gain.setTargetAtTime(wet * 0.5, this.ctx.currentTime, 0.05);
    }
  }

  // Sequencer loop scheduler
  private scheduler() {
    if (!this.isPlaying || !this.ctx) return;

    // Schedule 120ms in advance
    while (this.nextStepTime < this.ctx.currentTime + 0.12) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      
      // Advance to next step
      this.currentStep = (this.currentStep + 1) % 32;
      this.nextStepTime += this.stepDuration;
    }

    // Keep checking every 25ms
    this.timerId = window.setTimeout(() => this.scheduler(), 25);
  }

  // Play a synthesized note or beat
  private scheduleStep(step: number, time: number) {
    if (!this.ctx || !this.filter) return;

    const seq = SEQUENCES[this.currentTrackId];
    if (!seq) return;

    // Trigger onStep React UI updates
    if (this.onStepCallback) {
      // Synchronize drawing with Web Audio thread closely by queuing the animation callback right before
      const relativeTimeMs = (time - this.ctx.currentTime) * 1000;
      setTimeout(() => {
        if (this.isPlaying && this.onStepCallback) {
          this.onStepCallback(step);
        }
      }, Math.max(0, relativeTimeMs));
    }

    // 1. Play Bass Note
    const bassNote = seq.bass[step];
    if (bassNote && FREQS[bassNote]) {
      this.playSynthVoice(FREQS[bassNote], 'triangle', 0.2, 0.15, time, true);
    }

    // 2. Play Lead Melody
    const leadNote = seq.lead[step];
    if (leadNote && FREQS[leadNote]) {
      this.playSynthVoice(FREQS[leadNote], this.synthType, 0.14, 0.22, time, false);
    }

    // 3. Play Drums
    const drum = seq.drums[step];
    if (drum === 'K') {
      this.playKickDrum(time);
    } else if (drum === 'S') {
      this.playSnareDrum(time);
    } else if (drum === 'H') {
      this.playHiHat(time);
    }
  }

  // Synthesizer voice engine
  private playSynthVoice(
    freq: number,
    type: 'sawtooth' | 'square' | 'triangle' | 'sine',
    volume: number,
    decay: number,
    time: number,
    isBass: boolean
  ) {
    if (!this.ctx || !this.filter) return;

    const osc = this.ctx.createOscillator();
    const voiceGain = this.ctx.createGain();

    // Sound configuration
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    if (isBass) {
      // Fast pitch drop for dynamic electronic growl
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, time + decay);
    } else {
      // Lead portamento effect or slight vibrato if we want
      osc.frequency.setValueAtTime(freq, time);
    }

    // Envelope Control: Instant Attack, Exponential Decay
    voiceGain.gain.setValueAtTime(0.001, time);
    voiceGain.gain.linearRampToValueAtTime(volume, time + 0.01);
    voiceGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(voiceGain);
    voiceGain.connect(this.filter);

    osc.start(time);
    osc.stop(time + decay);
  }

  // Synthesize dynamic kick drum (pitch drop sweep)
  private playKickDrum(time: number) {
    if (!this.ctx || !this.filter) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    gainNode.gain.setValueAtTime(0.4, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gainNode);
    gainNode.connect(this.filter);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  // Synthesize snare (white noise burst)
  private playSnareDrum(time: number) {
    if (!this.ctx || !this.filter) return;

    // Generate White Noise Buffer
    const bufferSize = this.ctx.sampleRate * 0.15; // 150ms length
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to isolate punchy snare frequencies (middle band)
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000;
    bandpass.Q.value = 1.5;

    const snrGain = this.ctx.createGain();
    snrGain.gain.setValueAtTime(0.18, time);
    snrGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noiseSource.connect(bandpass);
    bandpass.connect(snrGain);
    snrGain.connect(this.filter);

    noiseSource.start(time);
    noiseSource.stop(time + 0.15);
  }

  // Synthesize dynamic metallic high-hat (pitch high-passed sweep)
  private playHiHat(time: number) {
    if (!this.ctx || !this.filter) return;

    // Generates simple white noise burst with immediate high decay
    const bufferSize = this.ctx.sampleRate * 0.04; // 40ms tick
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(7000, time);

    const hatGain = this.ctx.createGain();
    hatGain.gain.setValueAtTime(0.08, time);
    hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    noise.connect(highpass);
    highpass.connect(hatGain);
    hatGain.connect(this.filter);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  // Triggers interactive game sound effects procedurally!
  public triggerSFX(type: 'eat' | 'die' | 'level' | 'click') {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const sfxOsc = this.ctx.createOscillator();
    const sfxGain = this.ctx.createGain();

    switch (type) {
      case 'eat': // High-frequency happy chime
        sfxOsc.type = 'sine';
        sfxOsc.frequency.setValueAtTime(523.25, now); // C5
        sfxOsc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6 sweep upward!
        sfxGain.gain.setValueAtTime(0.15, now);
        sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        
        sfxOsc.connect(sfxGain);
        sfxGain.connect(this.ctx.destination);
        sfxOsc.start(now);
        sfxOsc.stop(now + 0.19);
        break;

      case 'die': // Discordant crashing descend sweep
        sfxOsc.type = 'sawtooth';
        sfxOsc.frequency.setValueAtTime(180, now);
        sfxOsc.frequency.linearRampToValueAtTime(40, now + 0.4);
        sfxGain.gain.setValueAtTime(0.25, now);
        sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        // Add extra low-frequency noise for explosion crunch
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const crashNoise = this.ctx.createBufferSource();
        crashNoise.buffer = buffer;
        
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 250;
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        crashNoise.connect(lowpass);
        lowpass.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        crashNoise.start(now);
        crashNoise.stop(now + 0.4);

        sfxOsc.connect(sfxGain);
        sfxGain.connect(this.ctx.destination);
        sfxOsc.start(now);
        sfxOsc.stop(now + 0.43);
        break;

      case 'level': // Power up arpeggio
        sfxOsc.type = 'square';
        sfxOsc.frequency.setValueAtTime(329.63, now); // E4
        sfxOsc.frequency.setValueAtTime(392.00, now + 0.08); // G4
        sfxOsc.frequency.setValueAtTime(523.25, now + 0.16); // C5
        sfxOsc.frequency.setValueAtTime(659.25, now + 0.24); // E5
        sfxGain.gain.setValueAtTime(0.12, now);
        sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        sfxOsc.connect(sfxGain);
        sfxGain.connect(this.ctx.destination);
        sfxOsc.start(now);
        sfxOsc.stop(now + 0.36);
        break;

      case 'click': // Subtle mechanical ui click
        sfxOsc.type = 'sine';
        sfxOsc.frequency.setValueAtTime(1000, now);
        sfxOsc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
        sfxGain.gain.setValueAtTime(0.08, now);
        sfxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        sfxOsc.connect(sfxGain);
        sfxGain.connect(this.ctx.destination);
        sfxOsc.start(now);
        sfxOsc.stop(now + 0.05);
        break;
    }
  }
}

// Global audio engine singleton
export const audioEngine = new AudioEngine();
