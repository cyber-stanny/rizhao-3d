export type CityConfig = {
  citySize: { width: number; depth: number };
  oceanOffsetX: number;
  beachWidth: number;
  buildingHeightRange: [number, number];
  cameraDefault: [number, number, number];
  cameraLookAt: [number, number, number];
  cameraOverview: [number, number, number];
  cameraCoast: [number, number, number];
  cameraTopdown: [number, number, number];
  walkBounds: { minX: number; maxX: number; minZ: number; maxZ: number; y: number };
  colors: {
    ground: string;
    grass: string;
    road: string;
    roadLine: string;
    beach: string;
    ocean: string;
    oceanDeep: string;
    buildings: string[];
    buildingRoofs: string[];
    treeTrunk: string;
    treeCrown: string;
  };
};

export const cityConfig: CityConfig = {
  citySize: { width: 240, depth: 255 },
  oceanOffsetX: 90,
  beachWidth: 9,
  buildingHeightRange: [2, 20],
  cameraDefault: [105, 82, 112],
  cameraLookAt: [15, 2, -15],
  cameraOverview: [105, 82, 112],
  cameraCoast: [140, 20, 8],
  cameraTopdown: [15, 165, 0.1],
  walkBounds: { minX: -125, maxX: 125, minZ: -145, maxZ: 120, y: 2.4 },
  colors: {
    ground: "#5cb85c",
    grass: "#7dd87d",
    road: "#2a2f3a",
    roadLine: "#d8c850",
    beach: "#ffe08a",
    ocean: "#3cb3e6",
    oceanDeep: "#1a6fb8",
    buildings: [
      "#ff9a76",
      "#7ec8e3",
      "#a8e6cf",
      "#ffd93d",
      "#c7b8ea",
      "#ffb7b3",
      "#95e1d3",
      "#f8b195",
      "#6fcf97",
      "#f2994a",
    ],
    buildingRoofs: ["#e56b6f", "#4a90d9", "#6fcf97", "#f2994a", "#9b51e0", "#bb6bd9"],
    treeTrunk: "#8b6b3a",
    treeCrown: "#5cc95c",
  },
};
