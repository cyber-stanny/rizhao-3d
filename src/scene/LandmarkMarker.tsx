import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Spot } from "../data/spots";
import { useCityStore } from "../store/useCityStore";
import { routes } from "../data/routes";

type Props = {
  spot: Spot;
  height?: number;
};

export default function LandmarkMarker({ spot, height = 5 }: Props) {
  const selectedSpotId = useCityStore((s) => s.selectedSpotId);
  const hoveredSpotId = useCityStore((s) => s.hoveredSpotId);
  const selectedRouteId = useCityStore((s) => s.selectedRouteId);
  const selectSpot = useCityStore((s) => s.selectSpot);
  const setHoveredSpot = useCityStore((s) => s.setHoveredSpot);

  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedSpotId === spot.id;
  const isHovered = hovered || hoveredSpotId === spot.id;

  const inRoute = selectedRouteId
    ? routes.find((r) => r.id === selectedRouteId)?.spotIds.includes(spot.id)
    : false;

  const color = isSelected
    ? "#7fffd4"
    : inRoute
    ? "#ffb347"
    : "#3da8f0";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.18;
      const base = isSelected ? 1.4 : isHovered ? 1.2 : 1;
      ringRef.current.scale.setScalar(base * pulse);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.4 + Math.sin(t * 2.5) * 0.2;
    }
    if (coreRef.current) {
      const base = isSelected ? 1.5 : isHovered ? 1.25 : 1;
      coreRef.current.scale.setScalar(base + Math.sin(t * 3) * 0.05);
    }
  });

  const posY = height + (spot.modelType === "lighthouse" ? 4.5 : 0);

  return (
    <group position={[spot.position[0], posY, spot.position[2]]}>
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          selectSpot(spot.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredSpot(spot.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredSpot(null);
          document.body.style.cursor = "auto";
        }}
        visible={false}
      >
        <sphereGeometry args={[1.6, 8, 8]} />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 2.5 : inRoute ? 2 : 1.4}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <pointLight color={color} distance={6} intensity={isSelected ? 3 : 1.5} />

      <Html
        center
        distanceFactor={14}
        position={[0, 1.2, 0]}
        zIndexRange={[20, 0]}
        occlude={false}
      >
        <div
          className={`landmark-label px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            isSelected
              ? "bg-sea-300/90 text-sea-900 scale-110"
              : isHovered
              ? "bg-sea-700/85 text-white scale-105"
              : "bg-sea-900/70 text-sea-100"
          }`}
          style={{
            border: `1px solid ${color}80`,
            boxShadow: `0 0 10px ${color}55`,
            whiteSpace: "nowrap",
          }}
        >
          {spot.name}
        </div>
      </Html>
    </group>
  );
}
