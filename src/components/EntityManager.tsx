import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const typeRef = useRef<EntityType>('error');
  const isActive = useRef(true);
  const floatOffset = useRef(Math.random() * Math.PI * 2);

  const resetEntity = () => {
    if (!groupRef.current || !meshRef.current) return;
    
    groupRef.current.position.x = (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
    
    const rand = Math.random();
    const newType: EntityType = rand < 0.4 ? 'error' : (rand < 0.7 ? 'feature' : 'coffee');
    typeRef.current = newType;
    
    meshRef.current.geometry = newType === 'error' ? errorGeometry : floatGeometry;
    meshRef.current.material = materials[newType];
    
    isActive.current = true;
    groupRef.current.scale.setScalar(0.1);
  };

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.z = initialZ;
      resetEntity();
    }
  }, [initialZ]);

  const handleCollision = (currentSpeed: number, actions: any) => {
    const config = ENTITY_CONFIG[typeRef.current];
    
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

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    const { status, speed, actions } = useGameStore.getState();
    if (status !== 'playing') return;

    groupRef.current.position.z += speed * delta;

    if (typeRef.current !== 'error') {
      meshRef.current.rotation.x += delta * 1.5;
      meshRef.current.rotation.y += delta * 1.5;
      meshRef.current.position.y = Math.sin((state.clock.elapsedTime * 3) + floatOffset.current) * 0.2;
    } else {
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.position.y = 0;
    }

    if (groupRef.current.position.z > DESPAWN_Z) {
      const totalTrackLength = ENTITY_COUNT * (SPAWN_DISTANCE / 5);
      groupRef.current.position.z -= totalTrackLength;
      resetEntity();
    }

    const targetScale = isActive.current ? 1 : 0;
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 10));

    const playerPos = playerRef.current?.position;
    if (playerPos && isActive.current) {
      const dx = Math.abs(playerPos.x - groupRef.current.position.x);
      const dz = Math.abs(playerPos.z - groupRef.current.position.z);
      
      if (dx < COLLISION_THRESHOLD && dz < COLLISION_THRESHOLD) {
        handleCollision(speed, actions);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} castShadow receiveShadow />
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