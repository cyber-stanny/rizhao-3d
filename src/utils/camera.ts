import * as THREE from "three";
import { easeInOutCubic, lerpVec3 } from "./math";

export type FlyTarget = {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
};

export type FlyOptions = {
  duration: number;
  onUpdate?: () => void;
  onComplete?: () => void;
};

export class CameraFlyer {
  private camera: THREE.PerspectiveCamera;
  private active = false;
  private startTime = 0;
  private start = new THREE.Vector3();
  private startLook = new THREE.Vector3();
  private target: FlyTarget | null = null;
  private duration = 1500;
  private onUpdate?: () => void;
  private onComplete?: () => void;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  get isActive() {
    return this.active;
  }

  flyTo(target: FlyTarget, options: FlyOptions = { duration: 1500 }) {
    this.start.copy(this.camera.position);
    this.startLook.copy(this.getActiveLookAt());
    this.target = target;
    this.duration = options.duration;
    this.onUpdate = options.onUpdate;
    this.onComplete = options.onComplete;
    this.startTime = performance.now();
    this.active = true;
  }

  cancel() {
    this.active = false;
    this.target = null;
  }

  private getActiveLookAt(): THREE.Vector3 {
    const look = new THREE.Vector3();
    this.camera.getWorldDirection(look);
    look.add(this.camera.position);
    if (look.y < 0) look.y = 2;
    return look;
  }

  update() {
    if (!this.active || !this.target) return;
    const elapsed = performance.now() - this.startTime;
    const t = Math.min(1, elapsed / this.duration);
    const eased = easeInOutCubic(t);

    lerpVec3(this.camera.position, this.start, this.target.position, eased);

    const currentLook = new THREE.Vector3();
    lerpVec3(currentLook, this.startLook, this.target.lookAt, eased);
    this.camera.lookAt(currentLook);

    this.onUpdate?.();

    if (t >= 1) {
      this.active = false;
      this.target = null;
      this.onComplete?.();
    }
  }
}
