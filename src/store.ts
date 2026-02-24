import { create } from 'zustand';

interface GameState {
  score: number;
  highScore: number;
  status: 'idle' | 'playing' | 'gameover';
  speed: number;
  actions: {
    startGame: () => void;
    endGame: () => void;
    resetGame: () => void;
    incrementScore: (amount?: number) => void;
    setSpeed: (speed: number) => void;
  };
}

export const useGameStore = create<GameState>((set) => {
  const getHighScore = () => {
    try {
      return parseInt(localStorage.getItem('neon_runner_highscore') || '0');
    } catch (e) {
      return 0;
    }
  };

  return {
    score: 0,
    highScore: getHighScore(),
    status: 'idle',
    speed: 15,
    actions: {
      startGame: () => set({ status: 'playing', score: 0, speed: 15 }),
      endGame: () => set((state) => {
        const newHighScore = Math.max(state.score, state.highScore);
        try {
          localStorage.setItem('neon_runner_highscore', newHighScore.toString());
        } catch (e) {
          // Ignore storage errors
        }
        return { status: 'gameover', highScore: newHighScore };
      }),
      resetGame: () => set({ status: 'idle', score: 0, speed: 15 }),
      incrementScore: (amount = 1) => set((state) => ({ score: state.score + amount })),
      setSpeed: (speed) => set({ speed }),
    },
  };
});
