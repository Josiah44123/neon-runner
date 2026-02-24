import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Group } from 'three';
import { playMoveSound } from '../audio';

const LANE_WIDTH = 3;
const LERP_SPEED = 15;

export const Player = forwardRef<Group, {}>((props, ref) => {
  const localRef = useRef<Group>(null);
  const [targetX, setTargetX] = useState(0);
  const { status } = useGameStore();

  useImperativeHandle(ref, () => localRef.current!);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setTargetX((prev) => {
          const next = Math.max(prev - LANE_WIDTH, -LANE_WIDTH);
          if (next !== prev) playMoveSound();
          return next;
        });
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setTargetX((prev) => {
          const next = Math.min(prev + LANE_WIDTH, LANE_WIDTH);
          if (next !== prev) playMoveSound();
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  useEffect(() => {
    if (status === 'playing') {
      setTargetX(0);
      if (localRef.current) {
        localRef.current.position.x = 0;
      }
    }
  }, [status]);

  useFrame((state, delta) => {
    if (!localRef.current) return;

    localRef.current.position.x += (targetX - localRef.current.position.x) * LERP_SPEED * delta;
    localRef.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.1 + 0.5;
    localRef.current.rotation.z = (localRef.current.position.x - targetX) * -0.2;
    
    if (status === 'playing') {
        localRef.current.position.x += (Math.random() - 0.5) * 0.02;
    }
  });

  return (
    <group ref={localRef} position={[0, 0.5, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} /> 
        <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={1}
            roughness={0}
            metalness={1}
        />
      </mesh>

      <pointLight distance={6} intensity={10} color="#00ffff" />
    </group>
  );
});