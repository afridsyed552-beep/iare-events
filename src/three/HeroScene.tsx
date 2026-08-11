import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  Sparkles,
  Stars,
} from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// ------- Animated floating shape cluster -------
function ShapeCluster() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.08;
    const t = state.clock.elapsedTime;
    group.current.position.x = Math.sin(t * 0.12) * 0.4;
    group.current.position.y = Math.cos(t * 0.09) * 0.25;
  });

  return (
    <group ref={group}>
      {/* Hero centerpiece: glass torus knot */}
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh position={[0, 0.2, 0]} scale={1.15}>
          <torusKnotGeometry args={[1, 0.32, 220, 36]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.6}
            roughness={0.12}
            transmission={1}
            ior={1.35}
            chromaticAberration={0.08}
            anisotropy={0.4}
            distortion={0.25}
            distortionScale={0.6}
            temporalDistortion={0.12}
            color="#c4b5fd"
            attenuationColor="#7c3aed"
            attenuationDistance={2.2}
          />
        </mesh>
      </Float>

      {/* Orbiting wireframe icosahedron */}
      <Float speed={2} rotationIntensity={1.4} floatIntensity={1.6}>
        <mesh position={[3.1, 1.1, -1.2]} rotation={[0.6, 0.2, 0]}>
          <icosahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial
            color="#22d3ee"
            wireframe
            emissive="#0e7490"
            emissiveIntensity={0.6}
            transparent
            opacity={0.55}
          />
        </mesh>
      </Float>

      {/* Glossy octahedron */}
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.4}>
        <mesh position={[-3.4, -0.6, -1.6]} rotation={[0.4, 0.8, 0.2]}>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.9}
            roughness={0.2}
            emissive="#4c1d95"
            emissiveIntensity={0.35}
          />
        </mesh>
      </Float>

      {/* Metallic torus */}
      <Float speed={2.2} rotationIntensity={1.6} floatIntensity={1.2}>
        <mesh position={[2.6, -1.5, -0.4]} rotation={[1.2, 0.4, 0]}>
          <torusGeometry args={[0.62, 0.2, 24, 64]} />
          <meshStandardMaterial
            color="#f472b6"
            metalness={0.85}
            roughness={0.25}
            emissive="#9d174d"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>

      {/* Small shards */}
      <Float speed={2.6} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[-2.2, 1.6, 0.6]}>
          <tetrahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.7}
            roughness={0.3}
            emissive="#78350f"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={1.8} floatIntensity={1.8}>
        <mesh position={[0.4, -1.9, 1.1]}>
          <icosahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color="#34d399"
            metalness={0.75}
            roughness={0.25}
            emissive="#064e3b"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
    </group>
  );
}

// ------- Mouse parallax rig -------
function Rig() {
  useFrame((state) => {
    const { pointer, camera } = state;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.7, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.4, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  const gl = useMemo(() => ({ antialias: true, alpha: true, powerPreference: "high-performance" as const }), []);
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      gl={gl}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 6, 5]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-6, -2, 3]} intensity={60} color="#8b5cf6" />
      <pointLight position={[6, 3, -2]} intensity={50} color="#22d3ee" />

      <ShapeCluster />

      <Stars radius={45} depth={35} count={2600} factor={3.4} saturation={0.6} fade speed={0.8} />
      <Sparkles count={140} scale={[14, 8, 6]} size={2.2} speed={0.35} color="#c4b5fd" opacity={0.7} />

      <Rig />
    </Canvas>
  );
}

/** Small reusable orb used on secondary pages (cheap, single mesh). */
export function MiniOrb() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} />
      <Float speed={1.6} rotationIntensity={0.8} floatIntensity={1}>
        <mesh>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial
            color="#7c3aed"
            metalness={0.6}
            roughness={0.25}
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh scale={0.55}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#22d3ee" metalness={0.9} roughness={0.2} />
        </mesh>
      </Float>
    </Canvas>
  );
}
