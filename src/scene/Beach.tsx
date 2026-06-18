import { useMemo } from "react";
import * as THREE from "three";
import { cityConfig } from "../data/cityConfig";
import { sceneData } from "../data/sceneData";

export default function Beach() {
  const { beachWidth, colors } = cityConfig;
  const beachColor = colors.beach;

  const geometries = useMemo(() => {
    const strips: THREE.BufferGeometry[] = [];
    sceneData.coastline.forEach((seg) => {
      if (seg.length < 2) return;

      const positions: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i < seg.length; i++) {
        const p = seg[i];
        let dx: number, dz: number;
        if (i === 0) {
          dx = seg[1].x - p.x; dz = seg[1].z - p.z;
        } else if (i === seg.length - 1) {
          dx = p.x - seg[i - 1].x; dz = p.z - seg[i - 1].z;
        } else {
          dx = seg[i + 1].x - seg[i - 1].x; dz = seg[i + 1].z - seg[i - 1].z;
        }
        const len = Math.hypot(dx, dz) || 1;
        const nx = -dz / len, nz = dx / len;
        const hw = beachWidth / 2;

        const landX = p.x + nx * (hw * 0.3);
        const landZ = p.z + nz * (hw * 0.3);
        const seaX = p.x + nx * hw;
        const seaZ = p.z + nz * hw;

        positions.push(landX, 0.05, landZ);
        positions.push(seaX, 0.05, seaZ);

        if (i > 0) {
          const vi = (i - 1) * 2;
          indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      strips.push(geo);
    });
    return strips;
  }, [beachWidth]);

  return (
    <group>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} receiveShadow>
          <meshStandardMaterial
            color={beachColor}
            roughness={1}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
