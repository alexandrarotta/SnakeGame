import React from 'react';
import { Award, Zap, Trophy, ShieldAlert, Cpu, Heart } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsPanelProps {
  score: number;
}

export default function AchievementsPanel({ score }: AchievementsPanelProps) {
  // Compute initial achievements roster
  const ACHIEVEMENTS: Achievement[] = [
    {
      id: 'ach_1',
      title: 'Neon Core Booted',
      description: 'Activate the retro simulation cabinet.',
      reqScore: 0,
      unlocked: true,
      icon: 'Cpu',
    },
    {
      id: 'ach_2',
      title: 'Neon Pioneer',
      description: 'Consume 5 energy nodes in a single run.',
      reqScore: 5,
      unlocked: score >= 5,
      icon: 'Award',
    },
    {
      id: 'ach_3',
      title: 'Synth Rider',
      description: 'Reach 15 points. Tempo will increase dynamically!',
      reqScore: 15,
      unlocked: score >= 15,
      icon: 'Zap',
    },
    {
      id: 'ach_4',
      title: 'Glitch Overlord',
      description: 'Reach 30 points and master high speed reflections.',
      reqScore: 30,
      unlocked: score >= 30,
      icon: 'Trophy',
    },
  ];

  // Helper: Icon renderer
  const getIcon = (iconName: string, unlocked: boolean) => {
    const iconClass = `w-5 h-5 ${unlocked ? 'text-yellow-400' : 'text-neutral-600 animate-pulse'}`;
    switch (iconName) {
      case 'Cpu': return <Cpu className={iconClass} />;
      case 'Award': return <Award className={iconClass} />;
      case 'Zap': return <Zap className={iconClass} />;
      case 'Trophy': return <Trophy className={iconClass} />;
      default: return <Award className={iconClass} />;
    }
  };

  return (
    <div id="achievements_bezel" className="flex flex-col gap-4.5 w-full">
      {/* Achievements card */}
      <div className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col gap-3.5 shadow-lg">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#22c55e] font-semibold">
          System Achievements
        </span>
        <h3 className="text-[14px] font-sans font-extrabold text-white tracking-widest uppercase mb-1 flex items-center gap-2">
          Troop Trophies
        </h3>
        <p className="text-xs text-white/60 leading-relaxed mb-1">
          Each trophy unlocked registers online in your active play session.
        </p>

        <div className="flex flex-col gap-2.5">
          {ACHIEVEMENTS.map(ach => (
            <div
              key={ach.id}
              id={`ach_card_${ach.id}`}
              className={`p-3.5 rounded-2xl border flex gap-3 items-center justify-between transition-all backdrop-blur-md ${
                ach.unlocked
                  ? 'border-white/10 bg-white/5 shadow-[0_0_12px_rgba(251,191,36,0.08)]'
                  : 'border-white/5 bg-white/2 select-none opacity-40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    ach.unlocked ? 'bg-amber-500/20 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]' : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {getIcon(ach.icon, ach.unlocked)}
                </div>
                <div className="min-w-0">
                  <span className={`font-sans font-bold text-xs block ${ach.unlocked ? 'text-white' : 'text-white/40'}`}>
                    {ach.title}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 block truncate">
                    {ach.description}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {ach.unlocked ? (
                  <span className="text-[9px] font-mono text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full bg-amber-400/10 uppercase font-bold tracking-widest">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-white/40 font-semibold uppercase">
                    REQ: {ach.reqScore}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Quick Instructions bezel */}
      <div id="instructions-hud" className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block font-bold mb-2">
          Arcade Key Bindings
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center py-1.5 border-b border-white/10 text-xs">
            <span className="text-white/60 font-mono">STEER SNAKE</span>
            <span className="text-white font-mono text-[10px] font-semibold bg-white/10 border border-white/10 px-1.5 py-0.5 rounded">
              W/A/S/D or ARROWS
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-white/10 text-xs">
            <span className="text-white/60 font-mono">PAUSE / RUN</span>
            <span className="text-white font-mono text-[10px] font-semibold bg-white/10 border border-white/10 px-1.5 py-0.5 rounded">
              SPACEBAR
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-white/10 text-xs">
            <span className="text-white/60 font-mono">RETRY SIM</span>
            <span className="text-white font-mono text-[10px] font-semibold bg-white/10 border border-white/10 px-1.5 py-0.5 rounded">
              ENTER KEY
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 text-xs">
            <span className="text-white/60 font-mono">TEMPO MULTIPLIER</span>
            <span className="text-[#c084fc] font-mono text-[10px] font-bold uppercase tracking-wider">
              +1.5% PER SCORE NODE
            </span>
          </div>
        </div>
      </div>

      {/* Cyber Credits Bezel */}
      <div id="credits-credit" className="text-center py-2.5 select-none border border-white/5 bg-white/2 backdrop-blur-md rounded-2xl">
        <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center justify-center gap-1">
          Cyber Arcade Console <Heart className="w-2.5 h-2.5 text-red-500/60 animate-heartbeat fill-red-500/10" /> Ready to Run
        </p>
      </div>

    </div>
  );
}
