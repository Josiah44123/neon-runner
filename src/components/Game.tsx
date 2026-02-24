import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Player } from './Player';
import { EntityManager } from './EntityManager';
import { Ground } from './Ground';
import { useGameStore } from '../store';
import * as THREE from 'three';

function FloatingCode() {
  const codeSnippets = ['void', 'null', 'undefined', 'NaN', '0x00', 'if(true)', 'return;', 'import', 'export'];
  
  return (
    <group>
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={1} floatIntensity={1} position={[
          (Math.random() - 0.5) * 50,
          Math.random() * 20 + 5,
          -Math.random() * 100
        ]}>
          <mesh>
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            <meshBasicMaterial color="#333" transparent opacity={0.5} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function GameScene() {
  const playerRef = useRef<THREE.Group>(null);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={60} rotation={[-0.2, 0, 0]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ff00" />
      
      {/* Environment Setup */}
      <color attach="background" args={['#000000']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Note: Environment presets are commented out to prevent CDN fetching crashes */}
      {/* <Environment preset="night" background={false} /> */}
      
      <fog attach="fog" args={['#000000', 10, 60]} />

      <group>
        <Player ref={playerRef} />
        <EntityManager playerRef={playerRef} />
        <Ground />
        <FloatingCode />
      </group>
    </>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-white font-mono z-50">
      LOADING ASSETS...
    </div>
  );
}

export default function Game() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {/* The comment is safely inside the div now! */}
      <Suspense fallback={<Loader />}>
        <Canvas shadows dpr={[1, 2]}>
          <color attach="background" args={['#000000']} />
          <GameScene />
        </Canvas>
      </Suspense>
    </div>
  );
}