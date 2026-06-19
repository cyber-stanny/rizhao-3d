import { useNavigate } from "react-router-dom";
import { useCityStore } from "../store/useCityStore";

const MODE_LABEL: Record<string, string> = {
  orbit: "全景浏览",
  walk: "街区漫游",
  tour: "自动导览",
  drone: "无人机巡航",
};

export default function TopBar() {
  const navigate = useNavigate();
  const viewMode = useCityStore((s) => s.viewMode);
  const isTourPlaying = useCityStore((s) => s.isTourPlaying);
  const isNight = useCityStore((s) => s.isNight);
  const toggleNight = useCityStore((s) => s.toggleNight);

  return (
    <div className="pointer-events-auto absolute left-0 right-0 top-0 z-30 flex flex-wrap items-start justify-between gap-2 px-3 py-3 sm:flex-nowrap sm:items-center sm:px-4">
      <div className="glass-panel flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 sm:gap-3 sm:px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sea-300 to-sea-600 text-xs font-bold text-white shadow-lg">
          日
        </div>
        <div className="leading-tight">
          <div className="text-xs font-semibold text-white sm:text-sm">日照 3D 城市漫游</div>
          <div className="hidden text-[10px] text-sea-200/70 sm:block">Rizhao 3D City Tour</div>
        </div>
      </div>

      <div className="glass-panel hidden shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 sm:flex">
        <span className="whitespace-nowrap px-2 text-xs text-sea-200/70">当前模式</span>
        <span className="whitespace-nowrap rounded-md bg-sea-300/20 px-2.5 py-1 text-xs font-medium text-sea-100">
          {isTourPlaying ? "自动导览中" : MODE_LABEL[viewMode]}
        </span>
      </div>

      <div className="glass-panel ml-auto flex shrink-0 items-center gap-1 rounded-xl px-1.5 py-1.5 sm:gap-2 sm:px-2">
        <button
          onClick={toggleNight}
          className="glass-btn whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs text-sea-100 sm:px-3"
          title="切换昼夜"
        >
          {isNight ? "夜间" : "白天"}
        </button>
        <button
          onClick={() => navigate("/about")}
          className="glass-btn whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs text-sea-100 sm:px-3"
        >
          项目说明
        </button>
        <button
          onClick={() => navigate("/")}
          className="glass-btn whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs text-sea-100 sm:px-3"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
