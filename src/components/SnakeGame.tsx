import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction, Position, GameState } from '../types';
import { audioEngine } from './AudioEngine';

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  musicPlaying: boolean;
  activeTrackAccentColor: string;
}

const GRID_SIZE = 20;

export default function SnakeGame({ onScoreChange, musicPlaying, activeTrackAccentColor }: SnakeGameProps) {
  // Game states
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [foodType, setFoodType] = useState<{ name: string; color: string; glow: string }>({
    name: 'Cyber Core',
    color: '#ff007f',
    glow: '0px 0px 15px #ff007f',
  });
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: Number(localStorage.getItem('neon_snake_high_score') || 0),
    gameOver: false,
    isPlaying: false,
    speed: 130,
    difficulty: 'medium',
  });

  const [isMuted, setIsMuted] = useState(false);
  const [shouldRumble, setShouldRumble] = useState(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameIntervalRef = useRef<number | null>(null);
  const directionRef = useRef<Direction>(direction);

  // Keep direction ref synced immediately to avoid double-key press suicide
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Food descriptors matching retro arcade vibes
  const FOOD_TYPES = [
    { name: 'Matrix Cube', color: '#22c55e', glow: '#22c55e' }, // Neon Green
    { name: 'Plasma Cell', color: '#ec4899', glow: '#ec4899' }, // Pink
    { name: 'Volt Battery', color: '#eab308', glow: '#eab308' }, // Yellow
    { name: 'Flux Node', color: '#06b6d4', glow: '#06b6d4' }, // Cyan
    { name: 'Cosmic Core', color: '#a855f7', glow: '#a855f7' }, // Purple
  ];

  // Helper: Get difficulty interval speed
  const getSpeedForDifficulty = (diff: 'easy' | 'medium' | 'hard' | 'insane'): number => {
    switch (diff) {
      case 'easy': return 180;
      case 'medium': return 120;
      case 'hard': return 80;
      case 'insane': return 50;
    }
  };

  // Generate random food away from snake's body
  const spawnFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    let isOnSnake = true;
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check collision
      isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }

    // Select random cyberpunk food type
    const pickedType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
    setFoodType({
      name: pickedType.name,
      color: pickedType.color,
      glow: `0px 0px 15px ${pickedType.glow}`,
    });
    setFood(newFood!);
  }, []);

  // Set difficulty updates
  const handleDifficultyChange = (diff: 'easy' | 'medium' | 'hard' | 'insane') => {
    if (!isMuted) audioEngine.triggerSFX('click');
    setGameState(prev => ({
      ...prev,
      difficulty: diff,
      speed: getSpeedForDifficulty(diff),
    }));
    // Restart logic on state shift
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setDirection('UP');
    setGameState(prev => ({
      ...prev,
      score: 0,
      isPlaying: false,
      gameOver: false,
    }));
    onScoreChange(0);
  };

  // Reset Game Routine
  const resetGame = () => {
    if (!isMuted) audioEngine.triggerSFX('level');
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setDirection('UP');
    setGameState(prev => ({
      ...prev,
      score: 0,
      isPlaying: true,
      gameOver: false,
      speed: getSpeedForDifficulty(prev.difficulty),
    }));
    onScoreChange(0);
  };

  const togglePause = () => {
    if (!isMuted) audioEngine.triggerSFX('click');
    setGameState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  // Handle directions safely
  const changeDirection = useCallback((newDir: Direction) => {
    const oppMap: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    if (oppMap[newDir] !== directionRef.current) {
      setDirection(newDir);
    }
  }, []);

  // Main game ticks loop
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check board boundaries / collisions
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return prevSnake;
      }

      // Check self-collision
      for (const segment of prevSnake) {
        if (segment.x === head.x && segment.y === head.y) {
          handleGameOver();
          return prevSnake;
        }
      }

      const newSnake = [head, ...prevSnake];

      // Check food consumption
      if (head.x === food.x && head.y === food.y) {
        // Play procedurally-synthesised eat sound!
        if (!isMuted) audioEngine.triggerSFX('eat');

        // Increment Score
        setGameState(prev => {
          const nextScore = prev.score + 1;
          const nextHighScore = Math.max(prev.highScore, nextScore);
          
          if (nextHighScore > prev.highScore) {
            localStorage.setItem('neon_snake_high_score', String(nextHighScore));
          }

          // Trigger score feedback back to parent dashboard (triggers faster tempo)
          onScoreChange(nextScore);

          return {
            ...prev,
            score: nextScore,
            highScore: nextHighScore,
          };
        });

        spawnFood(newSnake);
      } else {
        // Drop the tail end of the snake to maintain length
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, spawnFood, isMuted, onScoreChange]);

  const handleGameOver = () => {
    if (!isMuted) audioEngine.triggerSFX('die');

    // Screeen rumble triggers CSS shake
    setShouldRumble(true);
    setTimeout(() => setShouldRumble(false), 500);

    setGameState(prev => ({
      ...prev,
      gameOver: true,
      isPlaying: false,
    }));
  };

  // Set keyboard arrows listening routines
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys: Record<string, Direction> = {
        ArrowUp: 'UP', w: 'UP', W: 'UP',
        ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
        ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
        ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT',
      };
      if (keys[e.key]) {
        e.preventDefault();
        if (gameState.isPlaying) {
          changeDirection(keys[e.key]);
        }
      }
      if (e.key === ' ' && !gameState.gameOver) {
        e.preventDefault();
        togglePause();
      }
      if (e.key === 'Enter' && gameState.gameOver) {
        e.preventDefault();
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.gameOver, changeDirection]);

  // Set game intervals
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      gameIntervalRef.current = window.setInterval(moveSnake, gameState.speed);
    } else {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [gameState.isPlaying, gameState.gameOver, gameState.speed, moveSnake]);

  // Canvas drawing effect triggered on state shifts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw high high contrast matrix cells
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / GRID_SIZE;

    // Wipe background clean
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, width, height);

    // Optional: draw subtle pixel grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Draw Glowing Cybernetic Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = foodType.color;
    ctx.fillStyle = foodType.color;
    ctx.beginPath();
    // Round pill visual
    const fx = food.x * cellSize + cellSize / 2;
    const fy = food.y * cellSize + cellSize / 2;
    ctx.arc(fx, fy, cellSize * 0.42, 0, 2 * Math.PI);
    ctx.fill();

    // Draw inner tiny shiny dot
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fx - 1, fy - 1, cellSize * 0.15, 0, 2 * Math.PI);
    ctx.fill();

    // Draw Neon Glowing Snake
    snake.forEach((segment, index) => {
      // Create head vs tail color gradient shifts
      const isHead = index === 0;
      ctx.shadowBlur = isHead ? 15 : 8;
      ctx.shadowColor = activeTrackAccentColor;

      // Color nodes: Head is lighter white-neon, tail ends get darker neon glow
      if (isHead) {
        ctx.fillStyle = '#ffffff';
      } else {
        const factor = 1 - (index / snake.length) * 0.6; // fade down
        ctx.fillStyle = activeTrackAccentColor;
        ctx.globalAlpha = factor;
      }

      ctx.beginPath();
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      const padding = 1.5;
      
      // Rounded rectangles for beautiful visual fluidity
      ctx.roundRect(
        x + padding,
        y + padding,
        cellSize - padding * 2,
        cellSize - padding * 2,
        isHead ? 6 : 4
      );
      ctx.fill();
      ctx.globalAlpha = 1.0; // Reset alpha

      // Draw shiny robotic eyes on snake's head
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0a0a0d';
        
        const eyeOffset = cellSize * 0.28;
        const eyeSize = cellSize * 0.14;

        if (direction === 'UP' || direction === 'DOWN') {
          // Left eye
          ctx.beginPath();
          ctx.arc(x + eyeOffset, y + cellSize/2, eyeSize, 0, 2 * Math.PI);
          ctx.fill();
          // Right eye
          ctx.beginPath();
          ctx.arc(x + cellSize - eyeOffset, y + cellSize/2, eyeSize, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // Top eye
          ctx.beginPath();
          ctx.arc(x + cellSize/2, y + eyeOffset, eyeSize, 0, 2 * Math.PI);
          ctx.fill();
          // Bottom eye
          ctx.beginPath();
          ctx.arc(x + cellSize/2, y + cellSize - eyeOffset, eyeSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });

    // Reset shadow parameters
    ctx.shadowBlur = 0;

  }, [snake, food, foodType, activeTrackAccentColor, direction]);

  return (
    <div id="game_component_wrapper" className="flex flex-col items-center w-full">
      
      {/* Dynamic Cabinet Screen with glowing borders, frosted glass translucency & rumble class */}
      <div
        id="arcade-bezel"
        style={{ borderColor: activeTrackAccentColor }}
        className={`relative w-full max-w-[380px] aspect-square rounded-3xl border-2 bg-black/60 p-3.5 shadow-2xl transition-all duration-300 backdrop-blur-xl ${
          shouldRumble ? 'animate-shake' : ''
        }`}
      >
        <div id="screen-glare-overlay" className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-2xl z-10" />
        
        {/* Actual game canvas */}
        <canvas
          id="game_board_canvas"
          ref={canvasRef}
          width={380}
          height={380}
          className="w-full h-full block rounded-2xl border border-white/10 bg-black/80"
        />

        {/* Start Game overlay */}
        {!gameState.isPlaying && !gameState.gameOver && (
          <div id="start-overlay" className="absolute inset-x-3.5 inset-y-3.5 flex flex-col items-center justify-center bg-black/90 rounded-2xl z-20 backdrop-blur-md p-6 text-center animate-pulse-slow">
            <div className="p-3 bg-white/5 rounded-full border border-white/10 mb-4 shadow-lg">
              <span className="block w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute" />
              <span className="block w-3 h-3 rounded-full bg-cyan-400" />
            </div>
            <h3 className="text-xl font-sans font-bold tracking-wider text-white mb-2 uppercase">
              Retro Cyber Snake
            </h3>
            <p className="text-xs text-white/60 max-w-[240px] leading-relaxed mb-6">
              Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-neutral-200">WASD</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-neutral-200">Arrows</kbd> to steer. Play music in the background to sync the game tempo!
            </p>
            <button
              id="start_btn"
              onClick={resetGame}
              style={{ boxShadow: `0 0 15px ${activeTrackAccentColor}55`, borderColor: activeTrackAccentColor }}
              className="px-6 py-2.5 rounded-xl border bg-white/5 text-white font-mono text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer font-bold"
            >
              Boot Core
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {gameState.gameOver && (
          <div id="gameover-overlay" className="absolute inset-x-3.5 inset-y-3.5 flex flex-col items-center justify-center bg-black/95 rounded-2xl z-20 backdrop-blur-lg p-6 text-center">
            <h2 className="text-3xl font-mono font-extrabold tracking-widest text-red-500 mb-2 uppercase animate-bounce-slow">
              SYSTEM CRASH
            </h2>
            <p className="text-xs text-white/50 mb-4 uppercase tracking-wider">
              Collected Energy nodes: <span className="text-white font-bold">{gameState.score}</span>
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
              <button
                id="retry_btn"
                onClick={resetGame}
                className="w-full py-2.5 rounded-xl bg-white text-black font-mono text-xs tracking-widest uppercase font-extrabold hover:bg-neutral-200 transition-all cursor-pointer"
              >
                Reboot System
              </button>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 mt-4">
              Or Press Enter to retry
            </span>
          </div>
        )}

        {/* Pause HUD Indicator */}
        {!gameState.isPlaying && !gameState.gameOver && snake.length > 3 && (
          <div id="pause-hud" className="absolute inset-x-0 bottom-16 flex justify-center z-10 pointer-events-none">
            <div className="px-4 py-1.5 rounded-full bg-black/90 border border-white/10 text-white/70 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              SYSTEM PAUSED
            </div>
          </div>
        )}
      </div>

      {/* Difficulty select buttons panel */}
      <div id="difficulty-panel" className="w-full max-w-[380px] mt-4.5 p-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between">
        <span className="text-[11px] font-mono text-white/55 uppercase tracking-widest">
          Difficulty:
        </span>
        <div className="flex gap-1.5">
          {(['easy', 'medium', 'hard', 'insane'] as const).map(diff => (
            <button
              key={diff}
              id={`diff_btn_${diff}`}
              onClick={() => handleDifficultyChange(diff)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono uppercase transition-all tracking-wider font-semibold cursor-pointer ${
                gameState.difficulty === diff
                  ? 'bg-white text-black font-extrabold shadow-md shadow-white/5'
                  : 'text-white/40 hover:text-white bg-transparent hover:bg-white/5'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Retro D-Pad Arrow Controls for Mobile/IFrame Playability */}
      <div id="direction-pad" className="mt-4 flex flex-col items-center gap-1.5">
        <button
          id="pad_up"
          onClick={() => changeDirection('UP')}
          disabled={!gameState.isPlaying}
          className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/15 hover:text-white active:scale-95 disabled:opacity-40 transition-all select-none cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 text-white/80" />
        </button>
        <div className="flex gap-6">
          <button
            id="pad_left"
            onClick={() => changeDirection('LEFT')}
            disabled={!gameState.isPlaying}
            className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/15 hover:text-white active:scale-95 disabled:opacity-40 transition-all select-none cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <button
            id="pad_right"
            onClick={() => changeDirection('RIGHT')}
            disabled={!gameState.isPlaying}
            className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/15 hover:text-white active:scale-95 disabled:opacity-40 transition-all select-none cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 text-white/80" />
          </button>
        </div>
        <button
          id="pad_down"
          onClick={() => changeDirection('DOWN')}
          disabled={!gameState.isPlaying}
          className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/15 hover:text-white active:scale-95 disabled:opacity-40 transition-all select-none cursor-pointer"
        >
          <ArrowDown className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Interactive Score/High-Score dashboard */}
      <div id="scores_hud_bezel" className="w-full max-w-[380px] grid grid-cols-2 gap-3.5 mt-4.5">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center relative overflow-hidden backdrop-blur-xl shadow-md">
          <span className="text-[9px] font-mono tracking-widest text-white/45 uppercase block mb-1">
            Energy Absorbed
          </span>
          <span className="text-2xl font-mono text-white font-extrabold tracking-tight">
            {gameState.score}
          </span>
          {gameState.score > 0 && gameState.score === gameState.highScore && (
            <span className="absolute top-1 right-2 text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
              New Best!
            </span>
          )}
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center relative backdrop-blur-xl shadow-md">
          <span className="text-[9px] font-mono tracking-widest text-white/45 uppercase block mb-1">
            Local Highscore
          </span>
          <span className="text-2xl font-mono text-yellow-400 font-extrabold tracking-tight">
            {gameState.highScore}
          </span>
        </div>
      </div>

      {/* SFX / Game Utilities Row */}
      <div id="game-controls" className="w-full max-w-[380px] grid grid-cols-2 gap-3.5 mt-4">
        <button
          id="play_pause_game_btn"
          onClick={togglePause}
          disabled={gameState.gameOver || snake.length <= 3}
          className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-mono text-white/80 flex items-center justify-center gap-1.5 hover:bg-white/10 hover:text-white disabled:opacity-40 active:scale-98 cursor-pointer font-bold transition-all"
        >
          {gameState.isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
              Pause Game
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              Resume Game
            </>
          )}
        </button>

        <button
          id="audio_mute_btn"
          onClick={() => {
            audioEngine.triggerSFX('click');
            setIsMuted(!isMuted);
          }}
          className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-mono text-white/80 flex items-center justify-center gap-1.5 hover:bg-white/10 hover:text-white active:scale-98 cursor-pointer font-bold transition-all"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isMuted ? 'text-red-400' : 'text-cyan-400'}`} />
          {isMuted ? 'Unmute SFX' : 'Mute SFX'}
        </button>
      </div>

    </div>
  );
}
