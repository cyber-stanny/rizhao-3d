import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cityConfig } from "../data/cityConfig";
import { sceneBounds } from "../data/sceneData";
import { getCoastBoundary, getCoastXAtZ } from "../utils/coast";

type Props = {
  isNight: boolean;
};

function buildOceanGeometry() {
  const boundary = getCoastBoundary();
  const oceanMaxX = Math.max(sceneBounds.maxX + 90, 175);
  const oceanMinZ = Math.min(sceneBounds.minZ - 40, boundary.minZ - 18);
  const oceanMaxZ = Math.max(sceneBounds.maxZ + 40, boundary.maxZ + 18);
  const rows = 220;
  const cols = 42;

  const positions: number[] = [];
  const uvs: number[] = [];
  const shoreDistance: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row < rows; row += 1) {
    const v = row / (rows - 1);
    const z = THREE.MathUtils.lerp(oceanMinZ, oceanMaxZ, v);
    const coastX = getCoastXAtZ(z) + 1.2;
    const width = Math.max(oceanMaxX - coastX, 24);

    for (let col = 0; col < cols; col += 1) {
      const u = col / (cols - 1);
      const easedU = Math.pow(u, 1.08);
      const x = coastX + width * easedU;

      positions.push(x, 0, z);
      uvs.push(u, v);
      shoreDistance.push(Math.max(0, x - coastX));
    }
  }

  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      const a = row * cols + col;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("aShoreDistance", new THREE.Float32BufferAttribute(shoreDistance, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export default function Ocean({ isNight }: Props) {
  const { colors } = cityConfig;
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(buildOceanGeometry, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color("#63d9e8") },
      uMid: { value: new THREE.Color(colors.ocean) },
      uDeep: { value: new THREE.Color(colors.oceanDeep) },
      uNight: { value: 0 },
    }),
    [colors.ocean, colors.oceanDeep]
  );

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uNight.value = isNight ? 1 : 0;
  });

  return (
    <mesh geometry={geometry} position={[0, 0.012, 0]} receiveShadow>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          attribute float aShoreDistance;
          varying vec2 vUv;
          varying float vWave;
          varying float vShore;
          varying vec3 vWorldPos;

          float waveH(vec2 p, float t) {
            float w = 0.0;
            w += sin(p.x * 0.055 + t * 0.8) * 0.26;
            w += sin(p.y * 0.075 + t * 1.05) * 0.22;
            w += sin((p.x + p.y) * 0.045 + t * 0.65) * 0.18;
            w += sin((p.x * 0.30 - p.y * 0.18) + t * 2.1) * 0.055;
            w += sin((p.x * 0.18 + p.y * 0.42) - t * 2.45) * 0.045;
            return w;
          }

          void main() {
            vUv = uv;
            vShore = aShoreDistance;
            vec3 pos = position;
            float damp = smoothstep(1.5, 14.0, aShoreDistance);
            float h = waveH(pos.xz, uTime) * mix(0.08, 1.0, damp);
            vWave = h;
            pos.y += h;

            vec4 worldPos = modelMatrix * vec4(pos, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uShallow;
          uniform vec3 uMid;
          uniform vec3 uDeep;
          uniform float uNight;
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          varying float vShore;
          varying vec3 vWorldPos;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          void main() {
            float depth = smoothstep(2.0, 56.0, vShore);
            vec3 col = mix(uShallow, uDeep, depth);
            col = mix(col, uMid, 0.24 + 0.16 * sin(vWorldPos.z * 0.025 + uTime * 0.2));

            vec2 flowA = vWorldPos.xz * 0.065 + vec2(uTime * 0.11, -uTime * 0.045);
            vec2 flowB = vWorldPos.xz * 0.18 + vec2(-uTime * 0.06, uTime * 0.08);
            float flow = noise(flowA) * 0.55 + noise(flowB) * 0.32;
            col = mix(col * 0.88, col * 1.18, flow);

            float crest = smoothstep(0.16, 0.46, vWave);
            float shoreFoam = 1.0 - smoothstep(0.8, 5.8, vShore);
            float foamStripe = smoothstep(0.18, 0.8, sin(vWorldPos.z * 0.72 + vWorldPos.x * 0.18 - uTime * 2.6) * 0.5 + 0.5);
            float foam = max(crest * 0.5, shoreFoam * foamStripe);
            vec3 foamCol = vec3(0.92, 0.98, 1.0);
            col = mix(col, foamCol, foam * 0.72);

            float sparkle = pow(max(vWave, 0.0), 3.0) * smoothstep(8.0, 46.0, vShore);
            col += vec3(0.28, 0.38, 0.48) * sparkle;

            if (uNight > 0.5) {
              col = mix(col * 0.28, col * 0.58, depth);
              col += vec3(0.03, 0.07, 0.16) * sparkle;
              col = mix(col, vec3(0.58, 0.66, 0.78), foam * 0.32);
            }

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}
