import React, { useEffect, useRef } from 'react';
import { audioEngine } from './AudioEngine';

interface VisualizerProps {
  isPlaying: boolean;
  accentColor: string;
}

export default function Visualizer({ isPlaying, accentColor }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high pixel density resolution
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);
    let simPhase = 0;

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Smooth trails effect by applying transparent fade instead of full clear
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const analyser = audioEngine.getAnalyser();

      // Draw subtle grid lines in the background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying && analyser) {
        // Fetch real-time frequency distribution from our synth engine!
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.6;
        let x = 0;

        // Draw radial glowing equalizer bar wave
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const percent = value / 255;
          const barHeight = Math.max(2, percent * (height - 15));

          // Create radiant neon gradient
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, 'rgba(15, 15, 20, 0.5)');
          gradient.addColorStop(0.5, accentColor + '77'); // fading opacity
          gradient.addColorStop(1, accentColor);

          ctx.fillStyle = gradient;
          
          // Draw rounded neon pillars with glow shadows
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 1, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          // Optional: Add tiny high-spark neon square on top of each peak
          if (barHeight > 10) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, height - barHeight - 2, barWidth - 1, 2);
          }

          x += barWidth;
        }

        // Draw a central waveform overlay
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = accentColor + 'bb';
        ctx.shadowBlur = 10;
        ctx.shadowColor = accentColor;
        
        analyser.getByteTimeDomainData(dataArray);
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // normalised time signal
          const y = (v * height) / 2;
          const px = (i / bufferLength) * width;
          if (i === 0) {
            ctx.moveTo(px, y);
          } else {
            ctx.lineTo(px, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow to avoid slowing down rendering

      } else {
        // IDLE MODE: Draw a beautiful, floating synthwave heartline sweep
        simPhase += 0.05;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = accentColor + '88';
        ctx.shadowBlur = 8;
        ctx.shadowColor = accentColor;

        const cy = height - 30;
        ctx.moveTo(0, cy);
        for (let px = 0; px < width; px++) {
          // Combined double-sine wave to produce organic synth soundwave vibration
          const wave = Math.sin(px * 0.02 + simPhase) * Math.cos(px * 0.005 + simPhase * 0.3) * 15;
          ctx.lineTo(px, cy + wave);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isPlaying, accentColor]);

  return (
    <div id="visualizer_container" className="relative w-full h-32 rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-inner backdrop-blur-xl">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div id="visualizer_indicator" className="absolute top-2.5 right-3 pointer-events-none text-[9px] font-mono tracking-widest text-white/45 uppercase flex items-center gap-1.5">
        {isPlaying ? (
          <>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Spectrum Live
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-white/30 block"></span>
            Ambient Mod
          </>
        )}
      </div>
    </div>
  );
}
