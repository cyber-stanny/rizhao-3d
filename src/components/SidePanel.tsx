import { useCityStore } from "../store/useCityStore";
import { spots } from "../data/spots";
import { routes } from "../data/routes";

const TYPE_ICON: Record<string, string> = {
  海滨景区: "🏖",
  海岸地标: "🗼",
  文旅街区: "🏮",
  自然景区: "🌲",
  城市活力: "🏊",
  港口产业: "⚓",
  交通枢纽: "🚄",
  城市生活: "🎓",
};

export default function SidePanel() {
  const selectedSpotId = useCityStore((s) => s.selectedSpotId);
  const selectSpot = useCityStore((s) => s.selectSpot);
  const selectedRouteId = useCityStore((s) => s.selectedRouteId);
  const selectRoute = useCityStore((s) => s.selectRoute);
  const startTour = useCityStore((s) => s.startTour);
  const isTourPlaying = useCityStore((s) => s.isTourPlaying);
  const viewMode = useCityStore((s) => s.viewMode);

  if (viewMode === "walk") return null;

  return (
    <div className="pointer-events-auto absolute left-4 top-20 z-20 hidden max-h-[calc(100vh-180px)] w-60 flex-col gap-3 md:flex">
      <div className="glass-panel flex max-h-[55%] flex-col rounded-2xl p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">城市景点</h2>
          <span className="text-[10px] text-sea-200/60">{spots.length} 个地标</span>
        </div>
        <div className="scrollbar-thin -mr-1 flex-1 overflow-y-auto pr-1">
          {spots.map((spot) => {
            const active = selectedSpotId === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => selectSpot(spot.id)}
                className={`mb-1.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all ${
                  active
                    ? "bg-sea-300/25 ring-1 ring-sea-300/50"
                    : "hover:bg-sea-700/40"
                }`}
              >
                <span className="text-base leading-none">
                  {TYPE_ICON[spot.type] ?? "📍"}
                </span>
                <span className="flex-1 leading-tight">
                  <span
                    className={`block text-xs font-medium ${
                      active ? "text-white" : "text-sea-100"
                    }`}
                  >
                    {spot.name}
                  </span>
                  <span className="block text-[10px] text-sea-200/60">
                    {spot.type} · {spot.recommendTime}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel flex flex-col rounded-2xl p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">推荐路线</h2>
          <span className="text-[10px] text-sea-200/60">{routes.length} 条</span>
        </div>
        <div className="scrollbar-thin -mr-1 max-h-[45%] overflow-y-auto pr-1">
          {routes.map((route) => {
            const active = selectedRouteId === route.id;
            return (
              <div
                key={route.id}
                className={`mb-1.5 rounded-lg p-2.5 transition-all ${
                  active ? "bg-sea-300/20 ring-1 ring-sea-300/40" : "hover:bg-sea-700/40"
                }`}
              >
                <button
                  onClick={() => selectRoute(active ? null : route.id)}
                  className="block w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        active ? "text-white" : "text-sea-100"
                      }`}
                    >
                      {route.name}
                    </span>
                    <span className="text-[10px] text-sea-200/60">
                      {route.duration}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-sea-200/70">
                    {route.description}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {route.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-sea-700/50 px-1.5 py-0.5 text-[9px] text-sea-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => startTour(route.id)}
                  disabled={isTourPlaying}
                  className="mt-2 w-full rounded-md bg-gradient-to-r from-sea-400/80 to-sea-600/80 py-1.5 text-[11px] font-medium text-white transition hover:from-sea-300 hover:to-sea-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isTourPlaying && active ? "导览进行中..." : "开始自动游览"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
