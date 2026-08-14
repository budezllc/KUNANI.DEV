import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  type Group,
  type InstancedMesh,
  Object3D,
} from "three";
import type { WorldKind, WorldPalette } from "../data/types";

type ArtifactProps = {
  kind: WorldKind;
  intensity: number;
  palette: WorldPalette;
};

export function Artifact({ kind, intensity, palette }: ArtifactProps) {
  if (intensity < 0.03) return null;
  const common = { intensity, palette };
  switch (kind) {
    case "tsuki":
      return <TsukiMoon {...common} />;
    case "samurai":
      return <SamuraiKabuto {...common} />;
    case "eye":
      return <EyeRig {...common} />;
    case "gateway":
      return <GatewayStack {...common} />;
    case "voice":
      return <VoiceRings {...common} />;
    case "switch":
      return <SwitchRails {...common} />;
    case "constellation":
      return <Constellation {...common} />;
    case "dungeon":
      return <WhiteHouse {...common} />;
    case "shmup":
      return <ShmupField {...common} />;
    case "arena":
      return <CaptureArena {...common} />;
    case "broadcast":
      return <ChatCards {...common} />;
    default:
      return null;
  }
}

function TsukiMoon({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.08;
  });
  const craters: [number, number, number, number][] = [
    [0.55, 0.7, 0.95, 0.28],
    [-0.8, 0.35, 0.9, 0.22],
    [0.15, -0.55, 1.15, 0.34],
    [-0.4, 1.0, 0.35, 0.18],
    [0.95, -0.2, 0.55, 0.2],
  ];
  return (
    <group ref={ref} scale={intensity}>
      <mesh>
        <sphereGeometry args={[1.55, 48, 36]} />
        <meshStandardMaterial
          color={palette.accent}
          roughness={0.82}
          metalness={0.08}
          emissive={palette.primary}
          emissiveIntensity={0.12}
        />
      </mesh>
      {craters.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 16, 12]} />
          <meshStandardMaterial
            color="#3a3a42"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2.6, 0.2, 0.15]}>
        <torusGeometry args={[2.15, 0.035, 8, 64]} />
        <meshStandardMaterial
          color={palette.secondary}
          emissive={palette.secondary}
          emissiveIntensity={0.55}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function SamuraiKabuto({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.14;
  });
  return (
    <group ref={ref} scale={1.2 * intensity} position={[0, -0.45, 0]}>
      <mesh position={[0, 1.15, 0]} scale={[1.32, 1.02, 1.48]}>
        <sphereGeometry args={[1, 32, 18, 0, Math.PI * 2, 0, Math.PI / 1.65]} />
        <meshStandardMaterial
          color={palette.accent}
          metalness={0.72}
          roughness={0.28}
          emissive={palette.accent}
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh position={[0, 2.08, 0]}>
        <coneGeometry args={[0.14, 0.38, 8]} />
        <meshStandardMaterial
          color={palette.secondary}
          metalness={0.85}
          roughness={0.2}
          emissive={palette.secondary}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, 1.58, 1.18]} rotation={[1.15, 0, 0]}>
        <torusGeometry args={[0.48, 0.075, 8, 28, Math.PI]} />
        <meshStandardMaterial
          color={palette.secondary}
          metalness={0.8}
          roughness={0.22}
          emissive={palette.secondary}
          emissiveIntensity={0.4}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, 0.58 - i * 0.28, 0.08]}
          rotation={[0.18, 0, 0]}
        >
          <cylinderGeometry
            args={[1.12 + i * 0.16, 1.28 + i * 0.16, 0.2, 18, 1, true]}
          />
          <meshStandardMaterial
            color={i % 2 ? palette.primary : palette.accent}
            metalness={0.45}
            roughness={0.4}
            side={DoubleSide}
          />
        </mesh>
      ))}
      <mesh position={[-1.18, 1.05, 0.25]} rotation={[0.1, 0.45, 0.35]}>
        <boxGeometry args={[0.58, 0.72, 0.08]} />
        <meshStandardMaterial
          color={palette.primary}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[1.18, 1.05, 0.25]} rotation={[0.1, -0.45, -0.35]}>
        <boxGeometry args={[0.58, 0.72, 0.08]} />
        <meshStandardMaterial
          color={palette.primary}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>
      <group position={[1.85, 0.15, 0.35]} rotation={[0, 0.2, -0.4]}>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.07, 2.55, 0.035]} />
          <meshStandardMaterial
            color="#c5c0b5"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.07, 16]} />
          <meshStandardMaterial
            color={palette.secondary}
            metalness={0.8}
            roughness={0.22}
            emissive={palette.secondary}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.95, 8]} />
          <meshStandardMaterial color={palette.primary} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

function EyeRig({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.15;
  });
  return (
    <group ref={ref} scale={1.2 * intensity}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.08, 16, 80]} />
        <meshStandardMaterial
          color={palette.primary}
          emissive={palette.primary}
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.14, 16, 64]} />
        <meshStandardMaterial
          color={palette.secondary}
          emissive={palette.secondary}
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color="#0c121c"
          emissive={palette.accent}
          emissiveIntensity={0.35}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

function GatewayStack({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.35;
  });
  return (
    <group ref={ref} scale={intensity}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, i * 0.55 - 0.9, 0]} scale={1.4 - i * 0.22}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={i % 2 ? palette.primary : palette.secondary}
            emissive={palette.accent}
            emissiveIntensity={0.25}
            wireframe={i === 3}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}

function VoiceRings({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const s = 0.7 + Math.sin(clock.elapsedTime * 2.2 + i) * 0.18;
      child.scale.setScalar(s);
    });
  });
  return (
    <group ref={ref} scale={intensity} rotation={[Math.PI / 2, 0, 0]}>
      {[0.6, 1.1, 1.7, 2.3, 2.9].map((r, i) => (
        <mesh key={r}>
          <torusGeometry args={[r, 0.045, 8, 64]} />
          <meshStandardMaterial
            color={i % 2 ? palette.primary : palette.accent}
            emissive={palette.primary}
            emissiveIntensity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function SwitchRails({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const car = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!car.current) return;
    const t = (Math.sin(clock.elapsedTime * 0.9) + 1) / 2;
    car.current.position.set(t * 3 - 1.5, 0.35, t * -0.4);
  });
  return (
    <group scale={intensity}>
      <mesh rotation={[0, 0, 0.18]} position={[0, 0.1, 0]}>
        <boxGeometry args={[4.4, 0.08, 0.18]} />
        <meshStandardMaterial
          color={palette.secondary}
          emissive={palette.secondary}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh rotation={[0, 0, -0.18]} position={[0, -0.15, 0.2]}>
        <boxGeometry args={[4.4, 0.08, 0.18]} />
        <meshStandardMaterial
          color={palette.primary}
          emissive={palette.primary}
          emissiveIntensity={0.5}
        />
      </mesh>
      <group ref={car}>
        <mesh>
          <boxGeometry args={[0.45, 0.28, 0.35]} />
          <meshStandardMaterial
            color={palette.accent}
            emissive={palette.accent}
            emissiveIntensity={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}

function Constellation({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const ref = useRef<Group>(null);
  const points = fibonacci(14, 2.1);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.12;
  });
  return (
    <group ref={ref} scale={intensity}>
      {points.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial
            color={i % 2 ? palette.primary : palette.accent}
            emissive={palette.primary}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function WhiteHouse({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  return (
    <group scale={intensity} position={[0, -0.4, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.2, 1.1, 1.6]} />
        <meshStandardMaterial
          color={palette.primary}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 1.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.55, 0.7, 4]} />
        <meshStandardMaterial color={palette.accent} roughness={0.55} />
      </mesh>
      <mesh position={[0.55, 0.35, 0.82]}>
        <boxGeometry args={[0.35, 0.7, 0.08]} />
        <meshStandardMaterial
          color="#1a1010"
          emissive={palette.secondary}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[-2.4, -0.2, -1.1]}>
        <boxGeometry args={[1.1, 0.5, 0.8]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.8} />
      </mesh>
    </group>
  );
}

function ShmupField({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const bullets = useRef<InstancedMesh>(null);
  const ship = useRef<Group>(null);
  const dummy = useRef(new Object3D());
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ship.current) {
      ship.current.position.x = Math.sin(t * 1.4) * 0.55;
      ship.current.position.y = Math.cos(t * 0.9) * 0.2 - 0.9;
    }
    if (!bullets.current) return;
    let i = 0;
    for (let ring = 0; ring < 8; ring += 1) {
      for (let j = 0; j < 14; j += 1) {
        const a = (j / 14) * Math.PI * 2 + t * (0.5 + ring * 0.07);
        const r = 0.45 + ring * 0.32 + Math.sin(t * 2 + ring) * 0.08;
        dummy.current.position.set(
          Math.cos(a) * r,
          ring * 0.18 - 0.4,
          Math.sin(a) * r,
        );
        dummy.current.scale.setScalar(0.09 * intensity);
        dummy.current.updateMatrix();
        bullets.current.setMatrixAt(i, dummy.current.matrix);
        i += 1;
      }
    }
    bullets.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <group ref={ship} scale={intensity}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.22, 0.7, 3]} />
          <meshStandardMaterial
            color={palette.accent}
            emissive={palette.accent}
            emissiveIntensity={0.9}
          />
        </mesh>
      </group>
      <instancedMesh ref={bullets} args={[undefined, undefined, 112]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={palette.primary} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function CaptureArena({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const flag = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!flag.current) return;
    flag.current.position.y = 1.1 + Math.sin(clock.elapsedTime * 2) * 0.12;
    flag.current.rotation.y = clock.elapsedTime * 0.8;
  });
  return (
    <group scale={intensity}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 0.08, 48]} />
        <meshStandardMaterial
          color="#1a0c0a"
          emissive={palette.primary}
          emissiveIntensity={0.15}
        />
      </mesh>
      {[
        [-2.1, 0, -2.1],
        [2.1, 0, -2.1],
        [-2.1, 0, 2.1],
        [2.1, 0, 2.1],
      ].map((pos) => (
        <mesh key={pos.join(",")} position={pos as [number, number, number]}>
          <boxGeometry args={[0.45, 1.8, 0.45]} />
          <meshStandardMaterial
            color={palette.secondary}
            emissive={palette.accent}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
      <group ref={flag}>
        <mesh>
          <boxGeometry args={[0.08, 1.4, 0.08]} />
          <meshStandardMaterial color={palette.accent} />
        </mesh>
        <mesh position={[0.45, 0.45, 0]}>
          <boxGeometry args={[0.9, 0.45, 0.05]} />
          <meshStandardMaterial
            color={palette.primary}
            emissive={palette.primary}
            emissiveIntensity={0.8}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

function ChatCards({ intensity, palette }: Omit<ArtifactProps, "kind">) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const y = ((t * 0.45 + i * 0.37) % 4) - 1.6;
      child.position.y = y;
      child.rotation.y = Math.sin(t * 0.3 + i) * 0.4;
    });
  });
  const color = new Color(palette.primary);
  return (
    <group ref={ref} scale={intensity}>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[(i % 4) * 0.9 - 1.35, 0, Math.floor(i / 4) * 0.7 - 0.7]}
        >
          <planeGeometry args={[0.7, 0.28]} />
          <meshStandardMaterial
            color={color}
            emissive={palette.secondary}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function fibonacci(count: number, radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]);
  }
  return pts;
}
