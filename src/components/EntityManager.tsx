import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { playCrashSound, playCollectSound } from '../audio';

const ENTITY_COUNT = 25;
const SPAWN_DISTANCE = 120;
const LANE_WIDTH = 3;
const DESPAWN_Z = 5;
const COLLISION_THRESHOLD = 0.8;

type EntityType = 'error' | 'feature' | 'coffee';

const ENTITY_CONFIG = {
  error: { color: '#ff0000', score: 0, damage: true },
  feature: { color: '#00ff00', score: 10, damage: false },
  coffee: { color: '#00ffff', score: 50, damage: false },
};

const errorGeometry = new THREE.BoxGeometry(1, 1, 1);
const floatGeometry = new THREE.OctahedronGeometry(0.6);

const materials = {
  error: new THREE.MeshStandardMaterial({
    color: ENTITY_CONFIG.error.color,
    emissive: ENTITY_CONFIG.error.color,
    emissiveIntensity: 0.8,
    roughness: 0.6,
    metalness: 0.2,
  }),
  feature: new THREE.MeshPhysicalMaterial({
    color: ENTITY_CONFIG.feature.color,
    emissive: ENTITY_CONFIG.feature.color,
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.9, ior: 2.4, thickness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1,
  }),
  coffee: new THREE.MeshPhysicalMaterial({
    color: ENTITY_CONFIG.coffee.color,
    emissive: ENTITY_CONFIG.coffee.color,
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.9, ior: 2.4, thickness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1,
  })
};

function GameEntity({ initialZ, playerRef }: { initialZ: number, playerRef: React.RefObject<THREE.Group> }) {
  const ref = useRef<THREE.Group>(null);
  
  const [type, setType] = useState<EntityType>(() => 
    Math.random() > 0.4 ? 'error' : (Math.random() > 0.5 ? 'feature' : 'coffee')
  );
  
  const isActive = useRef(true);

  useMemo(() => {
    if (ref.current) {
      ref.current.position.z = initialZ;
      ref.current.position.x = (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
    }
  }, [initialZ]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const { status, speed, actions } = useGameStore.getState();
    if (status !== 'playing') return;

    ref.current.position.z += speed * delta;

    if (ref.current.position.z > DESPAWN_Z) {
      ref.current.position.z = -SPAWN_DISTANCE - Math.random() * 40;
      ref.current.position.x = (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
      isActive.current = true;
      ref.current.scale.setScalar(0.1);

      const rand = Math.random();
      setType(rand < 0.5 ? 'error' : (rand < 0.8 ? 'feature' : 'coffee'));
    }

    const targetScale = isActive.current ? 1 : 0;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, targetScale, delta * 10));

    const playerPos = playerRef.current?.position;
    if (playerPos && isActive.current) {
      const dx = Math.abs(playerPos.x - ref.current.position.x);
      const dz = Math.abs(playerPos.z - ref.current.position.z);
      
      if (dx < COLLISION_THRESHOLD && dz < COLLISION_THRESHOLD) {
        handleCollision(speed, actions);
      }
    }
  });

  const handleCollision = (currentSpeed: number, actions: any) => {
    const config = ENTITY_CONFIG[type];
    
    if (config.damage) {
      playCrashSound();
      actions.endGame();
    } else {
      playCollectSound();
      actions.incrementScore(config.score);
      isActive.current = false;
      
      if (currentSpeed < 50) actions.setSpeed(currentSpeed + 0.2);
    }
  };

  return (
    <group ref={ref}>
      {type === 'error' ? (
        <mesh castShadow receiveShadow geometry={errorGeometry} material={materials.error} />
      ) : (
        <Float speed={3} rotationIntensity={1.5} floatIntensity={1}>
          <mesh castShadow receiveShadow geometry={floatGeometry} material={materials[type]} />
        </Float>
      )}
    </group>
  );
}

export function EntityManager({ playerRef }: { playerRef: React.RefObject<THREE.Group> }) {
  const initialPositions = useMemo(() => 
    Array.from({ length: ENTITY_COUNT }, (_, i) => -SPAWN_DISTANCE - (i * (SPAWN_DISTANCE / 5))),
  []);

  return (
    <group>
      {initialPositions.map((zPos, i) => (
        <GameEntity key={i} initialZ={zPos} playerRef={playerRef} />
      ))}
    </group>
  );
}