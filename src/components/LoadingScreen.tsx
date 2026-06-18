import { useEffect, useState } from "react";
import { useCityStore } from "../store/useCityStore";

const STEPS = [
  "正在生成日照 3D 城市...",
  "正在加载海岸线...",
  "正在生成街区建筑...",
  "正在标记城市地标...",
  "准备就绪，欢迎来到日照",
];

export default function LoadingScreen() {
  const showLoading = useCityStore((s) => s.showLoading);
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!showLoading) return;
    const timers: number[] = [];
    STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i), i * 450));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [showLoading]);

  useEffect(() => {
    if (showLoading) {
      setExiting(false);
      setStep(0);
    } else {
      setExiting(true);
      const t = window.setTimeout(() => setExiting(false), 600);
      return () => window.clearTimeout(t);
    }
  }, [showLoading]);

  if (!showLoading && !exiting) return null;

  const progress = Math.min(100, ((step + 1) / STEPS.length) * 100);

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        showLoading ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #0a2f54 0%, #06182f 60%, #030a18 100%)",
      }}
    >
      <div className="relative mb-8 h-24 w-24">
        <div className="absolute inset-0 rounded-full border-2 border-sea-300/30" />
        <div className="absolute inset-0 rounded-full border-t-2 border-sea-300 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          <span className="animate-pulseGlow text-sea-200">日照</span>
        </div>
      </div>

      <h1 className="mb-2 text-xl font-semibold tracking-wide text-sea-100">
        日照 3D 城市街区漫游
      </h1>
      <p className="mb-8 text-sm text-sea-200/70">沉浸式探索阳光海岸城市</p>

      <div className="h-1.5 w-64 overflow-hidden rounded-full bg-sea-900/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sea-300 to-sea-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 h-5 text-xs text-sea-200/80">{STEPS[step]}</p>
    </div>
  );
}
