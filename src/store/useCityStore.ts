import { create } from "zustand";
import { spots, type Spot } from "../data/spots";
import { routes, type TourRoute } from "../data/routes";

export type ViewMode = "orbit" | "walk" | "tour" | "drone";
export type ViewTarget = "overview" | "coast" | "topdown";

type CityState = {
  selectedSpotId: string | null;
  hoveredSpotId: string | null;
  selectedRouteId: string | null;
  viewMode: ViewMode;
  isTourPlaying: boolean;
  isDroneFlying: boolean;
  droneNonce: number;
  walkStartSpotId: string | null;
  walkNonce: number;
  tourIndex: number;
  showSpotPanel: boolean;
  showLoading: boolean;
  isNight: boolean;
  viewNonce: number;
  viewTarget: ViewTarget | null;

  selectSpot: (id: string | null) => void;
  setHoveredSpot: (id: string | null) => void;
  selectRoute: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  startTour: (routeId: string) => void;
  stopTour: () => void;
  setTourIndex: (index: number) => void;
  startDrone: () => void;
  stopDrone: () => void;
  startWalkAt: (spotId: string) => void;
  setShowSpotPanel: (show: boolean) => void;
  finishLoading: () => void;
  toggleNight: () => void;
  requestView: (target: ViewTarget) => void;
  reset: () => void;
};

export const useCityStore = create<CityState>((set) => ({
  selectedSpotId: null,
  hoveredSpotId: null,
  selectedRouteId: null,
  viewMode: "orbit",
  isTourPlaying: false,
  isDroneFlying: false,
  droneNonce: 0,
  walkStartSpotId: null,
  walkNonce: 0,
  tourIndex: 0,
  showSpotPanel: false,
  showLoading: true,
  isNight: false,
  viewNonce: 0,
  viewTarget: null,

  selectSpot: (id) =>
    set({
      selectedSpotId: id,
      showSpotPanel: id !== null,
      hoveredSpotId: null,
    }),
  setHoveredSpot: (id) => set({ hoveredSpotId: id }),
  selectRoute: (id) => set({ selectedRouteId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  startTour: (routeId) =>
    set({
      isTourPlaying: true,
      selectedRouteId: routeId,
      viewMode: "tour",
      tourIndex: 0,
      selectedSpotId: null,
      showSpotPanel: false,
    }),
  stopTour: () =>
    set({
      isTourPlaying: false,
      viewMode: "orbit",
      tourIndex: 0,
    }),
  setTourIndex: (index) => set({ tourIndex: index }),
  startDrone: () =>
    set((s) => ({
      isDroneFlying: true,
      droneNonce: s.droneNonce + 1,
      viewMode: "drone",
      isTourPlaying: false,
      selectedSpotId: null,
      showSpotPanel: false,
    })),
  stopDrone: () =>
    set({
      isDroneFlying: false,
      viewMode: "orbit",
    }),
  startWalkAt: (spotId) =>
    set((s) => ({
      walkStartSpotId: spotId,
      walkNonce: s.walkNonce + 1,
      viewMode: "walk",
      isTourPlaying: false,
      isDroneFlying: false,
      selectedSpotId: spotId,
      showSpotPanel: false,
    })),
  setShowSpotPanel: (show) => set({ showSpotPanel: show }),
  finishLoading: () => set({ showLoading: false }),
  toggleNight: () => set((s) => ({ isNight: !s.isNight })),
  requestView: (target) =>
    set((s) => ({ viewTarget: target, viewNonce: s.viewNonce + 1 })),
  reset: () =>
    set({
      selectedSpotId: null,
      hoveredSpotId: null,
      selectedRouteId: null,
      viewMode: "orbit",
      isTourPlaying: false,
      isDroneFlying: false,
      tourIndex: 0,
      showSpotPanel: false,
    }),
}));

export const selectSpotById = (id: string): Spot | undefined =>
  spots.find((s) => s.id === id);

export const selectRouteById = (id: string): TourRoute | undefined =>
  routes.find((r) => r.id === id);
