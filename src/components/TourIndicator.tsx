import { useCityStore } from "../store/useCityStore";
import { getRouteById } from "../data/routes";
import { getSpotById } from "../data/spots";

export default function TourIndicator() {
  const isTourPlaying = useCityStore((s) => s.isTourPlaying);
  const selectedRouteId = useCityStore((s) => s.selectedRouteId);
  const tourIndex = useCityStore((s) => s.tourIndex);
  const stopTour = useCityStore((s) => s.stopTour);

  if (!isTourPlaying) return null;

  const route = selectedRouteId ? getRouteById(selectedRouteId) : null;
  const spotId = route?.spotIds[tourIndex];
  const spot = spotId ? getSpotById(spotId) : null;

  return (
    <div className="pointer-events-auto absolute left-3 right-3 top-24 z-20 animate-fadeUp sm:left-1/2 sm:right-auto sm:top-20 sm:-translate-x-1/2">
      <div className="glass-panel flex flex-wrap items-center gap-2 rounded-2xl px-4 py-2 sm:flex-nowrap sm:gap-3 sm:rounded-full sm:px-5">
        <span className="flex h-2.5 w-2.5 items-center justify-center">
          <span className="h-2.5 w-2.5 animate-pulseGlow rounded-full bg-amber-400" />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
          <span className="font-semibold text-white">{route?.name}</span>
          <span className="text-sea-200/50">·</span>
          <span className="text-sea-100">
            {tourIndex + 1}/{route?.spotIds.length ?? 0}
          </span>
          {spot && (
            <>
              <span className="text-sea-200/50">·</span>
              <span className="truncate text-amber-200">{spot.name}</span>
            </>
          )}
        </div>
        <button
          onClick={stopTour}
          className="ml-2 rounded-full bg-black/30 px-2.5 py-0.5 text-[11px] text-white/90 hover:bg-black/50"
        >
          停止
        </button>
      </div>
    </div>
  );
}
