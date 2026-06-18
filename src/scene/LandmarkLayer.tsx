import { spots } from "../data/spots";
import LandmarkModel from "./LandmarkModel";
import LandmarkMarker from "./LandmarkMarker";
import TreeField from "./TreeField";
import { useCityStore } from "../store/useCityStore";

type Props = {
  isNight: boolean;
};

export default function LandmarkLayer({ isNight }: Props) {
  const forest = spots.find((s) => s.id === "forest-park")!;
  const qfnu = spots.find((s) => s.id === "university-qfnu")!;
  const sdfl = spots.find((s) => s.id === "university-sdfl")!;
  const rzvtc = spots.find((s) => s.id === "university-rzvtc")!;

  return (
    <group>
      {spots.map((spot) => (
        <LandmarkModel key={`m-${spot.id}`} spot={spot} isNight={isNight} />
      ))}

      <TreeField
        count={160}
        seed={101}
        area={{
          minX: forest.position[0] - 14,
          maxX: forest.position[0] + 14,
          minZ: forest.position[2] - 16,
          maxZ: forest.position[2] + 10,
        }}
        avoid={[{ x: forest.position[0], z: forest.position[2], r: 4 }]}
      />

      <TreeField
        count={40}
        seed={202}
        area={{
          minX: qfnu.position[0] - 10,
          maxX: qfnu.position[0] + 10,
          minZ: qfnu.position[2] - 8,
          maxZ: qfnu.position[2] + 8,
        }}
        avoid={[{ x: qfnu.position[0], z: qfnu.position[2], r: 5 }]}
      />

      <TreeField
        count={30}
        seed={303}
        area={{
          minX: sdfl.position[0] - 9,
          maxX: sdfl.position[0] + 9,
          minZ: sdfl.position[2] - 7,
          maxZ: sdfl.position[2] + 7,
        }}
        avoid={[{ x: sdfl.position[0], z: sdfl.position[2], r: 5 }]}
      />

      <TreeField
        count={30}
        seed={404}
        area={{
          minX: rzvtc.position[0] - 9,
          maxX: rzvtc.position[0] + 9,
          minZ: rzvtc.position[2] - 7,
          maxZ: rzvtc.position[2] + 7,
        }}
        avoid={[{ x: rzvtc.position[0], z: rzvtc.position[2], r: 5 }]}
      />

      {spots.map((spot) => (
        <LandmarkMarker key={`k-${spot.id}`} spot={spot} />
      ))}
    </group>
  );
}
