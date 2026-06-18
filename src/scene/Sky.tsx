import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  isNight: boolean;
};

export default function Sky({ isNight }: Props) {
  const { scene } = useThree();
  const topRef = useRef<THREE.Color>(new THREE.Color());

  const skyColor = useMemo(() => {
    if (isNight) {
      return {
        top: new THREE.Color("#050a1f"),
        bottom: new THREE.Color("#1a2a55"),
        fog: new THREE.Color("#0a1530"),
      };
    }
    return {
      top: new THREE.Color("#7ec0ff"),
      bottom: new THREE.Color("#cfeaff"),
      fog: new THREE.Color("#bcd9f0"),
    };
  }, [isNight]);

  useFrame(() => {
    topRef.current.copy(skyColor.top);
    scene.background = skyColor.bottom;
    if (scene.fog) {
      (scene.fog as THREE.Fog).color.copy(skyColor.fog);
    }
  });

  return (
    <mesh
      scale={[-1, 1, 1]}
      frustumCulled={false}
    >
      <sphereGeometry args={[400, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={{
          topColor: { value: skyColor.top },
          bottomColor: { value: skyColor.bottom },
          offset: { value: 30 },
          exponent: { value: 0.7 },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            float t = max(pow(max(h, 0.0), exponent), 0.0);
            gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
          }
        `}
      />
    </mesh>
  );
}
