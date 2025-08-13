import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SimpleParticles() {
  const ref = useRef<THREE.Points>(null);

  // Generate fewer, more spread out particles
  const positions = useMemo(() => {
    const positions = new Float32Array(100 * 3);

    for (let i = 0; i < 100; i++) {
      // Spread particles across a larger area
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      // Very gentle rotation
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        color="#6366f1"
        transparent
        opacity={0.3}
        sizeAttenuation={true}
      />
    </points>
  );
}

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);

  // A few accent particles that move gently
  const positions = useMemo(() => {
    const positions = new Float32Array(20 * 3);

    for (let i = 0; i < 20; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      // Gentle floating motion
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 2;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        color="#8b5cf6"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
      />
    </points>
  );
}

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        style={{ background: "transparent" }}
      >
        <SimpleParticles />
        <FloatingParticles />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
