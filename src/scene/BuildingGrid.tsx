import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cityConfig } from "../data/cityConfig";
import { sceneData } from "../data/sceneData";
import { createRandom } from "../utils/random";
import { clamp } from "../utils/math";
import { isNearLandRoad, isOnLand } from "../utils/coast";

type Props = {
  isNight: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
};

type BuildingInstance = {
  cx: number;
  cz: number;
  height: number;
  sizeX: number;
  sizeZ: number;
  rotY: number;
  color: THREE.Color;
  roofColor: THREE.Color;
};

function buildInstances(): BuildingInstance[] {
  const rng = createRandom(20240618);
  const { colors } = cityConfig;
  const out: BuildingInstance[] = [];

  sceneData.buildings.forEach((b) => {
    const pts = b.points;
    if (pts.length < 3) return;
    if (!isOnLand(b.cx, b.cz, 1.5)) return;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    pts.forEach((p) => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
    });
    const sizeX = clamp(maxX - minX, 0.6, 14);
    const sizeZ = clamp(maxZ - minZ, 0.6, 14);
    const clearance = Math.max(sizeX, sizeZ) * 0.55 + 1.4;
    if (isNearLandRoad(b.cx, b.cz, clearance)) return;

    const h = clamp(b.height, 2, 24);

    out.push({
      cx: b.cx,
      cz: b.cz,
      height: h,
      sizeX,
      sizeZ,
      rotY: 0,
      color: new THREE.Color(colors.buildings[rng.int(0, colors.buildings.length - 1)]),
      roofColor: new THREE.Color(
        colors.buildingRoofs[rng.int(0, colors.buildingRoofs.length - 1)]
      ),
    });
  });

  return out;
}

export default function BuildingGrid({ isNight, fogColor, fogNear, fogFar }: Props) {
  const instances = useMemo(buildInstances, []);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const roofRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const sunDir = useMemo(() => new THREE.Vector3(40, 50, 20).normalize(), []);

  const uniforms = useMemo(
    () => ({
      uSunDir: { value: sunDir },
      uSunColor: { value: new THREE.Color("#fff4e0") },
      uAmbient: { value: new THREE.Color("#9fb8d0") },
      uNight: { value: 0 },
      uTime: { value: 0 },
      fogColor: { value: new THREE.Color(fogColor) },
      fogNear: { value: fogNear },
      fogFar: { value: fogFar },
    }),
    [sunDir, fogColor, fogNear, fogFar]
  );

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const roof = roofRef.current;
    if (!body || !roof) return;

    instances.forEach((b, i) => {
      dummy.position.set(b.cx, b.height / 2, b.cz);
      dummy.scale.set(b.sizeX, b.height, b.sizeZ);
      dummy.rotation.set(0, b.rotY, 0);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);
      body.setColorAt(i, b.color);

      const roofH = 0.6 + Math.min(b.height, 16) * 0.08;
      dummy.position.set(b.cx, b.height + roofH / 2, b.cz);
      dummy.scale.set(b.sizeX * 1.08, roofH, b.sizeZ * 1.08);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      roof.setMatrixAt(i, dummy.matrix);
      roof.setColorAt(i, b.roofColor);
    });
    body.instanceMatrix.needsUpdate = true;
    roof.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (roof.instanceColor) roof.instanceColor.needsUpdate = true;
  }, [instances]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uNight.value = isNight ? 1 : 0;
    }
  });

  const buildingVertex = `
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vLocalPos;
    varying vec3 vSize;
    varying float vFogDepth;
    void main() {
      #ifdef USE_INSTANCING_COLOR
        vColor = instanceColor;
      #else
        vColor = vec3(1.0);
      #endif
      #ifdef USE_INSTANCING
        vec3 instanceScale = vec3(
          length(instanceMatrix[0].xyz),
          length(instanceMatrix[1].xyz),
          length(instanceMatrix[2].xyz)
        );
        vSize = instanceScale;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
      #else
        vSize = vec3(1.0);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
      #endif
      vFogDepth = -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
      vLocalPos = position;
    }
  `;

  const buildingFragment = `
    uniform vec3 uSunDir;
    uniform vec3 uSunColor;
    uniform vec3 uAmbient;
    uniform float uNight;
    uniform float uTime;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vLocalPos;
    varying vec3 vSize;
    varying float vFogDepth;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec3 base = vColor;
      vec3 N = normalize(vNormal);
      float diff = max(dot(N, uSunDir), 0.0);
      float diffCel = floor(diff * 3.0) / 3.0;

      vec3 an = abs(N);
      vec2 winUV;
      if (an.x >= an.y && an.x >= an.z) {
        winUV = vec2(vLocalPos.z, vLocalPos.y) * vec2(vSize.z, vSize.y);
      } else if (an.z >= an.y) {
        winUV = vec2(vLocalPos.x, vLocalPos.y) * vec2(vSize.x, vSize.y);
      } else {
        winUV = vec2(vLocalPos.x, vLocalPos.z) * vec2(vSize.x, vSize.z);
      }
      float cell = 1.5;
      vec2 g = floor(winUV / cell);
      vec2 f = fract(winUV / cell);
      float windowMask = step(0.22, f.x) * step(f.x, 0.78) * step(0.25, f.y) * step(f.y, 0.75);
      float verticalFace = 1.0 - step(0.9, an.y);
      windowMask *= verticalFace;
      float winEdge = step(0.22, f.x) * step(f.x, 0.78) * step(0.25, f.y) * step(f.y, 0.75);
      winEdge = windowMask * (1.0 - step(0.30, f.x) * step(f.x, 0.70) * step(0.33, f.y) * step(f.y, 0.67));
      float onOff = step(0.35, hash(g));
      float flicker = 0.85 + 0.15 * sin(uTime * 1.6 + hash(g) * 30.0);

      vec3 shade = base * (uAmbient + uSunColor * diffCel);
      vec3 col = shade;
      if (uNight > 0.5) {
        col = base * (uAmbient * 0.4 + uSunColor * diffCel * 0.2);
        vec3 windowColor = vec3(1.0, 0.85, 0.45) * flicker * onOff * 1.6;
        col = mix(col, windowColor, windowMask * 0.92);
        col = mix(col, vec3(0.2, 0.2, 0.3), winEdge * 0.3);
      } else {
        vec3 windowColor = vec3(0.75, 0.88, 1.0);
        col = mix(col, windowColor, windowMask * 0.55);
        col = mix(col, base * 0.55, winEdge * 0.5);
      }

      vec3 viewDir = normalize(cameraPosition - vec3(0.0));
      float rim = pow(1.0 - max(dot(N, viewDir), 0.0), 2.5);
      col += vec3(0.12, 0.16, 0.22) * rim * (1.0 - uNight);

      float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
      col = mix(col, fogColor, fogFactor);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined as never, undefined as never, instances.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={buildingVertex}
          fragmentShader={buildingFragment}
        />
      </instancedMesh>

      <instancedMesh
        ref={roofRef}
        args={[undefined as never, undefined as never, instances.length]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.75} metalness={0.05} flatShading />
      </instancedMesh>
    </group>
  );
}
