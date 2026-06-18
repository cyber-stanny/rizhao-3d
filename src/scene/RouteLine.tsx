import { useMemo } from "react";
import * as THREE from "three";
import { useCityStore } from "../store/useCityStore";
import { routes } from "../data/routes";
import { getSpotById } from "../data/spots";

export default function RouteLine() {
  const selectedRouteId = useCityStore((s) => s.selectedRouteId);
  const isTourPlaying = useCityStore((s) => s.isTourPlaying);

  const route = selectedRouteId ? routes.find((r) => r.id === selectedRouteId) : null;

  const tubeGeo = useMemo(() => {
    if (!route) return null;
    const points = route.spotIds
      .map((id) => getSpotById(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => new THREE.Vector3(s.position[0], 4.5, s.position[2]));
    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.3);
    return new THREE.TubeGeometry(curve, points.length * 24, 0.12, 8, false);
  }, [route]);

  if (!route || !tubeGeo) return null;

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial
          color={isTourPlaying ? "#ffb347" : "#7fffd4"}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={tubeGeo} scale={1.6}>
        <meshBasicMaterial
          color={isTourPlaying ? "#ffb347" : "#7fffd4"}
          transparent
          opacity={0.18}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
