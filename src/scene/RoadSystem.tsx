import { useMemo } from "react";
import * as THREE from "three";
import type { SceneRoad } from "../data/sceneData";
import { getLandRoads } from "../utils/coast";

const TYPE_WIDTH: Record<string, number> = {
  motorway: 7.2,
  trunk: 6.2,
  primary: 5.2,
  secondary: 3.7,
  tertiary: 2.4,
};

const TYPE_COLOR: Record<string, string> = {
  motorway: "#171d24",
  trunk: "#1d232b",
  primary: "#242b34",
  secondary: "#303640",
  tertiary: "#3c424b",
};

const MAIN_TYPES = new Set(["motorway", "trunk", "primary"]);

type RoadLayer = {
  geometry: THREE.BufferGeometry;
  color: string;
  roughness?: number;
};

function makeRoadMaterial(color: string) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.9}
      metalness={0.03}
      side={THREE.DoubleSide}
      polygonOffset
      polygonOffsetFactor={-2}
      polygonOffsetUnits={-2}
      onBeforeCompile={(shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          `
          #include <common>
          float roadHash(vec2 p) {
            return fract(sin(dot(p, vec2(41.3, 289.1))) * 143758.5453);
          }
          `
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <color_fragment>",
          `
          #include <color_fragment>
          float grain = roadHash(vViewPosition.xz * 28.0);
          diffuseColor.rgb *= 0.92 + grain * 0.12;
          `
        );
      }}
    />
  );
}

function appendQuad(
  positions: number[],
  indices: number[],
  ax: number,
  az: number,
  bx: number,
  bz: number,
  width: number,
  y: number
) {
  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz);
  if (len < 0.001) return;

  const nx = -dz / len;
  const nz = dx / len;
  const half = width / 2;
  const base = positions.length / 3;

  positions.push(
    ax + nx * half, y, az + nz * half,
    ax - nx * half, y, az - nz * half,
    bx + nx * half, y, bz + nz * half,
    bx - nx * half, y, bz - nz * half
  );
  indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
}

function buildStripGeometry(
  roads: SceneRoad[],
  widthForType: (type: string) => number,
  y: number
) {
  const positions: number[] = [];
  const indices: number[] = [];

  roads.forEach((road) => {
    for (let i = 1; i < road.points.length; i += 1) {
      const a = road.points[i - 1];
      const b = road.points[i];
      appendQuad(positions, indices, a.x, a.z, b.x, b.z, widthForType(road.type), y);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function appendOffsetQuad(
  positions: number[],
  indices: number[],
  ax: number,
  az: number,
  bx: number,
  bz: number,
  offset: number,
  width: number,
  y: number
) {
  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz);
  if (len < 0.001) return;

  const nx = -dz / len;
  const nz = dx / len;
  appendQuad(
    positions,
    indices,
    ax + nx * offset,
    az + nz * offset,
    bx + nx * offset,
    bz + nz * offset,
    width,
    y
  );
}

function buildEdgeGeometry(roads: SceneRoad[]) {
  const positions: number[] = [];
  const indices: number[] = [];

  roads.forEach((road) => {
    const roadWidth = TYPE_WIDTH[road.type] ?? TYPE_WIDTH.tertiary;
    const edgeOffset = roadWidth / 2 - 0.16;

    for (let i = 1; i < road.points.length; i += 1) {
      const a = road.points[i - 1];
      const b = road.points[i];
      appendOffsetQuad(positions, indices, a.x, a.z, b.x, b.z, edgeOffset, 0.06, 0.084);
      appendOffsetQuad(positions, indices, a.x, a.z, b.x, b.z, -edgeOffset, 0.06, 0.084);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildCenterDashGeometry(roads: SceneRoad[]) {
  const positions: number[] = [];
  const indices: number[] = [];
  const seen = new Set<string>();
  const accepted: { x: number; z: number; angle: number }[] = [];

  const isDuplicateCorridor = (x: number, z: number, angle: number) =>
    accepted.some((item) => {
      const rawAngleDelta = Math.abs(angle - item.angle);
      const angleDelta = Math.min(rawAngleDelta, Math.PI - rawAngleDelta);
      return Math.hypot(x - item.x, z - item.z) < 1.4 && angleDelta < 0.18;
    });

  roads.forEach((road) => {
    if (!MAIN_TYPES.has(road.type)) return;

    for (let i = 1; i < road.points.length; i += 1) {
      const a = road.points[i - 1];
      const b = road.points[i];
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      if (len < 0.8) continue;

      const midX = (a.x + b.x) / 2;
      const midZ = (a.z + b.z) / 2;
      let angle = Math.atan2(b.z - a.z, b.x - a.x);
      if (angle < 0) angle += Math.PI;
      if (angle >= Math.PI) angle -= Math.PI;
      if (isDuplicateCorridor(midX, midZ, angle)) continue;

      const p1 = `${Math.round(a.x * 10)},${Math.round(a.z * 10)}`;
      const p2 = `${Math.round(b.x * 10)},${Math.round(b.z * 10)}`;
      const key = p1 < p2 ? `${p1}:${p2}` : `${p2}:${p1}`;
      if (seen.has(key)) continue;
      seen.add(key);
      accepted.push({ x: midX, z: midZ, angle });

      const ux = (b.x - a.x) / len;
      const uz = (b.z - a.z) / len;
      const dash = 1.45;
      const gap = 2.15;
      let cursor = 0.75;

      while (cursor < len - 0.35) {
        const end = Math.min(cursor + dash, len - 0.2);
        appendQuad(
          positions,
          indices,
          a.x + ux * cursor,
          a.z + uz * cursor,
          a.x + ux * end,
          a.z + uz * end,
          0.11,
          0.118
        );
        cursor += dash + gap;
      }
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildRoadLayers(): { roadLayers: RoadLayer[]; shoulder: THREE.BufferGeometry; edges: THREE.BufferGeometry; centerDashes: THREE.BufferGeometry } {
  const landRoads = getLandRoads(2, 0.4);
  const byType: Record<string, SceneRoad[]> = {};

  landRoads.forEach((road) => {
    const type = road.type in TYPE_WIDTH ? road.type : "tertiary";
    if (!byType[type]) byType[type] = [];
    byType[type].push({ ...road, type });
  });

  const roadLayers = Object.entries(byType).map(([type, roads]) => ({
    geometry: buildStripGeometry(roads, () => TYPE_WIDTH[type] ?? TYPE_WIDTH.tertiary, 0.062),
    color: TYPE_COLOR[type] ?? TYPE_COLOR.tertiary,
    roughness: type === "tertiary" ? 0.88 : 0.78,
  }));

  return {
    roadLayers,
    shoulder: buildStripGeometry(landRoads, (type) => (TYPE_WIDTH[type] ?? TYPE_WIDTH.tertiary) + 1.25, 0.034),
    edges: buildEdgeGeometry(landRoads.filter((road) => road.type !== "tertiary")),
    centerDashes: buildCenterDashGeometry(landRoads),
  };
}

export default function RoadSystem() {
  const { roadLayers, shoulder, edges, centerDashes } = useMemo(buildRoadLayers, []);

  return (
    <group>
      <mesh geometry={shoulder} receiveShadow>
        <meshStandardMaterial
          color="#8f969b"
          roughness={0.96}
          metalness={0.02}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {roadLayers.map((layer, i) => (
        <mesh key={i} geometry={layer.geometry} receiveShadow>
          {makeRoadMaterial(layer.color)}
        </mesh>
      ))}

      <mesh geometry={edges}>
        <meshBasicMaterial color="#dfe8ea" transparent opacity={0.42} side={THREE.DoubleSide} />
      </mesh>

      <mesh geometry={centerDashes}>
        <meshBasicMaterial color="#eadf74" transparent opacity={0.86} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
