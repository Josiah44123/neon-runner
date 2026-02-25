import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';

export function Ground() {
  const gridRef = useRef<THREE.Mesh>(null);
  const { speed, status } = useGameStore();

  useFrame((state, delta) => {
    if (status === 'playing') {
      if (gridRef.current) {
        // Animates the wireframe grid towards the player. 
        // We use % 10 for a seamless loop because the cylinder length 
        // is 1000 with 100 heightSegments (which equals exactly 10 units per segment).
        gridRef.current.position.z = (gridRef.current.position.z + speed * delta) % 10;
      }
    }
  });

  return (
    <group>
      {/* Solid Base Cylinder (The Dark Surface)
        Laid on its side along the Z-axis. Radius is 50. 
        Positioned at Y: -50.5, so the absolute top center is exactly at Y: -0.5.
        This ensures your player/obstacles stay perfectly grounded with no extra math needed!
      */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -50.5, 0]} receiveShadow>
        <cylinderGeometry args={[50, 50, 1000, 64, 1]} />
        <meshStandardMaterial color="#050505" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Wireframe Grid Cylinder (The Neon Lines) 
        Replaces the old GridHelper with a curved wireframe mesh.
      */}
      <mesh 
        ref={gridRef}
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, -50.5, 0]} 
      >
        {/* Radius is slightly larger (50.05) to sit just on top of the black ground and prevent graphical glitching (Z-fighting) */}
        <cylinderGeometry args={[50.05, 50.05, 1000, 48, 100]} />
        <meshBasicMaterial color="#ff00cc" wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}