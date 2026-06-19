import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "项目定位",
    body: "本项目第一版是一个零素材、程序化生成的日照 3D 海滨城市街区漫游 Demo。所有城市元素由代码生成：建筑群、道路、海面、沙滩、绿地、港口、灯塔、地标标记、路线连线与镜头飞行动画。",
  },
  {
    title: "核心功能",
    items: [
      "3D 城市场景：低多边形海滨城市，含海面、沙滩、道路与建筑群",
      "8 个默认地标：万平口、灯塔、东夷小镇、森林公园等",
      "地标点击：点击景点弹出信息卡片，镜头自动飞行",
      "3 条推荐路线：海滨一日游、城市印象游、亲子休闲游",
      "自动游览：按路线依次飞行展示地标",
      "WASD 漫游：第一人称街区漫步，沉浸探索",
      "昼夜切换：白天与夜间两种氛围",
    ],
  },
  {
    title: "技术方案",
    items: [
      "前端框架：React + TypeScript",
      "构建工具：Vite",
      "3D 渲染：Three.js + React Three Fiber",
      "状态管理：Zustand",
      "样式：Tailwind CSS",
      "城市生成：程序化几何体 + InstancedMesh + 自定义着色器",
    ],
  },
  {
    title: "项目边界",
    items: [
      "第一版不采集真实街景、全景图与航拍素材",
      "不接入真实地图 API，使用虚拟坐标系统",
      "不还原真实建筑，采用低多边形概念模型",
      "不包含后台管理与用户系统",
      "代码预留素材字段，后续可替换真实图片与 3D 模型",
    ],
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-full w-full overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0a2f54 0%, #06182f 60%, #030a18 100%)",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="glass-btn rounded-lg px-3 py-1.5 text-xs text-sea-100"
          >
            ← 返回首页
          </button>
          <button
            onClick={() => navigate("/city")}
            className="rounded-lg bg-gradient-to-r from-sea-300 to-sea-500 px-4 py-1.5 text-xs font-medium text-white"
          >
            进入 3D 城市 →
          </button>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">项目说明</h1>
        <p className="mb-10 text-sm text-sea-200/70">
          日照 3D 城市街区漫游导览系统 · 零素材程序化生成版本
        </p>

        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <div key={s.title} className="glass-panel rounded-2xl p-4 sm:p-6">
              <h2 className="mb-3 text-lg font-semibold text-sea-100">
                {s.title}
              </h2>
              {s.body && (
                <p className="mb-3 text-sm leading-relaxed text-sea-200/85">
                  {s.body}
                </p>
              )}
              {s.items && (
                <ul className="space-y-2">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="flex gap-2 text-sm leading-relaxed text-sea-200/85"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sea-300" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[11px] text-sea-200/40">
          本项目第一版实现一个不依赖外部素材的日照 3D 海滨城市街区漫游网页，形成一个可展示、可扩展的 3D 城市数字名片 Demo。
        </p>
      </div>
    </div>
  );
}
