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

function buildDashedCenterGeometry(roads: SceneRoad[]) {
  const positions: number[] = [];
  const indices: number[] = [];
  const dash = 2.7;
  const gap = 2.0;

  roads.forEach((road) => {
    if (!MAIN_TYPES.has(road.type)) return;

    for (let i = 1; i < road.points.length; i += 1) {
      const a = road.points[i - 1];
      const b = road.points[i];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz);
      if (len < 0.001) continue;

      const ux = dx / len;
      const uz = dz / len;
      let cursor = 0.8;
      while (cursor < len) {
        const end = Math.min(cursor + dash, len);
        appendQuad(
          positions,
          indices,
          a.x + ux * cursor,
          a.z + uz * cursor,
          a.x + ux * end,
          a.z + uz * end,
          0.16,
          0.092
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

function buildRoadLayers(): { roadLayers: RoadLayer[]; shoulder: THREE.BufferGeometry; edges: THREE.BufferGeometry; dashes: THREE.BufferGeometry } {
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
    dashes: buildDashedCenterGeometry(landRoads),
  };
}

export default function RoadSystem() {
  const { roadLayers, shoulder, edges, dashes } = useMemo(buildRoadLayers, []);

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
        <meshBasicMaterial color="#eef5f6" side={THREE.DoubleSide} />
      </mesh>

      <mesh geometry={dashes}>
        <meshBasicMaterial
          color="#f2da63"
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
