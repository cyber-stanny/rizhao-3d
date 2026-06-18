import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createRandom } from "../utils/random";
import { cityConfig } from "../data/cityConfig";

type TreePos = { x: number; z: number; s: number };

type Props = {
  count: number;
  area: { minX: number; maxX: number; minZ: number; maxZ: number };
  seed?: number;
  avoid?: { x: number; z: number; r: number }[];
};

export default function TreeField({ count, area, seed = 1, avoid = [] }: Props) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { colors } = cityConfig;

  const trees = useMemo<TreePos[]>(() => {
    const rng = createRandom(seed);
    const list: TreePos[] = [];
    let attempts = 0;
    while (list.length < count && attempts < count * 6) {
      attempts++;
      const x = rng.range(area.minX, area.maxX);
      const z = rng.range(area.minZ, area.maxZ);
      if (avoid.some((a) => Math.hypot(x - a.x, z - a.z) < a.r)) continue;
      list.push({ x, z, s: rng.range(0.7, 1.4) });
    }
    return list;
  }, [count, area, seed, avoid]);

  useLayoutEffect(() => {
    const trunk = trunkRef.current;
    const crown = crownRef.current;
    if (!trunk || !crown) return;
    trees.forEach((t, i) => {
      dummy.position.set(t.x, 0.6 * t.s, t.z);
      dummy.scale.set(0.18 * t.s, 1.2 * t.s, 0.18 * t.s);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, 1.6 * t.s, t.z);
      dummy.scale.set(0.9 * t.s, 1.1 * t.s, 0.9 * t.s);
      dummy.updateMatrix();
      crown.setMatrixAt(i, dummy.matrix);
    });
    trunk.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;
  }, [trees, dummy]);

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined as never, undefined as never, trees.length]}
        castShadow
      >
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color={colors.treeTrunk} roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={crownRef}
        args={[undefined as never, undefined as never, trees.length]}
        castShadow
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={colors.treeCrown} roughness={1} flatShading />
      </instancedMesh>
    </group>
  );
}
