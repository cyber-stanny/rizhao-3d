import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getLandRoads } from "../utils/coast";

type Props = { isNight: boolean };

type Pole = { x: number; z: number; rotY: number };

function collectPoles(): Pole[] {
  const poles: Pole[] = [];
  const spacing = 12;
  const offset = 2.5;

  getLandRoads(2, 0.4).forEach((r) => {
    if (r.type !== "primary" && r.type !== "trunk" && r.type !== "secondary") return;
    let acc = 0;
    for (let i = 1; i < r.points.length; i++) {
      const p0 = r.points[i - 1];
      const p1 = r.points[i];
      const dx = p1.x - p0.x;
      const dz = p1.z - p0.z;
      const segLen = Math.hypot(dx, dz);
      const ux = dx / segLen;
      const uz = dz / segLen;
      const nx = -uz;
      const nz = ux;

      while (acc < spacing) {
        const t = acc / segLen;
        if (t > 1) break;
        const cx = p0.x + dx * t;
        const cz = p0.z + dz * t;
        const rotY = Math.atan2(ux, uz);
        poles.push({ x: cx + nx * offset, z: cz + nz * offset, rotY });
        poles.push({ x: cx - nx * offset, z: cz - nz * offset, rotY: rotY + Math.PI });
        acc += spacing;
      }
      acc -= segLen;
    }
  });

  return poles.slice(0, 300);
}

export default function StreetLights({ isNight }: Props) {
  const poles = useMemo(collectPoles, []);
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const armRef = useRef<THREE.InstancedMesh>(null);
  const bulbRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const pole = poleRef.current;
    const arm = armRef.current;
    const bulb = bulbRef.current;
    if (!pole || !arm || !bulb) return;

    poles.forEach((p, i) => {
      dummy.position.set(p.x, 2.5, p.z);
      dummy.scale.set(1, 5, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pole.setMatrixAt(i, dummy.matrix);

      dummy.position.set(p.x, 4.8, p.z);
      dummy.scale.set(1, 0.8, 1);
      dummy.rotation.set(0, p.rotY, 0);
      dummy.updateMatrix();
      arm.setMatrixAt(i, dummy.matrix);

      dummy.position.set(p.x, 5.2, p.z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      bulb.setMatrixAt(i, dummy.matrix);
    });
    [pole, arm, bulb].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }, [poles, dummy]);

  const bulbColor = isNight ? "#ffd980" : "#ffeec0";
  const bulbEmissive = isNight ? 3 : 0.3;

  return (
    <group>
      <instancedMesh
        ref={poleRef}
        args={[undefined as never, undefined as never, poles.length]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.1, 1, 6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} metalness={0.4} />
      </instancedMesh>

      <instancedMesh
        ref={armRef}
        args={[undefined as never, undefined as never, poles.length]}
      >
        <boxGeometry args={[0.06, 0.06, 1]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} metalness={0.4} />
      </instancedMesh>

      <instancedMesh
        ref={bulbRef}
        args={[undefined as never, undefined as never, poles.length]}
      >
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial
          color={bulbColor}
          emissive={bulbColor}
          emissiveIntensity={bulbEmissive}
          toneMapped={false}
        />
      </instancedMesh>

      {isNight && (
        <group>
          {poles.filter((_, i) => i % 5 === 0).map((p, i) => (
            <pointLight
              key={i}
              position={[p.x, 5, p.z]}
              color="#ffd980"
              distance={12}
              intensity={0.8}
            />
          ))}
        </group>
      )}
    </group>
  );
}
