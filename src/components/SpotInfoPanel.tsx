import { useCityStore } from "../store/useCityStore";
import { getSpotById } from "../data/spots";

export default function SpotInfoPanel() {
  const selectedSpotId = useCityStore((s) => s.selectedSpotId);
  const showSpotPanel = useCityStore((s) => s.showSpotPanel);
  const setShowSpotPanel = useCityStore((s) => s.setShowSpotPanel);
  const selectSpot = useCityStore((s) => s.selectSpot);
  const startWalkAt = useCityStore((s) => s.startWalkAt);

  const spot = selectedSpotId ? getSpotById(selectedSpotId) : null;

  if (!showSpotPanel || !spot) return null;

  const close = () => {
    setShowSpotPanel(false);
    selectSpot(null);
  };

  return (
    <div className="pointer-events-auto absolute right-4 top-20 z-20 w-72 animate-fadeUp">
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="relative h-20 bg-gradient-to-br from-sea-400/70 via-sea-600/60 to-sea-900/70">
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
            <div>
              <div className="text-[10px] text-sea-100/80">{spot.type}</div>
              <h3 className="text-lg font-bold text-white drop-shadow">
                {spot.name}
              </h3>
            </div>
            <button
              onClick={close}
              className="rounded-md bg-black/30 px-2 py-1 text-xs text-white/90 hover:bg-black/50"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-3 text-xs leading-relaxed text-sea-100/90">
            {spot.description}
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {spot.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-sea-300/20 px-2 py-0.5 text-[10px] text-sea-100"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between rounded-lg bg-sea-900/40 px-3 py-2 text-xs">
            <span className="text-sea-200/70">建议游览</span>
            <span className="font-medium text-sea-100">{spot.recommendTime}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => selectSpot(spot.id)}
              className="flex-1 rounded-lg bg-gradient-to-r from-sea-400 to-sea-600 py-2 text-xs font-medium text-white transition hover:from-sea-300 hover:to-sea-500"
            >
              飞到这里
            </button>
            <button
              onClick={() => startWalkAt(spot.id)}
              className="flex-1 rounded-lg glass-btn py-2 text-xs text-sea-100 transition hover:bg-sea-600/40"
            >
              🚶 从此处漫游
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
