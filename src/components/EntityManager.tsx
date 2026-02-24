import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useGameStore } from '../store';
import * as THREE from 'three';
import { playCrashSound, playCollectSound } from '../audio';

const ENTITY_COUNT = 25;
const SPAWN_DISTANCE = 120;
const LANE_WIDTH = 3;

type EntityType = 'error' | 'bug' | 'feature' | 'coffee';

interface EntityData {
  z: number;
  x: number;
  type: EntityType;
  active: boolean;
  ref: THREE.Group | null;
  rotationSpeed: number;
}

const ENTITY_CONFIG = {
  error: { color: '#ff0000', text: 'ERROR', score: 0, damage: true },
  bug: { color: '#ffaa00', text: 'BUG', score: 0, damage: true },
  feature: { color: '#00ff00', text: '{ }', score: 10, damage: false },
  coffee: { color: '#00ffff', text: '++i', score: 50, damage: false },
};

export function EntityManager({ playerRef }: { playerRef: React.RefObject<THREE.Group> }) {
  const { speed, status, actions } = useGameStore();
  const groupRef = useRef<THREE.Group>(null);
  
  const [entityList] = useState(() => {
    return new Array(ENTITY_COUNT).fill(0).map((_, i) => ({
      z: -SPAWN_DISTANCE - (i * (SPAWN_DISTANCE / 5)), // Initial spread
      x: (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH,
      type: Math.random() > 0.3 ? 'error' : (Math.random() > 0.5 ? 'feature' : 'coffee') as EntityType, // 70% bad, 30% good
      active: true,
      ref: null as THREE.Group | null,
      rotationSpeed: Math.random() * 2 + 1
    }));
  });
  
  const entities = useRef<EntityData[]>(entityList);

  useFrame((state, delta) => {
    if (status !== 'playing') return;

    const playerPos = playerRef.current?.position;

    entities.current.forEach((entity) => {
      if (!entity.ref) return;

      // Move entity
      entity.z += speed * delta;
      
      // Rotate entity for effect
      entity.ref.rotation.y += entity.rotationSpeed * delta;
      entity.ref.rotation.x += entity.rotationSpeed * 0.5 * delta;

      // Respawn logic
      if (entity.z > 5 || !entity.active) {
        respawnEntity(entity);
      }

      // Update mesh position
      entity.ref.position.z = entity.z;
      entity.ref.position.x = entity.x;
      
      // Scale effect for spawning/despawning
      const scale = entity.active ? 1 : 0;
      entity.ref.scale.setScalar(THREE.MathUtils.lerp(entity.ref.scale.x, scale, delta * 10));

      // Collision detection
      if (playerPos && entity.active) {
        const dx = Math.abs(playerPos.x - entity.x);
        const dz = Math.abs(playerPos.z - entity.z);
        
        // Collision box
        if (dx < 0.8 && dz < 0.8) {
          handleCollision(entity);
        }
      }
    });
  });

  const respawnEntity = (entity: EntityData) => {
    entity.z = -SPAWN_DISTANCE - Math.random() * 40;
    entity.x = (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
    entity.active = true;
    
    // Randomize type
    const rand = Math.random();
    if (rand < 0.5) entity.type = 'error';
    else if (rand < 0.7) entity.type = 'bug';
    else if (rand < 0.9) entity.type = 'feature';
    else entity.type = 'coffee';
    
    // Reset scale for pop-in effect (handled in useFrame lerp)
    if (entity.ref) entity.ref.scale.setScalar(0.1);
  };

  const handleCollision = (entity: EntityData) => {
    const config = ENTITY_CONFIG[entity.type];
    
    if (config.damage) {
      playCrashSound();
      actions.endGame();
    } else {
      playCollectSound();
      actions.incrementScore(config.score);
      entity.active = false; // Hide until respawn
      
      // Speed up slightly on collect to make it harder
      if (speed < 50) actions.setSpeed(speed + 0.2);
    }
  };

  // Reset on game start
  useEffect(() => {
    if (status === 'playing') {
      entities.current.forEach((entity, i) => {
        entity.z = -SPAWN_DISTANCE - (i * 10);
        entity.x = (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
        entity.active = true;
        if (entity.ref) {
          entity.ref.position.z = entity.z;
          entity.ref.position.x = entity.x;
          entity.ref.scale.setScalar(1);
        }
      });
    }
  }, [status]);

  return (
    <group ref={groupRef}>
      {entities.current.map((entity, i) => (
        <group key={i} ref={(el) => (entity.ref = el)}>
          <EntityMesh type={entity.type} />
        </group>
      ))}
    </group>
  );
}

const EntityMesh = ({ type }: { type: EntityType }) => {
  const config = ENTITY_CONFIG[type];
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh castShadow receiveShadow>
        {type === 'error' || type === 'bug' ? (
          <boxGeometry args={[1, 1, 1]} />
        ) : (
          <octahedronGeometry args={[0.6]} />
        )}
        <meshStandardMaterial 
          color={config.color} 
          emissive={config.color} 
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
};
