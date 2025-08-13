import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AnimatedSphereProps {
  color?: string;
  speed?: number;
}

function AnimatedSphere({ color = "#6366f1", speed = 1 }: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.1;
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.2}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function FloatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2;
      meshRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 2;
    }
  });

  return (
    <mesh ref={meshRef} position={[3, 1, -2]}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial
        color="#8b5cf6"
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
}

function FloatingTorus() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      meshRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.3) * 3;
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.4) * 1.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[-3, -1, -1]}>
      <torusGeometry args={[0.6, 0.2, 16, 32]} />
      <meshStandardMaterial color="#ec4899" transparent opacity={0.7} />
    </mesh>
  );
}

interface AnimatedGeometryProps {
  className?: string;
  showSphere?: boolean;
  showCube?: boolean;
  showTorus?: boolean;
  sphereColor?: string;
  size?: "small" | "medium" | "large";
}

const AnimatedGeometry = ({
  className = "",
  showSphere = true,
  showCube = true,
  showTorus = true,
  sphereColor = "#6366f1",
  size = "medium",
}: AnimatedGeometryProps) => {
  const containerSize = {
    small: "h-32 w-32",
    medium: "h-48 w-48",
    large: "h-64 w-64",
  };

  const cameraDistance = {
    small: 4,
    medium: 6,
    large: 8,
  };

  return (
    <div className={`${containerSize[size]} ${className}`}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance[size]], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {showSphere && <AnimatedSphere color={sphereColor} speed={1} />}
        {showCube && <FloatingCube />}
        {showTorus && <FloatingTorus />}
      </Canvas>
    </div>
  );
};

export default AnimatedGeometry;
