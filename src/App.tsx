

import Game from './components/Game';
import UI from './components/UI';

export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <UI />
      <Game />
    </div>
  );
}
