import { useCityStore } from "../store/useCityStore";

export default function WalkHint() {
  const viewMode = useCityStore((s) => s.viewMode);
  if (viewMode !== "walk") return null;

  return (
    <div className="pointer-events-none absolute left-4 right-4 top-28 z-20 animate-fadeUp sm:left-auto sm:top-24 sm:w-80">
      <div className="glass-panel rounded-xl px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-base leading-none">🚶</span>
          <div className="text-sm font-semibold text-white">街区漫游模式</div>
        </div>
        <div className="mb-2 text-xs text-sea-200/80">
          使用 WASD 控制移动，按住鼠标拖动调整视角
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-sea-200/70">
          <KeyHint k="W" /> <KeyHint k="A" /> <KeyHint k="S" /> <KeyHint k="D" />
          <span className="mr-1">移动</span>
          <KeyHint k="Shift" />
          <span className="mr-1">加速</span>
          <KeyHint k="Esc" />
          <span>退出</span>
        </div>
      </div>
    </div>
  );
}

function KeyHint({ k }: { k: string }) {
  return (
    <span className="inline-flex min-w-[24px] items-center justify-center rounded border border-sea-300/40 bg-sea-900/60 px-1.5 py-0.5 font-mono text-[10px] text-sea-100">
      {k}
    </span>
  );
}
