import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateNetworkNodes, buildConnections } from '../../three/networkGeometry';

interface SceneContentProps {
  interactive: boolean;
  nodeCount: number;
}

function SceneContent({ interactive, nodeCount }: SceneContentProps) {
  const nodes = useMemo(() => generateNetworkNodes(nodeCount, 42), [nodeCount]);
  const anomalyRef = useRef<THREE.Mesh>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      arr[i * 3] = n.position[0];
      arr[i * 3 + 1] = n.position[1];
      arr[i * 3 + 2] = n.position[2];
    });
    return arr;
  }, [nodes]);

  const linePositions = useMemo(() => buildConnections(nodes, 1.8), [nodes]);
  const anomaly = nodes.find((n) => n.isAnomaly)!;

  useFrame((state) => {
    if (anomalyRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.25;
      anomalyRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#9DFFC0" size={0.05} transparent opacity={0.6} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#1C6B3A" transparent opacity={0.35} />
      </lineSegments>
      <mesh ref={anomalyRef} position={anomaly.position}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#33FF77" />
      </mesh>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={interactive}
        autoRotate={!interactive}
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

export interface NodeNetworkSceneProps {
  interactive?: boolean;
  nodeCount?: number;
}

export function NodeNetworkScene({ interactive = true, nodeCount = 400 }: NodeNetworkSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
      <SceneContent interactive={interactive} nodeCount={nodeCount} />
    </Canvas>
  );
}
