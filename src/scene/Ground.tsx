import * as THREE from "three";
import { cityConfig } from "../data/cityConfig";
import { sceneBounds } from "../data/sceneData";

export default function Ground() {
  const { colors } = cityConfig;
  const b = sceneBounds;
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  const w = b.maxX - b.minX + 40;
  const d = b.maxZ - b.minZ + 40;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, -0.08, cz]}
        receiveShadow
      >
        <planeGeometry args={[w + 80, d + 80]} />
        <meshStandardMaterial color={colors.grass} roughness={0.95} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, -0.04, cz]}
        receiveShadow
      >
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#a8b0b8" roughness={0.92} />
      </mesh>
    </group>
  );
}
