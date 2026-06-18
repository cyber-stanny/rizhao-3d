import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCityStore } from "../store/useCityStore";
import { spots } from "../data/spots";
import { cityConfig } from "../data/cityConfig";

const DRONE_HEIGHT = 32;
const ORBIT_RADIUS = 24;
const ORBIT_SPEED = 0.4;
const FLY_DURATION = 1600;
const HOLD_DURATION = 5000;
const TOTAL_LOOPS = 2;

export default function DroneController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const droneNonce = useCityStore((s) => s.droneNonce);
  const isDroneFlying = useCityStore((s) => s.isDroneFlying);
  const stopDrone = useCityStore((s) => s.stopDrone);
  const selectSpot = useCityStore((s) => s.selectSpot);
  const requestView = useCityStore((s) => s.requestView);

  const stateRef = useRef({
    active: false,
    phase: "fly" as "fly" | "orbit" | "done",
    spotIdx: 0,
    loop: 0,
    phaseStart: 0,
    flyFrom: new THREE.Vector3(),
    flyTo: new THREE.Vector3(),
    lookFrom: new THREE.Vector3(),
    lookTo: new THREE.Vector3(),
    orbitAngle: 0,
  });

  useEffect(() => {
    if (!isDroneFlying) {
      stateRef.current.active = false;
      return;
    }
    const s = stateRef.current;
    s.active = true;
    s.spotIdx = 0;
    s.loop = 0;
    s.phase = "fly";
    s.phaseStart = performance.now();
    s.flyFrom.copy(camera.position);

    const spot = spots[0];
    const startAngle = 0;
    s.flyTo.set(
      spot.position[0] + Math.cos(startAngle) * ORBIT_RADIUS,
      DRONE_HEIGHT,
      spot.position[2] + Math.sin(startAngle) * ORBIT_RADIUS
    );
    s.lookFrom.set(camera.position.x, 2, camera.position.z);
    s.lookTo.set(spot.position[0], 2, spot.position[2]);
    s.orbitAngle = startAngle;
    selectSpot(spot.id);
  }, [droneNonce, isDroneFlying, camera, selectSpot]);

  useFrame((_, delta) => {
    const s = stateRef.current;
    if (!s.active) return;

    const now = performance.now();
    const elapsed = now - s.phaseStart;
    const spot = spots[s.spotIdx];
    const target = new THREE.Vector3(spot.position[0], 2, spot.position[2]);

    if (s.phase === "fly") {
      const t = Math.min(1, elapsed / FLY_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(s.flyFrom, s.flyTo, eased);
      const look = new THREE.Vector3().lerpVectors(s.lookFrom, s.lookTo, eased);
      camera.lookAt(look);

      if (t >= 1) {
        s.phase = "orbit";
        s.phaseStart = now;
        s.orbitAngle = 0;
      }
    } else if (s.phase === "orbit") {
      s.orbitAngle += ORBIT_SPEED * delta;
      camera.position.set(
        spot.position[0] + Math.cos(s.orbitAngle) * ORBIT_RADIUS,
        DRONE_HEIGHT + Math.sin(s.orbitAngle * 2) * 2,
        spot.position[2] + Math.sin(s.orbitAngle) * ORBIT_RADIUS
      );
      camera.lookAt(target);

      if (elapsed > HOLD_DURATION) {
        const nextIdx = s.spotIdx + 1;
        if (nextIdx >= spots.length) {
          s.loop++;
          if (s.loop >= TOTAL_LOOPS) {
            s.active = false;
            s.phase = "done";
            stopDrone();
            requestView("overview");
            return;
          }
          s.spotIdx = 0;
        } else {
          s.spotIdx = nextIdx;
        }
        const nextSpot = spots[s.spotIdx];
        s.phase = "fly";
        s.phaseStart = now;
        s.flyFrom.copy(camera.position);
        s.orbitAngle = 0;
        s.flyTo.set(
          nextSpot.position[0] + Math.cos(0) * ORBIT_RADIUS,
          DRONE_HEIGHT,
          nextSpot.position[2] + Math.sin(0) * ORBIT_RADIUS
        );
        s.lookFrom.copy(target);
        s.lookTo.set(nextSpot.position[0], 2, nextSpot.position[2]);
        selectSpot(nextSpot.id);
      }
    }
  });

  return null;
}

void cityConfig;
