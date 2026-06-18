import { useCityStore } from "../store/useCityStore";
import { routes } from "../data/routes";

export default function ControlBar() {
  const viewMode = useCityStore((s) => s.viewMode);
  const isTourPlaying = useCityStore((s) => s.isTourPlaying);
  const isDroneFlying = useCityStore((s) => s.isDroneFlying);
  const selectedRouteId = useCityStore((s) => s.selectedRouteId);
  const setViewMode = useCityStore((s) => s.setViewMode);
  const requestView = useCityStore((s) => s.requestView);
  const startTour = useCityStore((s) => s.startTour);
  const stopTour = useCityStore((s) => s.stopTour);
  const startDrone = useCityStore((s) => s.startDrone);
  const stopDrone = useCityStore((s) => s.stopDrone);
  const reset = useCityStore((s) => s.reset);
  const selectSpot = useCityStore((s) => s.selectSpot);

  const handleView = (target: "overview" | "coast" | "topdown") => {
    selectSpot(null);
    requestView(target);
  };

  const handleAutoTour = () => {
    const routeId = selectedRouteId ?? routes[0].id;
    startTour(routeId);
  };

  const handleWalk = () => {
    selectSpot(null);
    setViewMode("walk");
  };

  const exitWalk = () => {
    setViewMode("orbit");
    requestView("overview");
  };

  const handleReset = () => {
    reset();
    requestView("overview");
  };

  const isWalk = viewMode === "walk";

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-30 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
      <div className="glass-panel flex w-full max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl px-2.5 py-2 sm:w-auto sm:overflow-visible">
        {isWalk ? (
          <>
            <span className="min-w-0 flex-1 px-3 text-xs text-sea-200/80 sm:flex-none sm:whitespace-nowrap">
              WASD 移动 · 拖动视角 · Esc 退出
            </span>
            <div className="mx-1 h-5 w-px bg-sea-300/20" />
            <button
              onClick={exitWalk}
              className="glass-btn active shrink-0 whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-medium text-white"
            >
              退出漫游
            </button>
          </>
        ) : isDroneFlying ? (
          <>
            <span className="px-3 text-xs text-sea-200/80">
              无人机环绕飞行中 · 依次飞越 8 大景点
            </span>
            <div className="mx-1 h-5 w-px bg-sea-300/20" />
            <button
              onClick={stopDrone}
              className="glass-btn active shrink-0 whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-medium text-white"
            >
              ■ 停止无人机
            </button>
          </>
        ) : (
          <>
            <CtrlButton onClick={() => handleView("overview")} icon="🌐" label="全景" />
            <CtrlButton onClick={() => handleView("coast")} icon="🌊" label="海岸" />
            <CtrlButton onClick={() => handleView("topdown")} icon="🛰" label="俯瞰" />
            <div className="mx-1 h-5 w-px bg-sea-300/20" />
            {isTourPlaying ? (
              <button
                onClick={stopTour}
                className="glass-btn active shrink-0 whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-medium text-white"
              >
                ■ 停止导览
              </button>
            ) : (
              <button
                onClick={handleAutoTour}
                className="shrink-0 whitespace-nowrap rounded-lg bg-gradient-to-r from-amber-400/80 to-orange-500/80 px-4 py-1.5 text-xs font-medium text-white transition hover:from-amber-300 hover:to-orange-400"
              >
                ▶ 自动游览
              </button>
            )}
            <button
              onClick={startDrone}
              className="shrink-0 whitespace-nowrap rounded-lg bg-gradient-to-r from-sky-400/80 to-cyan-500/80 px-4 py-1.5 text-xs font-medium text-white transition hover:from-sky-300 hover:to-cyan-400"
            >
              🚁 无人机环绕
            </button>
            <div className="mx-1 h-5 w-px bg-sea-300/20" />
            <CtrlButton onClick={handleWalk} icon="🚶" label="漫游" />
            <CtrlButton onClick={handleReset} icon="↺" label="重置" />
          </>
        )}
      </div>
    </div>
  );
}

function CtrlButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="glass-btn flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs text-sea-100"
    >
      <span className="text-sm leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
