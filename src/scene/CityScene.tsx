import Sky from "./Sky";
import Lighting from "./Lighting";
import Ground from "./Ground";
import Beach from "./Beach";
import Ocean from "./Ocean";
import RoadSystem from "./RoadSystem";
import BuildingGrid from "./BuildingGrid";
import LandmarkLayer from "./LandmarkLayer";
import RouteLine from "./RouteLine";
import StreetLife from "./StreetLife";
import OrbitViewController from "./OrbitViewController";
import FirstPersonController from "./FirstPersonController";
import DroneController from "./DroneController";
import { useCityStore } from "../store/useCityStore";

export default function CityScene() {
  const isNight = useCityStore((s) => s.isNight);
  const viewMode = useCityStore((s) => s.viewMode);
  const isDroneFlying = useCityStore((s) => s.isDroneFlying);

  const fogColor = isNight ? "#0a1530" : "#bcd9f0";
  const fogNear = 120;
  const fogFar = 600;

  let controller: React.ReactNode;
  if (isDroneFlying) {
    controller = <DroneController />;
  } else if (viewMode === "walk") {
    controller = <FirstPersonController />;
  } else {
    controller = <OrbitViewController />;
  }

  return (
    <>
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <Sky isNight={isNight} />
      <Lighting isNight={isNight} />

      <Ground />
      <Beach />
      <Ocean isNight={isNight} />
      <RoadSystem />
      <BuildingGrid isNight={isNight} fogColor={fogColor} fogNear={fogNear} fogFar={fogFar} />
      <StreetLife isNight={isNight} />
      <LandmarkLayer isNight={isNight} />
      <RouteLine />

      {controller}
    </>
  );
}
