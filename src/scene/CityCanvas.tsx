import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import CityScene from "./CityScene";

export default function CityCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{
        fov: 50,
        near: 0.1,
        far: 3000,
        position: [180, 135, 180],
      }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#cfeaff");
      }}
    >
      <Suspense fallback={null}>
        <CityScene />
      </Suspense>
    </Canvas>
  );
}
