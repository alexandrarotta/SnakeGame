export interface Track {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  description: string;
  accentColor: string; // e.g., 'cyan', 'pink', 'emerald'
  author: string;
}

export interface GameState {
  score: number;
  highScore: number;
  gameOver: boolean;
  isPlaying: boolean;
  speed: number; // in milliseconds per tick
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  reqScore: number;
  unlocked: boolean;
  icon: string;
}
