import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneBounds } from "../data/sceneData";

type Props = { isNight: boolean };

export default function AmbientParticles({ isNight }: Props) {
  const COUNT = 200;
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    const b = sceneBounds;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = THREE.MathUtils.lerp(b.minX, b.maxX, Math.random());
      arr[i * 3 + 1] = Math.random() * 25 + 2;
      arr[i * 3 + 2] = THREE.MathUtils.lerp(b.minZ, b.maxZ, Math.random());
    }
    return arr;
  }, []);

  const offsets = useMemo(() => {
    const arr = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) arr[i] = Math.random() * 100;
    return arr;
  }, []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (!isNight) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          count={COUNT}
          array={offsets}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#ffd980") },
        }}
        vertexShader={`
          attribute float aOffset;
          uniform float uTime;
          varying float vAlpha;
          void main() {
            vec3 pos = position;
            pos.x += sin(uTime * 0.3 + aOffset) * 3.0;
            pos.y += sin(uTime * 0.5 + aOffset * 1.7) * 2.0;
            pos.z += cos(uTime * 0.25 + aOffset * 2.1) * 3.0;
            vAlpha = 0.4 + 0.6 * sin(uTime * 1.2 + aOffset * 3.0);
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = 8.0 * (100.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            float a = (1.0 - smoothstep(0.0, 0.5, d)) * vAlpha;
            gl_FragColor = vec4(uColor, a * 0.6);
          }
        `}
      />
    </points>
  );
}
