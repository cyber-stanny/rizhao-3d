import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildRoadPath, lerpAngle, sampleRoadPath, wrapDistance, type RoadPath } from "../utils/path";
import { createRandom } from "../utils/random";
import { getLandRoads } from "../utils/coast";

type Props = { isNight: boolean };

type Car = {
  pathIdx: number;
  dir: 1 | -1;
  distance: number;
  baseSpeed: number;
  laneOffset: number;
  color: THREE.Color;
  yaw: number;
  phase: number;
  length: number;
  width: number;
  height: number;
};

const CAR_COUNT = 42;

const ROAD_WIDTH: Record<string, number> = {
  motorway: 3.2,
  trunk: 2.6,
  primary: 2.0,
  secondary: 1.5,
  tertiary: 1.1,
};

const ROAD_SPEED: Record<string, number> = {
  motorway: 10,
  trunk: 8.5,
  primary: 7.2,
  secondary: 5.2,
  tertiary: 3.8,
};

const CAR_COLORS = [
  "#d84a3a",
  "#2f80ed",
  "#27ae60",
  "#f2c94c",
  "#e67e22",
  "#dfe7ee",
  "#38475a",
  "#18a999",
  "#8f5bd7",
  "#c0392b",
];

function placeMatrix(
  mesh: THREE.InstancedMesh,
  dummy: THREE.Object3D,
  index: number,
  x: number,
  y: number,
  z: number,
  yaw: number,
  sx: number,
  sy: number,
  sz: number
) {
  dummy.position.set(x, y, z);
  dummy.rotation.set(0, yaw, 0);
  dummy.scale.set(sx, sy, sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function placeLocalMatrix(
  mesh: THREE.InstancedMesh,
  dummy: THREE.Object3D,
  index: number,
  baseX: number,
  baseZ: number,
  yaw: number,
  offsetX: number,
  y: number,
  offsetZ: number,
  sx: number,
  sy: number,
  sz: number
) {
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const x = baseX + offsetX * cos + offsetZ * sin;
  const z = baseZ - offsetX * sin + offsetZ * cos;
  placeMatrix(mesh, dummy, index, x, y, z, yaw, sx, sy, sz);
}

function hideInstances(mesh: THREE.InstancedMesh | null, dummy: THREE.Object3D, count: number) {
  if (!mesh) return;
  for (let i = 0; i < count; i += 1) {
    dummy.position.set(0, -100, 0);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export default function Vehicles({ isNight }: Props) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const cabinRef = useRef<THREE.InstancedMesh>(null);
  const wheelRef = useRef<THREE.InstancedMesh>(null);
  const headlightRef = useRef<THREE.InstancedMesh>(null);
  const taillightRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const wheelGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }, []);

  const paths = useMemo<RoadPath[]>(
    () =>
      getLandRoads(3, 0.4)
        .filter((road) => road.points.length >= 3 && road.type !== "tertiary")
        .map(buildRoadPath)
        .filter((path) => path.totalLength > 24),
    []
  );

  const cars = useMemo<Car[]>(() => {
    if (paths.length === 0) return [];
    const rng = createRandom(999);

    return Array.from({ length: CAR_COUNT }, () => {
      const pathIdx = rng.int(0, paths.length - 1);
      const path = paths[pathIdx];
      const width = ROAD_WIDTH[path.road.type] ?? ROAD_WIDTH.secondary;
      const laneBase = Math.max(0.42, width * 0.26);
      const dir = rng.bool() ? 1 : -1;
      const speedBase = ROAD_SPEED[path.road.type] ?? ROAD_SPEED.secondary;
      const length = rng.range(1.65, 2.15);
      const carWidth = rng.range(0.78, 0.98);

      return {
        pathIdx,
        dir,
        distance: rng.range(0, path.totalLength),
        baseSpeed: speedBase * rng.range(0.82, 1.18),
        laneOffset: laneBase + rng.range(-0.08, 0.12),
        color: new THREE.Color(CAR_COLORS[rng.int(0, CAR_COLORS.length - 1)]),
        yaw: 0,
        phase: rng.range(0, Math.PI * 2),
        length,
        width: carWidth,
        height: rng.range(0.38, 0.46),
      };
    });
  }, [paths]);

  useLayoutEffect(() => {
    hideInstances(bodyRef.current, dummy, cars.length);
    hideInstances(cabinRef.current, dummy, cars.length);
    hideInstances(wheelRef.current, dummy, cars.length * 4);
    hideInstances(headlightRef.current, dummy, cars.length * 2);
    hideInstances(taillightRef.current, dummy, cars.length * 2);

    const body = bodyRef.current;
    if (!body) return;
    cars.forEach((car, i) => body.setColorAt(i, car.color));
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
  }, [cars, dummy]);

  useFrame((state, delta) => {
    const body = bodyRef.current;
    const cabin = cabinRef.current;
    const wheels = wheelRef.current;
    const headlights = headlightRef.current;
    const taillights = taillightRef.current;
    if (!body || !cabin || !wheels || !headlights || !taillights) return;

    cars.forEach((car, i) => {
      const path = paths[car.pathIdx];
      if (!path) return;

      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.45 + car.phase) * 0.08;
      car.distance = wrapDistance(car.distance + car.baseSpeed * pulse * car.dir * delta, path.totalLength);

      const sample = sampleRoadPath(path, car.distance);
      const normalX = -sample.tangentZ;
      const normalZ = sample.tangentX;
      const laneSide = car.dir === 1 ? -1 : 1;
      const baseX = sample.x + normalX * car.laneOffset * laneSide;
      const baseZ = sample.z + normalZ * car.laneOffset * laneSide;
      const frontX = sample.tangentX * car.dir;
      const frontZ = sample.tangentZ * car.dir;
      const targetYaw = Math.atan2(frontX, frontZ);
      car.yaw = lerpAngle(car.yaw, targetYaw, 1 - Math.exp(-delta * 8));

      const bodyY = 0.4;
      placeMatrix(body, dummy, i, baseX, bodyY, baseZ, car.yaw, car.width, car.height, car.length);
      placeLocalMatrix(
        cabin,
        dummy,
        i,
        baseX,
        baseZ,
        car.yaw,
        0,
        bodyY + car.height * 0.7,
        -car.length * 0.06,
        car.width * 0.7,
        car.height * 0.74,
        car.length * 0.42
      );

      const wheelX = car.width * 0.52;
      const wheelZ = car.length * 0.33;
      const wheelY = 0.25;
      const wheelIndex = i * 4;
      placeLocalMatrix(wheels, dummy, wheelIndex, baseX, baseZ, car.yaw, -wheelX, wheelY, -wheelZ, 1, 1, 1);
      placeLocalMatrix(wheels, dummy, wheelIndex + 1, baseX, baseZ, car.yaw, wheelX, wheelY, -wheelZ, 1, 1, 1);
      placeLocalMatrix(wheels, dummy, wheelIndex + 2, baseX, baseZ, car.yaw, -wheelX, wheelY, wheelZ, 1, 1, 1);
      placeLocalMatrix(wheels, dummy, wheelIndex + 3, baseX, baseZ, car.yaw, wheelX, wheelY, wheelZ, 1, 1, 1);

      const lightX = car.width * 0.28;
      const frontZOffset = car.length * 0.52;
      const backZOffset = -car.length * 0.52;
      const lightY = bodyY + car.height * 0.12;
      const lightIndex = i * 2;
      placeLocalMatrix(
        headlights,
        dummy,
        lightIndex,
        baseX,
        baseZ,
        car.yaw,
        -lightX,
        lightY,
        frontZOffset,
        1,
        0.55,
        0.7
      );
      placeLocalMatrix(
        headlights,
        dummy,
        lightIndex + 1,
        baseX,
        baseZ,
        car.yaw,
        lightX,
        lightY,
        frontZOffset,
        1,
        0.55,
        0.7
      );
      placeLocalMatrix(
        taillights,
        dummy,
        lightIndex,
        baseX,
        baseZ,
        car.yaw,
        -lightX,
        lightY,
        backZOffset,
        0.85,
        0.45,
        0.55
      );
      placeLocalMatrix(
        taillights,
        dummy,
        lightIndex + 1,
        baseX,
        baseZ,
        car.yaw,
        lightX,
        lightY,
        backZOffset,
        0.85,
        0.45,
        0.55
      );
    });

    body.instanceMatrix.needsUpdate = true;
    cabin.instanceMatrix.needsUpdate = true;
    wheels.instanceMatrix.needsUpdate = true;
    headlights.instanceMatrix.needsUpdate = true;
    taillights.instanceMatrix.needsUpdate = true;
  });

  const headlightGlow = isNight ? 4.5 : 0.6;
  const taillightGlow = isNight ? 3.2 : 0.5;

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined as never, undefined as never, cars.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.45} metalness={0.25} />
      </instancedMesh>

      <instancedMesh ref={cabinRef} args={[undefined as never, undefined as never, cars.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#182436" roughness={0.25} metalness={0.15} transparent opacity={0.86} />
      </instancedMesh>

      <instancedMesh
        ref={wheelRef}
        args={[wheelGeometry, undefined as never, cars.length * 4]}
        castShadow
      >
        <meshStandardMaterial color="#10151b" roughness={0.7} metalness={0.2} />
      </instancedMesh>

      <instancedMesh ref={headlightRef} args={[undefined as never, undefined as never, cars.length * 2]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial
          color="#fff6d0"
          emissive="#fff0b0"
          emissiveIntensity={headlightGlow}
          toneMapped={false}
        />
      </instancedMesh>

      <instancedMesh ref={taillightRef} args={[undefined as never, undefined as never, cars.length * 2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#ff4438"
          emissive="#ff2b24"
          emissiveIntensity={taillightGlow}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
