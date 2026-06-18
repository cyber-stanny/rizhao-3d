import StreetLights from "./StreetLights";
import Walkers from "./Walkers";
import Vehicles from "./Vehicles";
import AmbientParticles from "./AmbientParticles";

type Props = { isNight: boolean };

export default function StreetLife({ isNight }: Props) {
  return (
    <>
      <StreetLights isNight={isNight} />
      <Walkers isNight={isNight} />
      <Vehicles isNight={isNight} />
      <AmbientParticles isNight={isNight} />
    </>
  );
}
