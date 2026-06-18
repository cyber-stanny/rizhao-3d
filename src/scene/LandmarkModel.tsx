import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Spot } from "../data/spots";

type Props = {
  spot: Spot;
  isNight: boolean;
};

export default function LandmarkModel({ spot, isNight }: Props) {
  switch (spot.modelType) {
    case "lighthouse":
      return <Lighthouse spot={spot} isNight={isNight} />;
    case "port":
      return <Port spot={spot} />;
    case "station":
      return <Station spot={spot} />;
    case "town":
      return <Town spot={spot} isNight={isNight} />;
    case "forest":
      return null;
    case "water":
      return <WaterPark spot={spot} />;
    case "marker":
      return <BeachPlatform spot={spot} />;
    case "university":
      return <University spot={spot} isNight={isNight} />;
    default:
      return null;
  }
}

function groupPos(spot: Spot): [number, number, number] {
  return [spot.position[0], 0, spot.position[2]];
}

function Lighthouse({ spot, isNight }: { spot: Spot; isNight: boolean }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.6;
    if (beamRef.current) beamRef.current.rotation.y = t;
    if (lightRef.current) {
      lightRef.current.intensity = isNight ? 6 + Math.sin(t * 2) * 2 : 1.2;
    }
  });

  return (
    <group position={groupPos(spot)}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.95, 3, 12]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.7, 0.5, 12]} />
        <meshStandardMaterial color="#d8453a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 4.1, 0]} castShadow>
        <coneGeometry args={[0.7, 1.2, 12]} />
        <meshStandardMaterial color="#c2382f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#fff2b0"
          emissive="#ffcc55"
          emissiveIntensity={isNight ? 2.5 : 1}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 3.6, 0]}
        color="#ffd070"
        distance={18}
        intensity={isNight ? 6 : 1.2}
      />
      {isNight && (
        <mesh ref={beamRef} position={[0, 3.5, 0]}>
          <coneGeometry args={[3, 14, 16, 1, true]} />
          <meshBasicMaterial
            color="#ffe9a8"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function Port({ spot }: { spot: Spot }) {
  const containers = useRef<THREE.Group>(null);
  const colors = ["#c0392b", "#27ae60", "#2980b9", "#f39c12", "#8e44ad", "#16a085"];
  const items: { x: number; z: number; c: string; h: number }[] = [];
  let idx = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      items.push({
        x: -3 + i * 1.7,
        z: -2.5 + j * 2.2,
        c: colors[idx % colors.length],
        h: 1.2 + (idx % 2) * 0.6,
      });
      idx++;
    }
  }

  return (
    <group position={groupPos(spot)}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.2, 7]} />
        <meshStandardMaterial color="#7c7c7c" roughness={0.9} />
      </mesh>
      <group ref={containers}>
        {items.map((c, i) => (
          <mesh key={i} position={[c.x, 0.2 + c.h / 2, c.z]} castShadow>
            <boxGeometry args={[1.5, c.h, 1.9]} />
            <meshStandardMaterial color={c.c} roughness={0.7} metalness={0.2} />
          </mesh>
        ))}
      </group>
      <group position={[5, 0, 1]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[3.5, 1.2, 1.6]} />
          <meshStandardMaterial color="#34495e" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.2, 0.6, 1]} />
          <meshStandardMaterial color="#ecf0f1" roughness={0.6} />
        </mesh>
        <mesh position={[-2.6, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.8, 0.2]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </group>
  );
}

function Station({ spot }: { spot: Spot }) {
  return (
    <group position={groupPos(spot)}>
      <mesh position={[0, 0.05, 4]} receiveShadow>
        <boxGeometry args={[16, 0.2, 8]} />
        <meshStandardMaterial color="#9aa3ad" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 4.4, 5]} />
        <meshStandardMaterial color="#e8ecf2" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[13, 1, 5.5]} />
        <meshStandardMaterial color="#5a6b82" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.8, 0]} castShadow>
        <boxGeometry args={[10, 0.6, 4]} />
        <meshStandardMaterial color="#7fa8d8" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.2, 2.55]}>
        <planeGeometry args={[10, 2]} />
        <meshStandardMaterial color="#bfe6ff" emissive="#3da8f0" emissiveIntensity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Town({ spot, isNight }: { spot: Spot; isNight: boolean }) {
  const isDongyi = spot.id === "dongyi-town";
  const buildingColor = isDongyi ? "#d9b48f" : "#cdd6e0";
  const roofColor = isDongyi ? "#8a4b2f" : "#5a6b82";
  const positions = [
    [-1.8, -1, 1.2], [0, -1, 1], [1.8, -1, 1.3],
    [-1.8, 1, 1.2], [0, 1, 1], [1.8, 1, 1.2],
  ];
  return (
    <group position={groupPos(spot)}>
      {positions.map((p, i) => (
        <group key={i} position={[p[0], 0, p[1]]}>
          <mesh position={[0, p[2] / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, p[2], 1.5]} />
            <meshStandardMaterial color={buildingColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, p[2] + 0.2, 0]} castShadow>
            <boxGeometry args={[1.7, 0.4, 1.7]} />
            <meshStandardMaterial color={roofColor} roughness={0.8} />
          </mesh>
          {isDongyi && isNight && (
            <pointLight
              position={[0, p[2] + 0.6, 0]}
              color="#ff9a3c"
              distance={4}
              intensity={2}
            />
          )}
        </group>
      ))}
      {isDongyi &&
        positions.map((p, i) => (
          <mesh key={`l-${i}`} position={[p[0], p[2] + 0.5, p[1]]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color="#ff9a3c"
              emissive="#ff7a1c"
              emissiveIntensity={isNight ? 3 : 1}
            />
          </mesh>
        ))}
    </group>
  );
}

function WaterPark({ spot }: { spot: Spot }) {
  return (
    <group position={groupPos(spot)}>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[5.5, 0.15, 3.5]} />
        <meshStandardMaterial color="#cfd8e6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[4.8, 0.1, 2.8]} />
        <meshStandardMaterial color="#2a9fd8" roughness={0.3} metalness={0.3} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.22, 8, 32]} />
        <meshStandardMaterial color="#e8ecf2" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.18, 8, 32]} />
        <meshStandardMaterial color="#bfe6ff" roughness={0.7} />
      </mesh>
    </group>
  );
}

function BeachPlatform({ spot }: { spot: Spot }) {
  return (
    <group position={groupPos(spot)}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 4]} />
        <meshStandardMaterial color="#e8d9a8" roughness={1} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[4, 1.2, 0.4]} />
        <meshStandardMaterial color="#b8c6db" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[4.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#7fa8d8" roughness={0.6} />
      </mesh>
    </group>
  );
}

function University({ spot, isNight }: { spot: Spot; isNight: boolean }) {
  if (spot.id === "university-sdfl") return <SDFLUniversity spot={spot} isNight={isNight} />;
  if (spot.id === "university-rzvtc") return <RZVTCUniversity spot={spot} isNight={isNight} />;
  return <QFNUUniversity spot={spot} isNight={isNight} />;
}

function QFNUUniversity({ spot, isNight }: { spot: Spot; isNight: boolean }) {
  const buildings = [
    { x: -4, z: -2, w: 3, h: 4.5, d: 2.5, c: "#e8d5b7", roof: "#8a6d3b" },
    { x: -4, z: 2, w: 3, h: 5.5, d: 2.5, c: "#d4b896", roof: "#7a5d2b" },
    { x: 0, z: -3, w: 2.5, h: 6, d: 2.2, c: "#c9a96e", roof: "#6a4d1b" },
    { x: 0, z: 3, w: 2.5, h: 4, d: 2.2, c: "#e8d5b7", roof: "#8a6d3b" },
    { x: 4, z: -2, w: 2.8, h: 5, d: 2.5, c: "#d4b896", roof: "#7a5d2b" },
    { x: 4, z: 2, w: 2.8, h: 4.5, d: 2.5, c: "#c9a96e", roof: "#6a4d1b" },
  ];

  return (
    <group position={groupPos(spot)}>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.c} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, b.h + 0.25, 0]} castShadow>
            <boxGeometry args={[b.w + 0.2, 0.5, b.d + 0.2]} />
            <meshStandardMaterial color={b.roof} roughness={0.8} flatShading />
          </mesh>
          {isNight && (
            <pointLight position={[0, b.h * 0.6, 0]} color="#ffcc66" distance={4} intensity={1.5} />
          )}
        </group>
      ))}

      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshStandardMaterial color="#c43c3c" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} receiveShadow>
          <circleGeometry args={[2, 32]} />
          <meshStandardMaterial color="#5cb85c" roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.8, 6]} />
        <meshStandardMaterial color="#d4b896" flatShading />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <coneGeometry args={[1.2, 1.2, 6]} />
        <meshStandardMaterial color="#8a6d3b" flatShading />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -5.5]} receiveShadow>
        <planeGeometry args={[11, 1.5]} />
        <meshStandardMaterial color="#7dd87d" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 5.5]} receiveShadow>
        <planeGeometry args={[11, 1.5]} />
        <meshStandardMaterial color="#7dd87d" roughness={0.95} />
      </mesh>
    </group>
  );
}

function SDFLUniversity({ spot, isNight }: { spot: Spot; isNight: boolean }) {
  const ivory = "#f5efe0";
  const pillarCol = "#e8dcc8";
  const purpleRoof = "#6a4d8a";
  const deepPurple = "#4a2d6a";

  return (
    <group position={groupPos(spot)}>
      {/* === 左翼:欧式柱廊教学楼 === */}
      <group position={[-4, 0, -2]}>
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 4, 2.2]} />
          <meshStandardMaterial color={ivory} roughness={0.75} flatShading />
        </mesh>
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[3.2, 0.35, 2.4]} />
          <meshStandardMaterial color={purpleRoof} roughness={0.7} flatShading />
        </mesh>
        {/* 三角山花 */}
        <mesh position={[0, 4.6, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.01, 1.5, 0.8, 3, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={ivory} roughness={0.7} flatShading />
        </mesh>
        {/* 罗马柱廊 */}
        {[-1, -0.3, 0.3, 1].map((px, i) => (
          <mesh key={i} position={[px, 1, 1.3]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 2, 8]} />
            <meshStandardMaterial color={pillarCol} roughness={0.6} />
          </mesh>
        ))}
        {isNight && <pointLight position={[0, 2, 0]} color="#a8c4ff" distance={4} intensity={1.5} />}
      </group>

      {/* === 右翼:拜占庭穹顶教学楼 === */}
      <group position={[4, 0, -2]}>
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 4, 2.2]} />
          <meshStandardMaterial color={ivory} roughness={0.75} flatShading />
        </mesh>
        {/* 穹顶鼓座 */}
        <mesh position={[0, 4.2, 0]} castShadow>
          <cylinderGeometry args={[1, 1.1, 0.8, 12]} />
          <meshStandardMaterial color={pillarCol} roughness={0.7} flatShading />
        </mesh>
        {/* 拜占庭半球穹顶 */}
        <mesh position={[0, 4.8, 0]} castShadow>
          <sphereGeometry args={[1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={deepPurple} roughness={0.6} flatShading />
        </mesh>
        {/* 穹顶小尖塔 */}
        <mesh position={[0, 5.6, 0]} castShadow>
          <coneGeometry args={[0.12, 0.5, 8]} />
          <meshStandardMaterial color="#ffd700" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* 拱窗 */}
        {[0].map((_, i) => (
          <mesh key={i} position={[0, 2, 1.12]}>
            <planeGeometry args={[1.2, 2]} />
            <meshStandardMaterial color={deepPurple} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {isNight && <pointLight position={[0, 2, 0]} color="#a8c4ff" distance={4} intensity={1.5} />}
      </group>

      {/* === 中央哥特式钟楼 === */}
      <group position={[0, 0, 1]}>
        {/* 钟楼基座 */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 5, 1.6]} />
          <meshStandardMaterial color={ivory} roughness={0.7} flatShading />
        </mesh>
        {/* 钟楼中层(收窄) */}
        <mesh position={[0, 6, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.9, 1, 8]} />
          <meshStandardMaterial color={pillarCol} roughness={0.7} flatShading />
        </mesh>
        {/* 哥特尖塔 */}
        <mesh position={[0, 7.2, 0]} castShadow>
          <coneGeometry args={[0.7, 2.5, 8]} />
          <meshStandardMaterial color={purpleRoof} roughness={0.7} flatShading />
        </mesh>
        {/* 金色顶尖球 */}
        <mesh position={[0, 8.6, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={isNight ? 2.5 : 0.6} metalness={0.4} />
        </mesh>
        {/* 钟面 */}
        <mesh position={[0, 4, 0.81]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color="#fff" roughness={0.4} />
        </mesh>
        <mesh position={[0, 4, 0.82]}>
          <ringGeometry args={[0.45, 0.55, 16]} />
          <meshStandardMaterial color="#8a6d3b" roughness={0.5} />
        </mesh>
        {/* 钟楼四面小拱窗 */}
        {[
          [0, 0.82], [0, -0.82], [0.82, 0], [-0.82, 0],
        ].map(([dx, dz], i) => (
          <mesh key={i} position={[dx, 6.2, dz]} rotation={[0, i % 2 === 0 ? 0 : Math.PI / 2, 0]}>
            <planeGeometry args={[0.4, 0.7]} />
            <meshStandardMaterial color={deepPurple} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {isNight && <pointLight position={[0, 4, 0]} color="#fff8dc" distance={6} intensity={2} />}
      </group>

      {/* === 后排教学楼 === */}
      <group position={[-3.5, 0, 3]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 3.5, 2]} />
          <meshStandardMaterial color={ivory} roughness={0.75} flatShading />
        </mesh>
        <mesh position={[0, 3.7, 0]} castShadow>
          <boxGeometry args={[2.7, 0.3, 2.2]} />
          <meshStandardMaterial color={purpleRoof} roughness={0.7} flatShading />
        </mesh>
      </group>
      <group position={[3.5, 0, 3]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 3.5, 2]} />
          <meshStandardMaterial color={ivory} roughness={0.75} flatShading />
        </mesh>
        <mesh position={[0, 3.7, 0]} castShadow>
          <boxGeometry args={[2.7, 0.3, 2.2]} />
          <meshStandardMaterial color={purpleRoof} roughness={0.7} flatShading />
        </mesh>
      </group>

      {/* === 欧式拱门入口 === */}
      <group position={[0, 0, 4.5]}>
        <mesh position={[-0.8, 1, 0]} castShadow>
          <boxGeometry args={[0.3, 2, 0.5]} />
          <meshStandardMaterial color={pillarCol} roughness={0.7} />
        </mesh>
        <mesh position={[0.8, 1, 0]} castShadow>
          <boxGeometry args={[0.3, 2, 0.5]} />
          <meshStandardMaterial color={pillarCol} roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.1, 0]} castShadow>
          <torusGeometry args={[0.8, 0.18, 6, 12, Math.PI]} />
          <meshStandardMaterial color={pillarCol} roughness={0.7} flatShading />
        </mesh>
      </group>

      {/* === 国际文化广场 === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial color="#d4c9b0" roughness={0.9} />
      </mesh>
      {/* 广场中心星形图案 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[0.8, 5]} />
        <meshStandardMaterial color="#c9a96e" roughness={0.8} />
      </mesh>

      {/* === 多国旗帜(5根旗杆) === */}
      {[
        { x: -2.2, z: -0.5, c: "#e74c3c" },
        { x: -1.1, z: -0.8, c: "#3498db" },
        { x: 0, z: -1, c: "#f39c12" },
        { x: 1.1, z: -0.8, c: "#2ecc71" },
        { x: 2.2, z: -0.5, c: "#9b59b6" },
      ].map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 3, 6]} />
            <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0.35, 2.6, 0]} castShadow>
            <planeGeometry args={[0.6, 0.4]} />
            <meshStandardMaterial color={f.c} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* === 绿地 === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -5]} receiveShadow>
        <planeGeometry args={[10, 1.5]} />
        <meshStandardMaterial color="#7dd87d" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 6]} receiveShadow>
        <planeGeometry args={[10, 1.5]} />
        <meshStandardMaterial color="#7dd87d" roughness={0.95} />
      </mesh>
    </group>
  );
}

function RZVTCUniversity({ spot, isNight }: { spot: Spot; isNight: boolean }) {
  const buildings = [
    { x: -4, z: -2, w: 3.2, h: 5, d: 2.5, c: "#cfe0e8", roof: "#3a7db8" },
    { x: -4, z: 2, w: 3.2, h: 5.5, d: 2.5, c: "#b8d0e0", roof: "#2a6da8" },
    { x: 0, z: -2.8, w: 2.5, h: 6, d: 2.2, c: "#cfe0e8", roof: "#3a7db8" },
    { x: 4, z: -2, w: 2.8, h: 4.5, d: 2.5, c: "#b8d0e0", roof: "#2a6da8" },
    { x: 4, z: 2, w: 2.8, h: 4, d: 2.5, c: "#cfe0e8", roof: "#3a7db8" },
  ];

  return (
    <group position={groupPos(spot)}>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.c} roughness={0.75} flatShading />
          </mesh>
          <mesh position={[0, b.h + 0.2, 0]} castShadow>
            <boxGeometry args={[b.w * 1.04, 0.4, b.d * 1.04]} />
            <meshStandardMaterial color={b.roof} roughness={0.7} flatShading />
          </mesh>
          {isNight && (
            <pointLight position={[0, b.h * 0.5, 0]} color="#88ddff" distance={4} intensity={1.5} />
          )}
        </group>
      ))}

      <group position={[0, 0, 2.5]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[3, 4, 3]} />
          <meshStandardMaterial color="#a8c8d8" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0, 4.2, 0]} castShadow>
          <sphereGeometry args={[1.8, 8, 6]} />
          <meshStandardMaterial color="#3a7db8" roughness={0.6} flatShading />
        </mesh>
      </group>

      <group position={[0, 0, -1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
          <ringGeometry args={[1.8, 2.3, 32]} />
          <meshStandardMaterial color="#e8712a" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} receiveShadow>
          <circleGeometry args={[1.8, 32]} />
          <meshStandardMaterial color="#5cb85c" roughness={0.95} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -5]} receiveShadow>
        <planeGeometry args={[11, 1.5]} />
        <meshStandardMaterial color="#7dd87d" roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 5]} receiveShadow>
        <planeGeometry args={[11, 1.5]} />
        <meshStandardMaterial color="#7dd87d" roughness={0.95} />
      </mesh>

      <mesh position={[0, 1.5, -4.8]}>
        <boxGeometry args={[2.5, 1, 0.25]} />
        <meshStandardMaterial color="#3a7db8" emissive="#3a7db8" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
