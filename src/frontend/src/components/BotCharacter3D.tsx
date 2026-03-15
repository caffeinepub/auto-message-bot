import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

function BotMesh({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.08 * scale;
      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    }

    // Blinking eyes
    const blinkCycle = t % 3;
    const blink = blinkCycle > 2.8 && blinkCycle < 3.0 ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = blink;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = blink;

    // Antenna bounce
    if (antennaRef.current) {
      antennaRef.current.position.y =
        0.55 * scale + Math.sin(t * 3) * 0.03 * scale;
    }
  });

  const s = scale;

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5 * s, 0.45 * s, 0.3 * s]} />
        <meshStandardMaterial color="#128C7E" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.38 * s, 0]}>
        <boxGeometry args={[0.42 * s, 0.35 * s, 0.28 * s]} />
        <meshStandardMaterial
          color="#075E54"
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Face plate */}
      <mesh position={[0, 0.38 * s, 0.145 * s]}>
        <boxGeometry args={[0.36 * s, 0.28 * s, 0.01 * s]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.2} />
      </mesh>

      {/* Left eye */}
      <mesh ref={leftEyeRef} position={[-0.1 * s, 0.4 * s, 0.155 * s]}>
        <sphereGeometry args={[0.055 * s, 12, 12]} />
        <meshStandardMaterial
          color="#25D366"
          emissive="#25D366"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Right eye */}
      <mesh ref={rightEyeRef} position={[0.1 * s, 0.4 * s, 0.155 * s]}>
        <sphereGeometry args={[0.055 * s, 12, 12]} />
        <meshStandardMaterial
          color="#25D366"
          emissive="#25D366"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 0.3 * s, 0.155 * s]}>
        <boxGeometry args={[0.16 * s, 0.04 * s, 0.01 * s]} />
        <meshStandardMaterial
          color="#25D366"
          emissive="#25D366"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Antenna stem */}
      <mesh position={[0, 0.62 * s, 0]}>
        <cylinderGeometry args={[0.02 * s, 0.02 * s, 0.14 * s, 8]} />
        <meshStandardMaterial color="#25D366" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Antenna ball */}
      <mesh ref={antennaRef} position={[0, 0.55 * s, 0]}>
        <sphereGeometry args={[0.065 * s, 12, 12]} />
        <meshStandardMaterial
          color="#25D366"
          emissive="#25D366"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.32 * s, 0.02 * s, 0]}>
        <boxGeometry args={[0.12 * s, 0.32 * s, 0.12 * s]} />
        <meshStandardMaterial color="#128C7E" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.32 * s, 0.02 * s, 0]}>
        <boxGeometry args={[0.12 * s, 0.32 * s, 0.12 * s]} />
        <meshStandardMaterial color="#128C7E" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.14 * s, -0.32 * s, 0]}>
        <boxGeometry args={[0.16 * s, 0.2 * s, 0.16 * s]} />
        <meshStandardMaterial color="#075E54" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.14 * s, -0.32 * s, 0]}>
        <boxGeometry args={[0.16 * s, 0.2 * s, 0.16 * s]} />
        <meshStandardMaterial color="#075E54" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Chest detail */}
      <mesh position={[0, 0.05 * s, 0.155 * s]}>
        <boxGeometry args={[0.2 * s, 0.12 * s, 0.01 * s]} />
        <meshStandardMaterial
          color="#25D366"
          emissive="#25D366"
          emissiveIntensity={0.5}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

export { BotMesh };
