import CityCanvas from "../scene/CityCanvas";
import LoadingScreen from "../components/LoadingScreen";
import TopBar from "../components/TopBar";
import SidePanel from "../components/SidePanel";
import SpotInfoPanel from "../components/SpotInfoPanel";
import ControlBar from "../components/ControlBar";
import WalkHint from "../components/WalkHint";
import TourIndicator from "../components/TourIndicator";
import { useCityStore } from "../store/useCityStore";

export default function CityPage() {
  const viewMode = useCityStore((s) => s.viewMode);
  const isDroneFlying = useCityStore((s) => s.isDroneFlying);
  const bottomHint =
    viewMode === "walk"
      ? "WASD 移动 · 鼠标拖动视角 · Esc 退出"
      : isDroneFlying
        ? "无人机巡航中 · 可随时停止返回全景"
        : "鼠标拖动旋转 · 滚轮缩放 · 点击地标查看详情";

  return (
    <div className="relative h-full w-full overflow-hidden bg-sea-900">
      <CityCanvas />

      <LoadingScreen />
      <TopBar />
      <SidePanel />
      <SpotInfoPanel />
      <ControlBar />
      <WalkHint />
      <TourIndicator />

      <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden text-[10px] text-sea-200/40 sm:block">
        {bottomHint}
      </div>
    </div>
  );
}
