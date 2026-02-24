import { useGameStore } from '../store';
import { playStartSound } from '../audio';

export default function UI() {
  const { score, highScore, status, actions } = useGameStore();

  const handleStart = () => {
    playStartSound();
    actions.startGame();
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center font-mono z-10 select-none">
      {/* HUD */}
      <div className="absolute top-8 left-8 text-white">
        <div className="text-sm text-gray-400">LINES_OF_CODE</div>
        <div className="text-3xl font-bold tracking-wider text-green-400 font-mono">
          {score.toString().padStart(6, '0')}
        </div>
      </div>
      
      <div className="absolute top-8 right-8 text-white text-right">
        <div className="text-sm text-gray-400">HIGH_SCORE</div>
        <div className="text-3xl font-bold tracking-wider text-cyan-400 font-mono">
          {highScore.toString().padStart(6, '0')}
        </div>
      </div>

      {/* Start Screen */}
      {status === 'idle' && (
        <div className="bg-black/90 p-12 rounded-lg border border-green-500/30 backdrop-blur-md text-center pointer-events-auto shadow-[0_0_50px_rgba(0,255,0,0.2)]">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500 mb-2 font-mono">
            &lt;NEON_RUNNER /&gt;
          </h1>
          <div className="text-gray-500 mb-8 font-mono text-sm">v1.0.0-release</div>
          
          <div className="flex gap-8 justify-center mb-8 text-gray-300 font-mono text-sm">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-gray-600 rounded flex items-center justify-center mb-2">←</div>
              <span>MOVE_LEFT</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-gray-600 rounded flex items-center justify-center mb-2">→</div>
              <span>MOVE_RIGHT</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="group relative px-8 py-4 bg-green-500 text-black font-bold text-xl rounded hover:bg-green-400 transition-all overflow-hidden"
          >
            <span className="relative z-10">npm run start</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {status === 'gameover' && (
        <div className="bg-black/90 p-12 rounded-lg border border-red-500/50 backdrop-blur-md text-center pointer-events-auto animate-in fade-in zoom-in duration-300 shadow-[0_0_50px_rgba(255,0,0,0.3)]">
          <h2 className="text-6xl font-bold text-red-500 mb-2 font-mono">FATAL_ERROR</h2>
          <p className="text-red-400/80 mb-6 font-mono">Process terminated unexpectedly</p>
          
          <div className="bg-gray-900/50 p-4 rounded mb-8 text-left font-mono text-sm text-gray-300 border border-gray-800">
            <div>&gt; Error: Collision detected at runtime</div>
            <div>&gt; Lines compiled: <span className="text-green-400">{score}</span></div>
            <div>&gt; Stack trace cleared</div>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 bg-red-500 text-white font-bold text-xl rounded hover:bg-red-600 transition-colors font-mono"
          >
            sudo reboot
          </button>
        </div>
      )}
    </div>
  );
}
