export type Projection = {
  origin: { lon: number; lat: number };
  mPerDegLon: number;
  mPerDegLat: number;
  sceneScale: number;
};

export const DEFAULT_PROJECTION: Projection = {
  origin: { lon: 119.52, lat: 35.42 },
  mPerDegLon: 90700,
  mPerDegLat: 111320,
  sceneScale: 1 / 65,
};

export function projectLonLat(
  lon: number,
  lat: number,
  proj: Projection = DEFAULT_PROJECTION
): { x: number; z: number } {
  const xm = (lon - proj.origin.lon) * proj.mPerDegLon;
  const zm = -(lat - proj.origin.lat) * proj.mPerDegLat;
  return { x: xm * proj.sceneScale, z: zm * proj.sceneScale };
}

export function projectArray(
  coords: [number, number][],
  proj: Projection = DEFAULT_PROJECTION
): { x: number; z: number }[] {
  return coords.map(([lon, lat]) => projectLonLat(lon, lat, proj));
}
