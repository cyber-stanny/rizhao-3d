import { sceneData, type ScenePoint, type SceneRoad } from "../data/sceneData";

type CoastBoundary = {
  minZ: number;
  maxZ: number;
  minXByZ: Map<number, number>;
};

let cachedBoundary: CoastBoundary | null = null;

export function getCoastBoundary(): CoastBoundary {
  if (cachedBoundary) return cachedBoundary;

  const points = sceneData.coastline.flat();
  const minZ = Math.floor(Math.min(...points.map((p) => p.z)));
  const maxZ = Math.ceil(Math.max(...points.map((p) => p.z)));
  const minXByZ = new Map<number, number>();

  const record = (zKey: number, x: number) => {
    const prev = minXByZ.get(zKey);
    if (prev === undefined || x < prev) minXByZ.set(zKey, x);
  };

  sceneData.coastline.forEach((seg) => {
    for (let i = 1; i < seg.length; i += 1) {
      const a = seg[i - 1];
      const b = seg[i];
      record(Math.round(a.z), a.x);
      record(Math.round(b.z), b.x);

      const z0 = Math.ceil(Math.min(a.z, b.z));
      const z1 = Math.floor(Math.max(a.z, b.z));
      for (let z = z0; z <= z1; z += 1) {
        const dz = b.z - a.z;
        const t = Math.abs(dz) < 0.0001 ? 0 : (z - a.z) / dz;
        if (t < 0 || t > 1) continue;
        record(z, a.x + (b.x - a.x) * t);
      }
    }
  });

  cachedBoundary = { minZ, maxZ, minXByZ };
  return cachedBoundary;
}

export function getCoastXAtZ(z: number): number {
  const boundary = getCoastBoundary();
  const zKey = Math.round(z);
  const direct = boundary.minXByZ.get(zKey);
  if (direct !== undefined) return direct;

  let nearestX = 70;
  let bestDistance = Infinity;
  boundary.minXByZ.forEach((x, sampleZ) => {
    const distance = Math.abs(sampleZ - zKey);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearestX = x;
    }
  });

  return nearestX;
}

export function isOnLand(x: number, z: number, margin = 1.5): boolean {
  return x < getCoastXAtZ(z) - margin;
}

function isSegmentOnLand(a: ScenePoint, b: ScenePoint, margin: number): boolean {
  const midX = (a.x + b.x) / 2;
  const midZ = (a.z + b.z) / 2;
  return isOnLand(midX, midZ, margin);
}

export function splitRoadOnLand(road: SceneRoad, margin = 0.8): SceneRoad[] {
  const chunks: SceneRoad[] = [];
  let current: ScenePoint[] = [];

  const pushCurrent = () => {
    if (current.length >= 2) {
      chunks.push({
        ...road,
        points: current,
      });
    }
    current = [];
  };

  for (let i = 1; i < road.points.length; i += 1) {
    const a = road.points[i - 1];
    const b = road.points[i];
    if (isSegmentOnLand(a, b, margin)) {
      if (current.length === 0) current.push(a);
      current.push(b);
    } else {
      pushCurrent();
    }
  }

  pushCurrent();
  return chunks;
}

export function getLandRoads(minPoints = 2, margin = 0.8): SceneRoad[] {
  return sceneData.roads
    .flatMap((road) => splitRoadOnLand(road, margin))
    .filter((road) => road.points.length >= minPoints);
}
