export type TourRoute = {
  id: string;
  name: string;
  description: string;
  spotIds: string[];
  duration: string;
  tags: string[];
};

export const routes: TourRoute[] = [
  {
    id: "coast-day-tour",
    name: "海滨一日游",
    description:
      "从万平口出发，沿海岸线游览灯塔风景区，最后进入东夷小镇体验夜间文旅街区。",
    spotIds: ["wanpingkou", "lighthouse", "dongyi-town"],
    duration: "半天到一天",
    tags: ["海滨", "观景", "夜游"],
  },
  {
    id: "city-impression",
    name: "城市印象游",
    description:
      "从日照西站进入城市，经曲师大、山外、日职三所大学感受校园生活，到达万平口观海，最后前往日照港了解产业面貌。",
    spotIds: ["west-station", "university-qfnu", "university-sdfl", "university-rzvtc", "wanpingkou", "rizhao-port"],
    duration: "一天",
    tags: ["城市", "校园", "海滨", "产业"],
  },
  {
    id: "university-tour",
    name: "大学城巡游",
    description:
      "依次游览曲阜师范大学日照校区、山东外国语职业技术大学、日照职业技术大学，感受日照高等教育的学术氛围与校园活力。",
    spotIds: ["university-qfnu", "university-sdfl", "university-rzvtc"],
    duration: "半天",
    tags: ["校园", "教育", "文化"],
  },
  {
    id: "family-leisure",
    name: "亲子休闲游",
    description:
      "从海滨森林公园出发，到万平口玩沙戏水，最后前往水上运动公园体验城市活力。",
    spotIds: ["forest-park", "wanpingkou", "water-park"],
    duration: "半天",
    tags: ["自然", "沙滩", "休闲"],
  },
];

export const getRouteById = (id: string): TourRoute | undefined =>
  routes.find((r) => r.id === id);
