import { useNavigate } from "react-router-dom";

const TAGS = ["3D 城市", "海滨导览", "街区漫游", "AI Web Coding"];

const FEATURES = [
  { icon: "🏖", title: "阳光海岸", desc: "程序化海面、沙滩与海岸线" },
  { icon: "🏙", title: "城市街区", desc: "低多边形建筑群与道路网络" },
  { icon: "📍", title: "8 大地标", desc: "点击景点，镜头自动飞行" },
  { icon: "🚶", title: "自由漫游", desc: "WASD 街区漫步，沉浸探索" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="relative h-full w-full overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse at 70% 20%, #1a4a7a 0%, #0a2f54 40%, #06182f 80%, #030a18 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-sea-400/20 blur-3xl" />
        <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {TAGS.map((t) => (
            <span
              key={t}
              className="rounded-full border border-sea-300/30 bg-sea-900/40 px-3 py-1 text-xs text-sea-100/90"
            >
              {t}
            </span>
          ))}
        </div>

        <h1 className="mb-4 text-center text-5xl font-bold leading-tight text-white md:text-6xl">
          日照 3D 城市街区漫游
        </h1>
        <p className="mb-3 text-center text-lg text-sea-200/90 md:text-xl">
          沉浸式探索阳光海岸城市
        </p>
        <p className="mb-10 max-w-2xl text-center text-sm leading-relaxed text-sea-200/70">
          进入一个由代码生成的日照海滨城市，在 3D 街区中浏览海岸线、建筑群、道路和城市地标，
          体验可点击、可漫游、可自动导览的城市数字名片。
        </p>

        <div className="mb-12 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/city")}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-sea-300 to-sea-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sea-500/30 transition hover:from-sea-200 hover:to-sea-400 hover:shadow-sea-400/50"
          >
            <span>开始探索</span>
            <span className="transition group-hover:translate-x-1">→</span>
          </button>
          <button
            onClick={() => navigate("/about")}
            className="rounded-xl border border-sea-300/30 bg-sea-900/40 px-8 py-3.5 text-base font-medium text-sea-100 transition hover:bg-sea-800/60"
          >
            查看项目说明
          </button>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-panel rounded-xl p-4 text-center transition hover:scale-[1.03]"
            >
              <div className="mb-2 text-3xl">{f.icon}</div>
              <div className="text-sm font-semibold text-white">{f.title}</div>
              <div className="mt-1 text-[11px] leading-relaxed text-sea-200/70">
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-[11px] text-sea-200/40">
          React · Vite · Three.js · React Three Fiber · 零素材程序化生成
        </div>
      </div>
    </div>
  );
}
