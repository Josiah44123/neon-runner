import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';

export function Ground() {
  const ref = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const { speed, status } = useGameStore();

  useFrame((state, delta) => {
    if (status === 'playing') {
     
      if (gridRef.current) {
        gridRef.current.position.z = (gridRef.current.position.z + speed * delta) % 10;
      }
    }
  });

  return (
    <group>
      {}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#050505" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {}
      <gridHelper 
        ref={gridRef}
        args={[1000, 100, 0xff00cc, 0x222222]} 
        position={[0, -0.49, 0]} 
      />
    </group>
  );
}
