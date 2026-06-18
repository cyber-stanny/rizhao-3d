import * as THREE from "three";
import sceneDataJson from "./scene-data.json";

export type ScenePoint = { x: number; z: number };

export type SceneBuilding = {
  points: ScenePoint[];
  cx: number;
  cz: number;
  area: number;
  height: number;
  type: string;
  name: string;
};

export type SceneRoad = {
  type: string;
  name: string;
  points: ScenePoint[];
};

export type SceneData = {
  origin: { lon: number; lat: number };
  scale: number;
  coastline: ScenePoint[][];
  roads: SceneRoad[];
  buildings: SceneBuilding[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
};

export const sceneData = sceneDataJson as unknown as SceneData;

export const sceneBounds = sceneData.bounds;

export function coastlineToWorld(seg: ScenePoint[], y = 0.02): THREE.Vector3[] {
  return seg.map((p) => new THREE.Vector3(p.x, y, p.z));
}
