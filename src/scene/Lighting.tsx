import { useCityStore } from "../store/useCityStore";

type Props = {
  isNight: boolean;
};

export default function Lighting({ isNight }: Props) {
  const sunIntensity = isNight ? 0.15 : 1.3;
  const ambientIntensity = isNight ? 0.3 : 0.7;
  const sunColor = isNight ? "#9bb8ff" : "#fff4e0";
  const ambientColor = isNight ? "#3a4f80" : "#eaf4ff";

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      <hemisphereLight
        args={["#bcd9f0", "#5cb85c", isNight ? 0.25 : 0.6]}
      />
      <directionalLight
        position={[90, 120, 45]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={600}
        shadow-camera-left={-180}
        shadow-camera-right={180}
        shadow-camera-top={180}
        shadow-camera-bottom={-180}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <directionalLight
        position={[-40, 30, -15]}
        intensity={isNight ? 0.1 : 0.3}
        color={isNight ? "#5a6b9f" : "#cfeaff"}
      />
    </>
  );
}
