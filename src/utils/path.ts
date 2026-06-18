import type { ScenePoint, SceneRoad } from "../data/sceneData";

export type RoadPath = {
  road: SceneRoad;
  points: ScenePoint[];
  distances: number[];
  totalLength: number;
};

export type PathSample = {
  x: number;
  z: number;
  tangentX: number;
  tangentZ: number;
};

export function buildRoadPath(road: SceneRoad): RoadPath {
  const distances = [0];
  let totalLength = 0;

  for (let i = 1; i < road.points.length; i += 1) {
    const a = road.points[i - 1];
    const b = road.points[i];
    totalLength += Math.hypot(b.x - a.x, b.z - a.z);
    distances.push(totalLength);
  }

  return {
    road,
    points: road.points,
    distances,
    totalLength,
  };
}

export function wrapDistance(distance: number, totalLength: number): number {
  if (totalLength <= 0) return 0;
  return ((distance % totalLength) + totalLength) % totalLength;
}

export function sampleRoadPath(path: RoadPath, distance: number): PathSample {
  const d = wrapDistance(distance, path.totalLength);

  for (let i = 1; i < path.distances.length; i += 1) {
    if (d > path.distances[i]) continue;

    const a = path.points[i - 1];
    const b = path.points[i];
    const segmentLength = Math.max(path.distances[i] - path.distances[i - 1], 0.0001);
    const t = (d - path.distances[i - 1]) / segmentLength;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;

    return {
      x: a.x + dx * t,
      z: a.z + dz * t,
      tangentX: dx / len,
      tangentZ: dz / len,
    };
  }

  const last = path.points[path.points.length - 1] ?? { x: 0, z: 0 };
  const prev = path.points[path.points.length - 2] ?? last;
  const dx = last.x - prev.x;
  const dz = last.z - prev.z;
  const len = Math.hypot(dx, dz) || 1;

  return {
    x: last.x,
    z: last.z,
    tangentX: dx / len,
    tangentZ: dz / len,
  };
}

export function lerpAngle(current: number, target: number, amount: number): number {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * amount;
}
