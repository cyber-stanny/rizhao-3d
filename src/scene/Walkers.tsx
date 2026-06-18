import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildRoadPath, lerpAngle, sampleRoadPath, wrapDistance, type RoadPath } from "../utils/path";
import { createRandom } from "../utils/random";
import { getLandRoads } from "../utils/coast";

type Props = { isNight: boolean };

type Walker = {
  pathIdx: number;
  dir: 1 | -1;
  distance: number;
  speed: number;
  side: 1 | -1;
  offset: number;
  phase: number;
  yaw: number;
  height: number;
  color: THREE.Color;
};

const WALKER_COUNT = 56;

const ROAD_WIDTH: Record<string, number> = {
  motorway: 3.2,
  trunk: 2.6,
  primary: 2.0,
  secondary: 1.5,
  tertiary: 1.1,
};

const CLOTHES_COLORS = [
  "#3f6fa8",
  "#49646f",
  "#8f4e5d",
  "#5a7d54",
  "#b07d3c",
  "#6e5d9a",
  "#4e6f79",
  "#9b6455",
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
  sz: number,
  pitch = 0
) {
  dummy.position.set(x, y, z);
  dummy.rotation.set(pitch, yaw, 0, "YXZ");
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
  sz: number,
  pitch = 0
) {
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const x = baseX + offsetX * cos + offsetZ * sin;
  const z = baseZ - offsetX * sin + offsetZ * cos;
  placeMatrix(mesh, dummy, index, x, y, z, yaw, sx, sy, sz, pitch);
}

function hideInstances(mesh: THREE.InstancedMesh | null, dummy: THREE.Object3D, count: number) {
  if (!mesh) return;
  for (let i = 0; i < count; i += 1) {
    dummy.position.set(0, -100, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export default function Walkers({ isNight }: Props) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const armRef = useRef<THREE.InstancedMesh>(null);
  const legRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const paths = useMemo<RoadPath[]>(
    () =>
      getLandRoads(3, 0.4)
        .filter((road) => road.points.length >= 3)
        .map(buildRoadPath)
        .filter((path) => path.totalLength > 18),
    []
  );

  const walkers = useMemo<Walker[]>(() => {
    if (paths.length === 0) return [];
    const rng = createRandom(777);

    return Array.from({ length: WALKER_COUNT }, () => {
      const pathIdx = rng.int(0, paths.length - 1);
      const path = paths[pathIdx];
      const roadWidth = ROAD_WIDTH[path.road.type] ?? ROAD_WIDTH.tertiary;
      return {
        pathIdx,
        dir: rng.bool() ? 1 : -1,
        distance: rng.range(0, path.totalLength),
        speed: rng.range(0.75, 1.35),
        side: rng.bool() ? 1 : -1,
        offset: roadWidth * 0.5 + rng.range(0.75, 1.7),
        phase: rng.range(0, Math.PI * 2),
        yaw: 0,
        height: rng.range(0.9, 1.08),
        color: new THREE.Color(CLOTHES_COLORS[rng.int(0, CLOTHES_COLORS.length - 1)]),
      };
    });
  }, [paths]);

  useLayoutEffect(() => {
    hideInstances(bodyRef.current, dummy, walkers.length);
    hideInstances(headRef.current, dummy, walkers.length);
    hideInstances(armRef.current, dummy, walkers.length * 2);
    hideInstances(legRef.current, dummy, walkers.length * 2);

    const body = bodyRef.current;
    if (!body) return;
    walkers.forEach((walker, i) => body.setColorAt(i, walker.color));
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
  }, [walkers, dummy]);

  useFrame((state, delta) => {
    const body = bodyRef.current;
    const head = headRef.current;
    const arms = armRef.current;
    const legs = legRef.current;
    if (!body || !head || !arms || !legs) return;

    const time = state.clock.elapsedTime;

    walkers.forEach((walker, i) => {
      const path = paths[walker.pathIdx];
      if (!path) return;

      walker.distance = wrapDistance(walker.distance + walker.speed * walker.dir * delta, path.totalLength);
      const sample = sampleRoadPath(path, walker.distance);
      const normalX = -sample.tangentZ;
      const normalZ = sample.tangentX;
      const baseX = sample.x + normalX * walker.offset * walker.side;
      const baseZ = sample.z + normalZ * walker.offset * walker.side;
      const frontX = sample.tangentX * walker.dir;
      const frontZ = sample.tangentZ * walker.dir;
      const targetYaw = Math.atan2(frontX, frontZ);
      walker.yaw = lerpAngle(walker.yaw, targetYaw, 1 - Math.exp(-delta * 7));

      const step = time * walker.speed * 8 + walker.phase;
      const stride = Math.sin(step);
      const counterStride = Math.sin(step + Math.PI);
      const bob = Math.abs(Math.sin(step)) * 0.035;
      const scale = walker.height;
      const torsoY = 0.82 * scale + bob;
      const headY = 1.42 * scale + bob;
      const legY = 0.38 * scale + bob * 0.35;
      const armY = 0.92 * scale + bob;

      placeMatrix(body, dummy, i, baseX, torsoY, baseZ, walker.yaw, 0.65 * scale, 0.85 * scale, 0.5 * scale);
      placeMatrix(head, dummy, i, baseX, headY, baseZ, walker.yaw, 0.78 * scale, 0.78 * scale, 0.78 * scale);

      const armIndex = i * 2;
      placeLocalMatrix(
        arms,
        dummy,
        armIndex,
        baseX,
        baseZ,
        walker.yaw,
        -0.23 * scale,
        armY,
        counterStride * 0.11 * scale,
        0.75 * scale,
        0.9 * scale,
        0.75 * scale,
        counterStride * 0.35
      );
      placeLocalMatrix(
        arms,
        dummy,
        armIndex + 1,
        baseX,
        baseZ,
        walker.yaw,
        0.23 * scale,
        armY,
        stride * 0.11 * scale,
        0.75 * scale,
        0.9 * scale,
        0.75 * scale,
        stride * 0.35
      );

      const legIndex = i * 2;
      placeLocalMatrix(
        legs,
        dummy,
        legIndex,
        baseX,
        baseZ,
        walker.yaw,
        -0.12 * scale,
        legY,
        stride * 0.13 * scale,
        0.9 * scale,
        1,
        0.9 * scale,
        stride * 0.42
      );
      placeLocalMatrix(
        legs,
        dummy,
        legIndex + 1,
        baseX,
        baseZ,
        walker.yaw,
        0.12 * scale,
        legY,
        counterStride * 0.13 * scale,
        0.9 * scale,
        1,
        0.9 * scale,
        counterStride * 0.42
      );
    });

    body.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
    arms.instanceMatrix.needsUpdate = true;
    legs.instanceMatrix.needsUpdate = true;
  });

  const skinColor = isNight ? "#d7b792" : "#f0c49c";
  const limbColor = isNight ? "#2d3850" : "#394d69";

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined as never, undefined as never, walkers.length]} castShadow>
        <capsuleGeometry args={[0.18, 0.55, 5, 10]} />
        <meshStandardMaterial roughness={0.75} flatShading />
      </instancedMesh>

      <instancedMesh ref={headRef} args={[undefined as never, undefined as never, walkers.length]} castShadow>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} flatShading />
      </instancedMesh>

      <instancedMesh ref={armRef} args={[undefined as never, undefined as never, walkers.length * 2]} castShadow>
        <capsuleGeometry args={[0.045, 0.32, 4, 8]} />
        <meshStandardMaterial color={limbColor} roughness={0.85} flatShading />
      </instancedMesh>

      <instancedMesh ref={legRef} args={[undefined as never, undefined as never, walkers.length * 2]} castShadow>
        <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
        <meshStandardMaterial color="#1e2533" roughness={0.85} flatShading />
      </instancedMesh>
    </group>
  );
}
