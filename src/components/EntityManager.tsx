function GameEntity({ initialZ, playerRef }: { initialZ: number, playerRef: React.RefObject<THREE.Group> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 1. Initialize with your original 60% error probability right off the bat
  const typeRef = useRef<EntityType>(
    Math.random() > 0.4 ? 'error' : (Math.random() > 0.5 ? 'feature' : 'coffee')
  );
  
  const isActive = useRef(true);
  const floatOffset = useRef(Math.random() * Math.PI * 2);

  const resetEntity = () => {
    if (!groupRef.current || !meshRef.current) return;
    
    groupRef.current.position.x = (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
    
    // Restore original 60% probability logic here too
    const newType: EntityType = Math.random() > 0.4 ? 'error' : (Math.random() > 0.5 ? 'feature' : 'coffee');
    typeRef.current = newType;
    
    meshRef.current.geometry = newType === 'error' ? errorGeometry : floatGeometry;
    meshRef.current.material = materials[newType];
    
    isActive.current = true;
    groupRef.current.scale.setScalar(0.1);
  };

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.z = initialZ;
      // Just set the initial X position on mount, don't call resetEntity() 
      // otherwise it overwrites the initial typeRef we just set
      groupRef.current.position.x = (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
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
      <mesh 
        ref={meshRef} 
        castShadow 
        receiveShadow 
        // 2. Pass the initial geometry and material so R3F successfully mounts them
        geometry={typeRef.current === 'error' ? errorGeometry : floatGeometry}
        material={materials[typeRef.current]}
      />
    </group>
  );
}