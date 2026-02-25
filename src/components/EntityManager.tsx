import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useGameStore } from '../store';
import * as THREE from 'three';
import { playCrashSound, playCollectSound } from '../audio';

const ENTITY_COUNT = 25;
const SPAWN_DISTANCE = 120;
const LANE_WIDTH = 3;

type EntityType = 'error' | 'feature' | 'coffee';

interface EntityData {
  z: number;
  x: number;
  type: EntityType;
  active: boolean;
  ref: THREE.Group | null;
}

const ENTITY_CONFIG = {
  error: { color: '#ff0000', text: 'ERROR', score: 0, damage: true },
  feature: { color: '#00ff00', text: '{ }', score: 10, damage: false },
  coffee: { color: '#00ffff', text: '++i', score: 50, damage: false },
};

export function EntityManager({ playerRef }: { playerRef: React.RefObject<THREE.Group> }) {
  const { speed, status, actions } = useGameStore();
  const groupRef = useRef<THREE.Group>(null);
  
  const [entityList] = useState(() => {
    return new Array(ENTITY_COUNT).fill(0).map((_, i) => ({
      z: -SPAWN_DISTANCE - (i * (SPAWN_DISTANCE / 5)),
      x: (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH,
      type: Math.random() > 0.4 ? 'error' : (Math.random() > 0.5 ? 'feature' : 'coffee') as EntityType, 
      active: true,
      ref: null as THREE.Group | null,
    }));
  });
  
  const entities = useRef<EntityData[]>(entityList);

  useFrame((state, delta) => {
    if (status !== 'playing') return;

    const playerPos = playerRef.current?.position;

    entities.current.forEach((entity) => {
      if (!entity.ref) return;

      entity.z += speed * delta;
      
      if (entity.z > 5 || !entity.active) {
        respawnEntity(entity);
      }

      entity.ref.position.z = entity.z;
      entity.ref.position.x = entity.x;
      
      const scale = entity.active ? 1 : 0;
      entity.ref.scale.setScalar(THREE.MathUtils.lerp(entity.ref.scale.x, scale, delta * 10));

      if (playerPos && entity.active) {
        const dx = Math.abs(playerPos.x - entity.x);
        const dz = Math.abs(playerPos.z - entity.z);
        
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
    
    const rand = Math.random();
    if (rand < 0.5) entity.type = 'error';
    else if (rand < 0.8) entity.type = 'feature';
    else entity.type = 'coffee';
    
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
      entity.active = false;
      
      if (speed < 50) actions.setSpeed(speed + 0.2);
    }
  };

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
  
  if (type === 'error') {
    return (
      <Float speed={6} rotationIntensity={3} floatIntensity={0.5}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1, 4, 4, 4]} />
          
          <MeshDistortMaterial 
            color={config.color} 
            emissive={config.color} 
            emissiveIntensity={1.5}
            roughness={0.2}
            metalness={0.8}
            distort={0.4}
            speed={5}
          />
          
          <mesh>
            <boxGeometry args={[1.1, 1.1, 1.1]} />
            <meshBasicMaterial 
              color="#ff5555" 
              wireframe 
              transparent 
              opacity={0.6} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </mesh>
      </Float>
    );
  }

  return (
    <Float speed={3} rotationIntensity={1.5} floatIntensity={1}>
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[0.6]} />
        <meshPhysicalMaterial 
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9} 
          ior={2.4}          
          thickness={0.5}    
          clearcoat={1}      
          clearcoatRoughness={0.1}
        />
        
        <mesh>
          <octahedronGeometry args={[0.601]} />
          <meshBasicMaterial 
            color="#ffffff" 
            wireframe 
            transparent 
            opacity={0.4} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </mesh>
    </Float>
  );
};