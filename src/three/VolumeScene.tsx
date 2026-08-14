import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  type Group,
  type InstancedMesh,
  type MeshStandardMaterial,
  Object3D,
  type PointLight,
} from "three";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { scrollWorlds } from "../lib/catalog";
import { blendIndex, lerp } from "../lib/math";
import { LED_FRAG, LED_VERT, FLOOR_FRAG, FLOOR_VERT } from "./shaders";
import { Artifact } from "./artifacts";
import { lerpPalette } from "../lib/color";
import { LED_RING, SPACE } from "./stageConfig";

type Props = {
  progress: number;
};

export function VolumeScene({ progress }: Props) {
  const worlds = useMemo(() => scrollWorlds(), []);
  const blend = blendIndex(progress, worlds.length);
  const palette = lerpPalette(
    worlds[blend.index].palette,
    worlds[blend.next].palette,
    blend.mix,
  );
  const kindA = worlds[blend.index].kind;
  const kindB = worlds[blend.next].kind;

  return (
    <>
      <color attach="background" args={["#010208"]} />
      <ambientLight intensity={0.22} />
      <Lights palette={palette} />
      <CameraRig progress={progress} />
      <Starfield />
      <LedRing palette={palette} />
      <FloorDisc palette={palette} />
      <PlanetCubes palette={palette} />
      <Artifact kind={kindA} intensity={1 - blend.mix} palette={palette} />
      {kindA !== kindB ? (
        <Artifact kind={kindB} intensity={blend.mix} palette={palette} />
      ) : null}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.55}
          intensity={0.55}
          mipmapBlur
          luminanceSmoothing={0.25}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </>
  );
}

function Lights({ palette }: { palette: ReturnType<typeof lerpPalette> }) {
  const a = useRef<PointLight>(null);
  const b = useRef<PointLight>(null);
  const colorA = useMemo(() => new Color(palette.primary), [palette.primary]);
  const colorB = useMemo(() => new Color(palette.secondary), [palette.secondary]);
  useFrame(() => {
    a.current?.color.copy(colorA);
    b.current?.color.copy(colorB);
  });
  return (
    <>
      <pointLight ref={a} position={[5, 7, 4]} intensity={4} distance={32} />
      <pointLight ref={b} position={[-6, 3, -4]} intensity={2.4} distance={28} />
      <spotLight
        position={[0, 14, 2]}
        angle={0.38}
        penumbra={0.9}
        intensity={5}
        color={palette.accent}
      />
    </>
  );
}

function CameraRig({ progress }: { progress: number }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame((state) => {
    const t = progress;
    const radius = lerp(9.4, 7.6, t);
    const angle = t * Math.PI * 1.25 + state.clock.elapsedTime * 0.045;
    const y = 2.15 + Math.sin(t * Math.PI) * 1.25;
    camera.position.x = Math.sin(angle) * radius + mouse.current.x * 0.55;
    camera.position.z = Math.cos(angle) * radius + mouse.current.y * 0.25;
    camera.position.y = y;
    camera.lookAt(0, 0.45, 0);
  });
  return null;
}

function LedRing({ palette }: { palette: ReturnType<typeof lerpPalette> }) {
  const group = useRef<Group>(null);
  const colorA = useMemo(() => new Color(palette.primary), [palette.primary]);
  const colorB = useMemo(() => new Color(palette.secondary), [palette.secondary]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new Color() },
      uColorB: { value: new Color() },
    }),
    [],
  );
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uColorA.value.copy(colorA);
    uniforms.uColorB.value.copy(colorB);
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.04;
  });
  const panels = Array.from({ length: LED_RING.count }, (_, i) => {
    const a = (i / LED_RING.count) * Math.PI * 2 + LED_RING.angleOffset;
    return {
      key: i,
      position: [
        Math.sin(a) * LED_RING.radius,
        1.15,
        Math.cos(a) * LED_RING.radius,
      ] as [number, number, number],
      rotation: [0, a, 0] as [number, number, number],
    };
  });
  return (
    <group ref={group}>
      {panels.map((panel) => (
        <mesh key={panel.key} position={panel.position} rotation={panel.rotation}>
          <planeGeometry args={[LED_RING.width, LED_RING.height]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            uniforms={uniforms}
            vertexShader={LED_VERT}
            fragmentShader={LED_FRAG}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloorDisc({ palette }: { palette: ReturnType<typeof lerpPalette> }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color() },
    }),
    [],
  );
  const accent = useMemo(() => new Color(palette.accent), [palette.accent]);
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uColor.value.copy(accent);
  });
  return (
    <group position={[0, -1.35, 0]}>
      <mesh>
        <sphereGeometry args={[SPACE.holeRadius, 32, 24]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[SPACE.discRadius, 96]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={FLOOR_VERT}
          fragmentShader={FLOOR_FRAG}
        />
      </mesh>
    </group>
  );
}

function Starfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(SPACE.starCount * 3);
    for (let i = 0; i < SPACE.starCount; i += 1) {
      const radius = 22 + Math.random() * 48;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8e0cc"
        size={0.09}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        fog={false}
      />
    </points>
  );
}

function PlanetCubes({ palette }: { palette: ReturnType<typeof lerpPalette> }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: SPACE.planetCount }, () => ({
        radius: 3.2 + Math.random() * 5.4,
        speed: 0.07 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        incl: (Math.random() - 0.5) * 0.85,
        size: 0.14 + Math.random() * 0.28,
        spin: 0.35 + Math.random() * 1.1,
      })),
    [],
  );
  const color = useMemo(() => new Color(palette.secondary), [palette.secondary]);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    seeds.forEach((seed, i) => {
      const a = seed.phase + t * seed.speed;
      const x = Math.cos(a) * seed.radius;
      const z = Math.sin(a) * seed.radius;
      dummy.position.set(x, -z * Math.sin(seed.incl) * 0.65, z * Math.cos(seed.incl));
      dummy.rotation.set(t * seed.spin, a, t * seed.spin * 0.35);
      dummy.scale.setScalar(seed.size);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    const mat = mesh.current.material;
    if (!Array.isArray(mat)) {
      (mat as MeshStandardMaterial).color.copy(color);
    }
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, seeds.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={palette.secondary}
        emissive={palette.secondary}
        emissiveIntensity={0.28}
        metalness={0.35}
        roughness={0.4}
      />
    </instancedMesh>
  );
}
