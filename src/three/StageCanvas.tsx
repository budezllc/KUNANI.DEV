import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { VolumeScene } from "./VolumeScene";

type Props = {
  progress: number;
};

export function StageCanvas({ progress }: Props) {
  return (
    <div className="stage-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.55]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{ background: "#010208" }}
        camera={{ position: [0, 2.4, 10], fov: 40, near: 0.1, far: 60 }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.85;
        }}
      >
        <VolumeScene progress={progress} />
      </Canvas>
    </div>
  );
}
