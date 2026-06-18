import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { cityConfig } from "../data/cityConfig";
import { useCityStore } from "../store/useCityStore";
import { getSpotById } from "../data/spots";
import { getRouteById } from "../data/routes";
import { CameraFlyer } from "../utils/camera";

const VIEW_PRESETS: Record<
  "overview" | "coast" | "topdown",
  { pos: THREE.Vector3; look: THREE.Vector3 }
> = {
  overview: {
    pos: new THREE.Vector3(...(cityConfig.cameraOverview as [number, number, number])),
    look: new THREE.Vector3(...(cityConfig.cameraLookAt as [number, number, number])),
  },
  coast: { pos: new THREE.Vector3(...(cityConfig.cameraCoast as [number, number, number])), look: new THREE.Vector3(20, 3, 0) },
  topdown: { pos: new THREE.Vector3(...(cityConfig.cameraTopdown as [number, number, number])), look: new THREE.Vector3(10, 0, -10) },
};

export default function OrbitViewController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);

  const selectedSpotId = useCityStore((s) => s.selectedSpotId);
  const viewMode = useCityStore((s) => s.viewMode);
  const isTourPlaying = useCityStore((s) => s.isTourPlaying);
  const tourIndex = useCityStore((s) => s.tourIndex);
  const selectedRouteId = useCityStore((s) => s.selectedRouteId);
  const viewNonce = useCityStore((s) => s.viewNonce);
  const viewTarget = useCityStore((s) => s.viewTarget);
  const selectSpot = useCityStore((s) => s.selectSpot);
  const setTourIndex = useCityStore((s) => s.setTourIndex);
  const stopTour = useCityStore((s) => s.stopTour);
  const finishLoading = useCityStore((s) => s.finishLoading);

  const orbitRef = useRef<OrbitControlsImpl>(null);
  const flyerRef = useRef<CameraFlyer | null>(null);
  const introDone = useRef(false);

  useEffect(() => {
    flyerRef.current = new CameraFlyer(camera);
  }, [camera]);

  useEffect(() => {
    camera.position.set(180, 135, 180);
    camera.lookAt(...(cityConfig.cameraLookAt as [number, number, number]));
  }, [camera]);

  useFrame(() => {
    flyerRef.current?.update();
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      const flyer = flyerRef.current;
      const orbit = orbitRef.current;
      if (!flyer) return;
      if (orbit) orbit.enabled = false;
      flyer.flyTo(
        { position: VIEW_PRESETS.overview.pos.clone(), lookAt: VIEW_PRESETS.overview.look.clone() },
        {
          duration: 2600,
          onComplete: () => {
            if (orbit) {
              orbit.target.copy(VIEW_PRESETS.overview.look);
              orbit.enabled = true;
            }
            finishLoading();
            introDone.current = true;
          },
        }
      );
    }, 250);
    return () => window.clearTimeout(id);
  }, [finishLoading]);

  useEffect(() => {
    if (isTourPlaying || viewMode !== "orbit") return;
    if (!selectedSpotId) return;
    const spot = getSpotById(selectedSpotId);
    const flyer = flyerRef.current;
    const orbit = orbitRef.current;
    if (!spot || !flyer) return;
    if (orbit) orbit.enabled = false;
    flyer.flyTo(
      {
        position: new THREE.Vector3(...spot.cameraPosition),
        lookAt: new THREE.Vector3(...spot.position),
      },
      {
        duration: 1600,
        onComplete: () => {
          if (orbit) {
            orbit.target.set(...spot.position);
            orbit.enabled = true;
          }
        },
      }
    );
  }, [selectedSpotId, viewMode, isTourPlaying]);

  useEffect(() => {
    if (!isTourPlaying) return;
    const route = selectedRouteId ? getRouteById(selectedRouteId) : null;
    if (!route) return;
    const spotId = route.spotIds[tourIndex];
    const spot = spotId ? getSpotById(spotId) : null;
    const flyer = flyerRef.current;
    const orbit = orbitRef.current;
    if (!spot || !flyer) return;
    if (orbit) orbit.enabled = false;
    selectSpot(spot.id);

    flyer.flyTo(
      {
        position: new THREE.Vector3(...spot.cameraPosition),
        lookAt: new THREE.Vector3(...spot.position),
      },
      {
        duration: 1800,
        onComplete: () => {
          if (tourIndex + 1 >= route.spotIds.length) {
            window.setTimeout(() => {
              flyer.flyTo(
                {
                  position: VIEW_PRESETS.overview.pos.clone(),
                  lookAt: VIEW_PRESETS.overview.look.clone(),
                },
                {
                  duration: 2000,
                  onComplete: () => stopTour(),
                }
              );
            }, 3000);
          } else {
            window.setTimeout(() => setTourIndex(tourIndex + 1), 3000);
          }
        },
      }
    );
  }, [isTourPlaying, tourIndex, selectedRouteId, selectSpot, setTourIndex, stopTour]);

  useEffect(() => {
    if (viewNonce === 0) return;
    const flyer = flyerRef.current;
    const orbit = orbitRef.current;
    if (!flyer || !viewTarget) return;
    const preset = VIEW_PRESETS[viewTarget];
    if (orbit) orbit.enabled = false;
    flyer.flyTo(
      { position: preset.pos.clone(), lookAt: preset.look.clone() },
      {
        duration: 1600,
        onComplete: () => {
          if (orbit) {
            orbit.target.copy(preset.look);
            orbit.enabled = true;
          }
        },
      }
    );
  }, [viewNonce, viewTarget]);

  useEffect(() => {
    const dom = gl.domElement;
    const onContext = (e: Event) => e.preventDefault();
    dom.addEventListener("contextmenu", onContext);
    return () => dom.removeEventListener("contextmenu", onContext);
  }, [gl]);

  void introDone;

  return (
    <OrbitControls
      ref={orbitRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={10}
      maxDistance={380}
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={VIEW_PRESETS.overview.look}
    />
  );
}
