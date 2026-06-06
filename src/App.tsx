/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Gamepad2, Volume2, Cpu, Music, Play, Pause, Activity, Sparkles, RefreshCcw } from 'lucide-react';
import { Track } from './types';
import { DUMMY_TRACKS, audioEngine } from './components/AudioEngine';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import Visualizer from './components/Visualizer';
import AchievementsPanel from './components/AchievementsPanel';

export default function App() {
  const [currentTrack, setCurrentTrack] = useState<Track>(DUMMY_TRACKS[0]);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  const [gameScore, setGameScore] = useState<number>(0);

  // Synchronise playhead status of dynamic music
  const handlePlayPauseMusic = () => {
    // If starting for the first time, resume/boot Web Audio Context safely
    const nextPlayState = audioEngine.togglePlay(currentTrack.id, 1 + (gameScore * 0.015));
    setMusicPlaying(nextPlayState);
  };

  // Switch tracks
  const handleTrackChange = (newTrack: Track) => {
    setCurrentTrack(newTrack);
    if (musicPlaying) {
      // If currently playing, stop the current sequence and load next track
      audioEngine.pause();
      audioEngine.play(newTrack.id, 1 + (gameScore * 0.015));
    }
  };

  // Sync tempo changes automatically as score rises during dynamic gameplay
  useEffect(() => {
    if (musicPlaying) {
      // Hot reloading sequencer clock tempo with dynamic multiplier
      audioEngine.play(currentTrack.id, 1 + (gameScore * 0.015));
    }
  }, [gameScore, musicPlaying, currentTrack]);

  // Cleanup synthesizer loop when window drops
  useEffect(() => {
    return () => {
      audioEngine.pause();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#05050a] text-neutral-100 flex flex-col justify-between selection:bg-[#ec4899] selection:text-black relative overflow-x-hidden">
      
      {/* Glowing atmospheric background blur blobs for Frosted Glass theme */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      
      {/* Background neon laser grid lines effect */}
      <div className="fixed inset-0 pointer-events-none bg-radial-vignette opacity-25 z-0" />

      {/* Cyber Header Navigation Bar - Frosted Glass Styled */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Brand Titles */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#06b6d4] flex items-center justify-center p-[1px] shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-[#ec4899] animate-pulse" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <h1 className="text-sm font-mono tracking-[0.25em] font-extrabold text-white uppercase">
                  CAB-8 Synthesis
                </h1>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-0.5">
                Snake Game & Generative Synth Engine
              </p>
            </div>
          </div>

          {/* Prompt indicators for desktop/tablet playability */}
          <div className="flex items-center gap-3">
            
            {/* Ambient status pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-800 bg-neutral-950/60 text-xs text-neutral-400 font-mono">
              <Activity className={`w-3.5 h-3.5 ${musicPlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
              <span className="uppercase tracking-widest text-[9px] font-bold">
                {musicPlaying ? `Synthesizer Live (${Math.round(currentTrack.bpm * (1 + (gameScore * 0.015)))} BPM)` : 'Synthesizer Standby'}
              </span>
            </div>

            {/* Quick Demo Play button shortcut */}
            <button
              id="top_play_pause_toggle"
              onClick={handlePlayPauseMusic}
              style={{
                borderColor: currentTrack.accentColor,
                backgroundColor: `${currentTrack.accentColor}10`,
                boxShadow: `0 0 10px ${currentTrack.accentColor}15`,
              }}
              className="py-1.5 px-4 rounded-lg border text-[10px] font-mono tracking-widest uppercase font-extrabold text-white transition-all hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {musicPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-yellow-400" />
                  Mute Beats
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />
                  Play Beats
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Primary Dashboard Grid Panels */}
      <main className="flex-grow py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full z-10 relative">
        
        {/* Play game alert if music is paused */}
        {!musicPlaying && (
          <div id="welcome_alert" className="mb-6 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse-slow shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                <Music className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-sans font-bold text-white tracking-wide">
                  Demo Music Paired Simulator
                </p>
                <p className="text-[10px] text-neutral-300 font-mono">
                  Press "Play Beats" or boot the game screen to trigger browser audio node generators!
                </p>
              </div>
            </div>
            <button
              id="trigger_pair_beats"
              onClick={handlePlayPauseMusic}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)] self-start sm:self-auto"
            >
              Start Synth System
            </button>
          </div>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Synth Music Player Configuration (grows to span 5 columns of 12) */}
          <section id="music-player-panel" className="lg:col-span-5 flex flex-col gap-5">
            <MusicPlayer
              currentTrack={currentTrack}
              isPlaying={musicPlaying}
              onTrackChange={handleTrackChange}
              onPlayPauseToggle={handlePlayPauseMusic}
              gameScore={gameScore}
            />
          </section>

          {/* Column 2: Center Arcade Game Unit Bezel (grows to span 4 columns of 12) */}
          <section id="snake-cabinet-panel" className="lg:col-span-4 flex flex-col items-center justify-center">
            <SnakeGame
              onScoreChange={setGameScore}
              musicPlaying={musicPlaying}
              activeTrackAccentColor={currentTrack.accentColor}
            />
          </section>

          {/* Column 3: Live Analytical Visualizer & Score Achievements (grows to span 3 columns of 12) */}
          <section id="visualizer-stats-panel" className="lg:col-span-3 flex flex-col gap-5">
            
            {/* True Spectral Analysis Visualizer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest font-extrabold">
                  Spectral Spectrum Feed
                </span>
              </div>
              <Visualizer isPlaying={musicPlaying} accentColor={currentTrack.accentColor} />
            </div>

            {/* Achievements and Keys Quick-guide Card List */}
            <AchievementsPanel score={gameScore} />

          </section>

        </div>
      </main>

      {/* Cyber Footer Overlay Credits */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md py-5 px-6 text-center text-xs z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-white/50 font-mono text-[10px] uppercase tracking-widest">
            © 2026 CAB-8 Synthesizer. Powered by Web Audio API & React.
          </p>
          <div className="flex items-center gap-4 text-white/40 font-mono text-[9px] uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> OSC: Tri/Saw/Sqr
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Filter: Lowpass 12dB
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Echo split: Space Delay
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
