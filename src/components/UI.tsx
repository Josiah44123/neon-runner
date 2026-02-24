import { useState } from 'react';
import { useGameStore } from '../store';
import { playStartSound } from '../audio';

export default function UI() {
  const { score, highScore, status, actions } = useGameStore();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStart = () => {
    playStartSound();
    actions.startGame();
    setShowInstructions(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center font-mono z-10 select-none overflow-hidden">
      
      {/* HUD - Always visible during play */}
      {status === 'playing' && (
        <>
          <div className="absolute top-8 left-8 text-white animate-pulse">
            <div className="text-xs text-green-500/60 tracking-tighter">SYS_METRICS: LINES_OF_CODE</div>
            <div className="text-4xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
              {score.toString().padStart(6, '0')}
            </div>
          </div>
          <div className="absolute top-8 right-8 text-right text-white">
            <div className="text-xs text-cyan-500/60 tracking-tighter">LOCAL_STORAGE: HIGH_SCORE</div>
            <div className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {highScore.toString().padStart(6, '0')}
            </div>
          </div>
        </>
      )}

      {/* PHASE 1: VISUAL SPLASH SCREEN */}
      {status === 'idle' && !showInstructions && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-auto">
          {/* Animated Background Grid Effect */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <div className="relative z-10 text-center scale-110">
            <h1 className="text-9xl font-black italic tracking-tighter text-white mb-0 drop-shadow-[0_5px_15px_rgba(255,255,255,0.3)]">
              NEON<span className="text-green-500">RUNNER</span>
            </h1>
            <p className="text-green-500/50 tracking-[1em] uppercase text-xs mb-12 ml-4">Neural Link Established</p>
            
            <button
              onClick={() => setShowInstructions(true)}
              className="group relative px-12 py-4 bg-transparent border-2 border-white text-white font-black text-2xl uppercase hover:bg-white hover:text-black transition-all duration-300"
            >
              Initialize Core
              <div className="absolute -inset-1 bg-white opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
            </button>
          </div>
          <div className="absolute bottom-8 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
            Standard Protocol v1.0.0 // Built for High Speed
          </div>
        </div>
      )}

      {/* PHASE 2: INSTRUCTIONS PAGE */}
      {status === 'idle' && showInstructions && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center pointer-events-auto p-4 animate-in fade-in duration-500">
          <div className="max-w-2xl w-full border border-green-500/20 bg-black p-10 relative shadow-[0_0_100px_rgba(34,197,94,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
            
            <h2 className="text-3xl font-black text-green-400 mb-8 flex items-center gap-4 uppercase">
              <span className="w-2 h-8 bg-green-500 animate-pulse" />
              Developer_Documentation
            </h2>

            <div className="grid grid-cols-2 gap-10 mb-12">
              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm border-b border-white/10 pb-2 uppercase text-cyan-400">Controls</h3>
                <div className="flex items-center gap-4 text-gray-300">
                  <kbd className="px-3 py-2 bg-white/10 rounded border border-white/20 text-white min-w-[45px] text-center">A</kbd>
                  <kbd className="px-3 py-2 bg-white/10 rounded border border-white/20 text-white min-w-[45px] text-center">←</kbd>
                  <span className="text-xs">Left Shift</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <kbd className="px-3 py-2 bg-white/10 rounded border border-white/20 text-white min-w-[45px] text-center">D</kbd>
                  <kbd className="px-3 py-2 bg-white/10 rounded border border-white/20 text-white min-w-[45px] text-center">→</kbd>
                  <span className="text-xs">Right Shift</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm border-b border-white/10 pb-2 uppercase text-cyan-400">Objectives</h3>
                <ul className="text-[11px] space-y-2 text-gray-400 list-none">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Avoid <span className="text-red-400">FATAL_ERRORS</span> (Red Cubes)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Collect <span className="text-green-400">FEATURES</span> (+10 LoC)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" /> Drink <span className="text-cyan-400">COFFEE</span> (+50 LoC)</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-green-500 text-black font-black text-xl hover:bg-white transition-colors duration-300 flex items-center justify-center gap-3 uppercase"
            >
              Execute script --production
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {status === 'gameover' && (
        <div className="absolute inset-0 bg-red-950/40 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto p-4 z-20">
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="inline-block px-4 py-1 bg-red-600 text-white text-[10px] font-bold uppercase mb-2">Critical Failure</div>
            <h2 className="text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              RUNTIME<span className="text-red-500">_ERROR</span>
            </h2>
            
            <div className="bg-black/80 border border-red-500/30 p-6 rounded-sm mb-8">
                <div className="text-gray-500 text-xs mb-2">Final Production Metrics:</div>
                <div className="text-4xl text-white font-black uppercase">{score} lines</div>
            </div>

            <button
              onClick={handleStart}
              className="px-16 py-6 bg-white text-black font-black text-2xl hover:bg-red-500 hover:text-white transition-all duration-300 skew-x-[-10deg]"
            >
              FORCE_REBOOT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}