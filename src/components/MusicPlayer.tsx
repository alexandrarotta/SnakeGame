import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Sliders, Volume2, Sparkles, Disc, Music, Activity } from 'lucide-react';
import { Track } from '../types';
import { DUMMY_TRACKS, audioEngine } from './AudioEngine';

interface MusicPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTrackChange: (track: Track) => void;
  onPlayPauseToggle: () => void;
  gameScore: number;
}

export default function MusicPlayer({
  currentTrack,
  isPlaying,
  onTrackChange,
  onPlayPauseToggle,
  gameScore,
}: MusicPlayerProps) {
  // Sync Audio variables
  const [volume, setVolume] = useState(70);
  const [cutoff, setCutoff] = useState(1600);
  const [resonance, setResonance] = useState(5);
  const [synthType, setSynthType] = useState<'sawtooth' | 'square' | 'triangle' | 'sine'>('sawtooth');
  const [delayWet, setDelayWet] = useState(0.3);
  const [activeStep, setActiveStep] = useState(0);

  // Sync step changes from audioEngine
  useEffect(() => {
    audioEngine.setOnStep((step: number) => {
      setActiveStep(step);
    });

    // Set initial configuration
    audioEngine.setVolume(70);
    audioEngine.setFilterCutoff(1600);
    audioEngine.setFilterResonance(5);
    audioEngine.setSynthType('sawtooth');
    audioEngine.setDelayIntensity(0.3);
  }, []);

  // Update volume controller
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  // Update filter cutoffs
  const handleCutoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCutoff(val);
    audioEngine.setFilterCutoff(val);
  };

  // Update resonance
  const handleResonanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setResonance(val);
    audioEngine.setFilterResonance(val);
  };

  // Update delay echo splits
  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setDelayWet(val);
    audioEngine.setDelayIntensity(val);
  };

  // Handler: Select oscillator wave shape
  const handleSynthTypeChange = (value: 'sawtooth' | 'square' | 'triangle' | 'sine') => {
    audioEngine.triggerSFX('click');
    setSynthType(value);
    audioEngine.setSynthType(value);
  };

  // Skip tracks forward
  const skipForward = () => {
    audioEngine.triggerSFX('click');
    const idx = DUMMY_TRACKS.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % DUMMY_TRACKS.length;
    onTrackChange(DUMMY_TRACKS[nextIdx]);
  };

  // Skip tracks backward
  const skipBackward = () => {
    audioEngine.triggerSFX('click');
    const idx = DUMMY_TRACKS.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length;
    onTrackChange(DUMMY_TRACKS[prevIdx]);
  };

  // Launch procedural SFX
  const triggerPad = (type: 'eat' | 'die' | 'level' | 'click') => {
    audioEngine.triggerSFX(type);
  };

  // Calculate speed dynamic modifier based on score
  // E.g. every 5 points, the song BPM speeds up by 5%!
  const speedScalePercent = Math.min(150, Math.floor(100 + (gameScore * 1.5)));

  return (
    <div id="synth-music-panel-container" className="flex flex-col gap-5 w-full">
      
      {/* Vinyl Disc Spinning Artwork & Title Dashboard - Frosted Glass Glass effect */}
      <div id="music-card" className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row gap-4 items-center shadow-lg">
        
        {/* Dynamic spinning disk mockup */}
        <div className="relative flex-shrink-0">
          <div
            id="spinning-vinyl-disc"
            style={{
              borderColor: currentTrack.accentColor,
              boxShadow: isPlaying ? `0 0 25px ${currentTrack.accentColor}33` : 'none',
            }}
            className={`w-28 h-28 rounded-full bg-black/40 border-2 flex items-center justify-center relative overflow-hidden ${
              isPlaying ? 'animate-spin-custom' : ''
            }`}
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-neutral-800/40" />
            <div className="absolute inset-4 rounded-full border border-neutral-800/30" />
            <div className="absolute inset-6 rounded-full border border-neutral-800/25" />
            <div className="absolute inset-8 rounded-full border border-neutral-800/15" />
            
            {/* Center label */}
            <div
              style={{ backgroundColor: currentTrack.accentColor }}
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-neutral-950 shadow-inner z-10"
            >
              <Disc className="w-5 h-5 text-neutral-950 animate-pulse" />
            </div>
          </div>
          {isPlaying && (
            <div className="absolute -top-1 -right-1 p-1 bg-neutral-900/90 border border-white/15 rounded-lg text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              AI GEN
            </div>
          )}
        </div>

        {/* Text descriptions */}
        <div className="text-center md:text-left flex-grow min-w-0">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] font-semibold">
            Currently Synthesizing
          </span>
          <h3 className="text-lg font-sans font-extrabold text-white mt-1 mb-1 tracking-tight truncate">
            {currentTrack.title}
          </h3>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center text-xs text-neutral-400 mb-2">
            <span className="font-mono text-[10px] uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {currentTrack.genre}
            </span>
            <span className="font-mono text-neutral-300">
              {Math.round(currentTrack.bpm * (1 + (gameScore * 0.015)))} BPM
            </span>
            {gameScore > 0 && (
              <span className="text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 animate-spin-slow" />
                (x{speedScalePercent / 100} Speed)
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-[280px]">
            {currentTrack.description}
          </p>
        </div>
      </div>

      {/* Playlist / Song list choosing button matrix */}
      <div id="playlist_section" className="flex flex-col gap-2.5">
        <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block font-bold">
          Synthesizer Playlist Configuration
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {DUMMY_TRACKS.map(track => {
            const isSelected = track.id === currentTrack.id;
            return (
              <button
                key={track.id}
                id={`track_select_${track.id}`}
                onClick={() => onTrackChange(track)}
                style={{
                  borderColor: isSelected ? `${track.accentColor}55` : 'rgba(255,255,255,0.05)',
                  background: isSelected ? `linear-gradient(90deg, ${track.accentColor}25 0%, transparent 100%)` : 'rgba(255,255,255,0.03)',
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group backdrop-blur-md cursor-pointer hover:bg-white/10 ${
                  isSelected ? 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    style={{
                      backgroundColor: isSelected ? track.accentColor : 'rgba(255,255,255,0.05)',
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                  >
                    <Music className={`w-4 h-4 ${isSelected ? 'text-black font-bold' : 'text-neutral-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-sans font-bold text-xs text-white block">
                      {track.title}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 block">
                      {track.author}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-white/60">
                    {track.bpm} BPM
                  </span>
                  {isSelected && isPlaying && (
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary playback control button buttons bar */}
      <div id="player-controls" className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col gap-4 shadow-lg">
        
        {/* Playhead progress bar synced with the sequencer step */}
        <div id="progress-container">
          <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 select-none">
            <span>Sequencer Node Clock</span>
            <span className="text-white font-semibold">Step {activeStep + 1} / 32</span>
          </div>
          <div className="grid grid-cols-16 gap-0.5 w-full">
            {Array.from({ length: 16 }).map((_, i) => {
              // Show steps active high
              const isMainCurrent = activeStep % 16 === i;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: isMainCurrent ? currentTrack.accentColor : '#1c1c24',
                    boxShadow: isMainCurrent ? `0 0 10px ${currentTrack.accentColor}` : 'none',
                  }}
                  className="h-2 rounded-sm transition-all"
                />
              );
            })}
          </div>
        </div>

        {/* Control Button Actions */}
        <div className="flex justify-center items-center gap-4">
          <button
            id="prev_track_btn"
            onClick={skipBackward}
            className="p-2 h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            id="play_pause_track_btn"
            onClick={onPlayPauseToggle}
            style={{
              borderColor: currentTrack.accentColor,
              backgroundColor: isPlaying ? 'transparent' : `${currentTrack.accentColor}15`,
              boxShadow: `0 0 15px ${currentTrack.accentColor}33`,
            }}
            className="h-14 w-14 rounded-full border-2 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause Synthesizer' : 'Play Synthesizer'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
            )}
          </button>

          <button
            id="next_track_btn"
            onClick={skipForward}
            className="p-2 h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Master Volume Dial */}
        <div id="volume_control" className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-white/40" />
          <input
            id="volume_slider"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-grow accent-cyan-500 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-[10px] text-white/60 w-8 text-right font-bold">
            {volume}%
          </span>
        </div>
      </div>

      {/* Synthesizer Voice Customizer Slider Controls! Highly gamified */}
      <div id="synth-parameters-panel" className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col gap-4 shadow-lg">
        
        <div className="flex items-center gap-2 mb-1.5 dynamic-accent">
          <Sliders className="w-4 h-4 text-[#a855f7]" />
          <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest font-extrabold block">
            Synthesizer Filter Sweeps
          </span>
        </div>

        {/* Waveshape oscillator selection buttons */}
        <div id="oscllator-shapes">
          <label className="text-[9px] font-mono text-white/45 uppercase tracking-widest block mb-2 font-semibold">
            Lead Oscillator Waver Shape
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['sawtooth', 'square', 'triangle', 'sine'] as const).map(shape => (
              <button
                key={shape}
                id={`osc_btn_${shape}`}
                onClick={() => handleSynthTypeChange(shape)}
                style={{
                  borderColor: synthType === shape ? currentTrack.accentColor : 'transparent',
                }}
                className={`py-1.5 rounded-xl border text-[9px] font-mono uppercase font-bold tracking-wider select-none cursor-pointer transition-all ${
                  synthType === shape
                    ? 'bg-white/15 text-white shadow-md border-white/20'
                    : 'bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Lowpass cutoff slider */}
        <div id="cutoff_sweep">
          <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider mb-1">
            <span className="text-white/60">Low-Pass Cutoff Sweep</span>
            <span className="text-white font-bold">{cutoff} Hz</span>
          </div>
          <input
            id="cutoff_slider"
            type="range"
            min="200"
            max="4000"
            value={cutoff}
            onChange={handleCutoffChange}
            className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Filter resonance Q-factor */}
        <div id="resonance_sweep">
          <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider mb-1">
            <span className="text-white/60">Resonance Q-Factor</span>
            <span className="text-white font-bold">{resonance} Q</span>
          </div>
          <input
            id="resonance_slider"
            type="range"
            min="1"
            max="15"
            value={resonance}
            onChange={handleResonanceChange}
            className="w-full accent-pink-500 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Space echo wet delay slider */}
        <div id="delay_echo_sweep">
          <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider mb-1">
            <span className="text-white/60">Space Echo Intensity</span>
            <span className="text-white font-bold">{Math.round(delayWet * 100)}%</span>
          </div>
          <input
            id="delay_slider"
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={delayWet}
            onChange={handleDelayChange}
            className="w-full accent-yellow-500 h-1 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Retro SFX manual launchpad pads board */}
      <div id="sfx-board" className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-2.5 font-extrabold">
          Synth Soundboard Pads
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'eat', label: 'EAT CHIME', color: 'border-pink-500/20 text-pink-400 bg-pink-950/10 hover:bg-pink-500/10' },
            { id: 'die', label: 'DIE CRASH', color: 'border-red-500/20 text-red-400 bg-red-950/10 hover:bg-red-500/10' },
            { id: 'level', label: 'LEVEL UP', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/10 hover:bg-emerald-500/10' },
            { id: 'click', label: 'UI CLICK', color: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/10 hover:bg-cyan-500/10' },
          ].map(pad => (
            <button
              key={pad.id}
              id={`sfx_pad_${pad.id}`}
              onClick={() => triggerPad(pad.id as any)}
              className={`p-2 rounded-xl border text-[9px] font-mono font-bold uppercase text-center cursor-pointer transition-all active:scale-95 border-white/10 select-none ${pad.color}`}
            >
              {pad.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
