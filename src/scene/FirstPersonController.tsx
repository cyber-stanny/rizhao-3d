import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cityConfig } from "../data/cityConfig";
import { useCityStore } from "../store/useCityStore";
import { getSpotById } from "../data/spots";
import { clamp } from "../utils/math";

export default function FirstPersonController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const setViewMode = useCityStore((s) => s.setViewMode);
  const walkStartSpotId = useCityStore((s) => s.walkStartSpotId);
  const walkNonce = useCityStore((s) => s.walkNonce);

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });
  const yaw = useRef(0);
  const pitch = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const moveIntent = useRef(new THREE.Vector3());
  const horizontalVelocity = useRef(new THREE.Vector3());
  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const bobTime = useRef(0);

  useEffect(() => {
    let startX = -28;
    let startZ = 24;
    let lookYaw = 0;

    if (walkStartSpotId) {
      const spot = getSpotById(walkStartSpotId);
      if (spot) {
        startX = spot.position[0];
        startZ = spot.position[2] + 5;
        lookYaw = Math.atan2(-spot.position[0] + startX, -(spot.position[2] - startZ));
      }
    }

    const pos = new THREE.Vector3(startX, cityConfig.walkBounds.y, startZ);
    camera.position.copy(pos);
    yaw.current = lookYaw;
    pitch.current = -0.1;
    camera.rotation.order = "YXZ";
    camera.rotation.set(pitch.current, yaw.current, 0);
    horizontalVelocity.current.set(0, 0, 0);
    bobTime.current = 0;
  }, [camera, walkStartSpotId, walkNonce]);

  useEffect(() => {
    const dom = gl.domElement;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint = true;
          break;
        case "Escape":
          setViewMode("orbit");
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint = false;
          break;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      dom.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      yaw.current -= dx * 0.0035;
      pitch.current = clamp(pitch.current - dy * 0.0035, -1.2, 1.0);
      camera.rotation.set(pitch.current, yaw.current, 0);
    };
    const onPointerUp = () => {
      dragging.current = false;
      dom.style.cursor = "grab";
    };
    const onContext = (e: Event) => e.preventDefault();

    dom.style.cursor = "grab";
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("contextmenu", onContext);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      dom.style.cursor = "auto";
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("contextmenu", onContext);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [gl, camera, setViewMode]);

  useFrame((_, delta) => {
    const k = keys.current;
    const maxSpeed = k.sprint ? 15 : 7.5;
    const response = k.sprint ? 8 : 10;
    const braking = 13;

    forwardVec.current.set(0, 0, -1).applyEuler(camera.rotation);
    forwardVec.current.y = 0;
    forwardVec.current.normalize();
    rightVec.current.set(1, 0, 0).applyEuler(camera.rotation);
    rightVec.current.y = 0;
    rightVec.current.normalize();

    moveIntent.current.set(0, 0, 0);
    if (k.forward) moveIntent.current.add(forwardVec.current);
    if (k.backward) moveIntent.current.sub(forwardVec.current);
    if (k.right) moveIntent.current.add(rightVec.current);
    if (k.left) moveIntent.current.sub(rightVec.current);

    const hasInput = moveIntent.current.lengthSq() > 0;
    if (hasInput) moveIntent.current.normalize().multiplyScalar(maxSpeed);

    const dampFactor = hasInput ? response : braking;
    horizontalVelocity.current.x = THREE.MathUtils.damp(
      horizontalVelocity.current.x,
      moveIntent.current.x,
      dampFactor,
      delta
    );
    horizontalVelocity.current.z = THREE.MathUtils.damp(
      horizontalVelocity.current.z,
      moveIntent.current.z,
      dampFactor,
      delta
    );

    camera.position.addScaledVector(horizontalVelocity.current, delta);

    const currentSpeed = Math.hypot(horizontalVelocity.current.x, horizontalVelocity.current.z);
    if (currentSpeed > 0.15) {
      bobTime.current += delta * currentSpeed * 2.4;
    } else {
      bobTime.current = THREE.MathUtils.damp(bobTime.current, 0, 8, delta);
    }

    const b = cityConfig.walkBounds;
    camera.position.x = clamp(camera.position.x, b.minX, b.maxX);
    camera.position.z = clamp(camera.position.z, b.minZ, b.maxZ);
    const bob =
      currentSpeed > 0.15
        ? Math.sin(bobTime.current) * 0.035 + Math.abs(Math.cos(bobTime.current * 0.5)) * 0.02
        : 0;
    camera.position.y = THREE.MathUtils.damp(camera.position.y, b.y + bob, 12, delta);
  });

  return null;
}
