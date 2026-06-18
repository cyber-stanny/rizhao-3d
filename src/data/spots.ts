export type SpotModelType =
  | "marker"
  | "lighthouse"
  | "port"
  | "park"
  | "station"
  | "town"
  | "forest"
  | "water"
  | "university";

export type Spot = {
  id: string;
  name: string;
  type: string;
  lon: number;
  lat: number;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  shortDescription: string;
  description: string;
  tags: string[];
  recommendTime: string;
  modelType: SpotModelType;
};

import { projectLonLat } from "../utils/geo";

function spot(
  id: string,
  name: string,
  type: string,
  lon: number,
  lat: number,
  camOffset: [number, number, number],
  shortDescription: string,
  description: string,
  tags: string[],
  recommendTime: string,
  modelType: SpotModelType
): Spot {
  const p = projectLonLat(lon, lat);
  const position: [number, number, number] = [p.x, 0, p.z];
  const cameraPosition: [number, number, number] = [
    p.x + camOffset[0],
    camOffset[1],
    p.z + camOffset[2],
  ];
  return {
    id,
    name,
    type,
    lon,
    lat,
    position,
    cameraPosition,
    shortDescription,
    description,
    tags,
    recommendTime,
    modelType,
  };
}

export const spots: Spot[] = [
  spot(
    "wanpingkou",
    "万平口景区",
    "海滨景区",
    119.56836,
    35.41390,
    [12, 17, 15],
    "日照代表性的海滨观光区域。",
    "万平口景区是日照最负盛名的海滨地标，金色沙滩绵延数公里，观海平台直面黄海。这里是日照阳光海岸的核心，以万平口大桥、世帆赛基地与城市天际线为主要视觉元素，适合表现日照阳光海岸的城市形象。",
    ["海滨", "沙滩", "观海", "拍照"],
    "2-3 小时",
    "marker"
  ),
  spot(
    "lighthouse",
    "灯塔风景区",
    "海岸地标",
    119.55906,
    35.39450,
    [14, 18, 18],
    "具有辨识度的海岸观景地标。",
    "灯塔风景区位于石臼街道黄海一路，以日照灯塔为核心，是沿海观景与夜景灯光的核心展示点。场景中通过程序化灯塔模型表现，圆柱塔身配圆锥塔顶，顶部点光源模拟夜间导航灯光。",
    ["灯塔", "海岸", "观景", "地标"],
    "1-2 小时",
    "lighthouse"
  ),
  spot(
    "dongyi-town",
    "东夷小镇",
    "文旅街区",
    119.55843,
    35.43384,
    [12, 14, 22],
    "展现日照东夷文化的文旅街区。",
    "东夷小镇位于山海天旅游度假区，以低矮街区建筑群与暖色灯笼光点表现传统文旅街区氛围，是体验日照夜间文化与美食的代表区域，建筑风格古朴、街道尺度亲切。",
    ["文化", "夜游", "美食", "街区"],
    "2-3 小时",
    "town"
  ),
  spot(
    "forest-park",
    "日照海滨国家森林公园",
    "自然景区",
    119.62201,
    35.54234,
    [15, 22, 22],
    "城市北侧的滨海森林公园。",
    "日照海滨国家森林公园位于城市北侧沿海，通过大量简化树木与绿地表现自然生态区域，是城市中难得的滨海林地景观，适合漫步与亲近自然，氛围宁静开阔。",
    ["森林", "自然", "休闲", "绿地"],
    "2-4 小时",
    "forest"
  ),
  spot(
    "water-park",
    "奥林匹克水上运动公园",
    "城市活力",
    119.54835,
    35.42767,
    [15, 14, 22],
    "城市中心的水上运动活力区域。",
    "奥林匹克水上运动公园位于市区东侧泻湖区域，以矩形水池与环形看台呈现城市运动活力，是日照作为水上运动之都的象征，场景中水池倒映天光，看台环绕运动场地。",
    ["运动", "水上", "活力", "亲子"],
    "1-3 小时",
    "water"
  ),
  spot(
    "rizhao-port",
    "日照港",
    "港口产业",
    119.52554,
    35.34519,
    [15, 22, 22],
    "城市南侧的深水港口产业区。",
    "日照港是中国沿海重要深水港口，通过码头平台、彩色集装箱方块与船只轮廓表现港口产业意象，展现日照作为港口城市的经济面貌，集装箱排列有序，船只停泊于码头。",
    ["港口", "产业", "集装箱", "船只"],
    "1-2 小时",
    "port"
  ),
  spot(
    "west-station",
    "日照西站",
    "交通枢纽",
    119.41422,
    35.39028,
    [15, 18, 18],
    "城市西侧的高铁交通枢纽。",
    "日照西站位于奎山街道西客运站高架路，作为城市西侧入口与高铁门户，以大型站房建筑与站前广场表现交通枢纽，是游客进入日照的重要门户，建筑体量宏大、广场开阔。",
    ["交通", "高铁", "枢纽", "门户"],
    "0.5-1 小时",
    "station"
  ),
  spot(
    "university-qfnu",
    "曲阜师范大学日照校区",
    "城市生活",
    119.53568,
    35.44239,
    [15, 17, 22],
    "日照大学城核心院校之一。",
    "曲阜师范大学日照校区位于烟台路秦楼街道，是日照大学城的重要组成，校园以教学楼群、图书馆、标准操场与林荫绿地呈现浓厚的学术氛围，建筑规整大气、绿意盎然。",
    ["校园", "教育", "师范", "绿地"],
    "1-2 小时",
    "university"
  ),
  spot(
    "university-sdfl",
    "山东外国语职业技术大学",
    "城市生活",
    119.52624,
    35.47181,
    [15, 17, 22],
    "山海路畔的外语类职业大学。",
    "山东外国语职业技术大学位于山海路秦楼街道，是山东省唯一一所公办外国语类职业本科大学，校园以欧式风格教学楼、钟楼和外语文化广场为特色，体现国际化校园氛围。",
    ["校园", "外语", "职业", "国际"],
    "1-2 小时",
    "university"
  ),
  spot(
    "university-rzvtc",
    "日照职业技术大学",
    "城市生活",
    119.53714,
    35.46256,
    [15, 17, 22],
    "卧龙山下的综合性职业大学。",
    "日照职业技术大学卧龙山校区位于博文路，是日照规模最大的职业大学，校园以实训楼群、体育馆、圆形操场和博学广场呈现充满活力的职业教育氛围，是日照高等教育的名片。",
    ["校园", "职业", "实训", "活力"],
    "1-2 小时",
    "university"
  ),
];

export const getSpotById = (id: string): Spot | undefined =>
  spots.find((s) => s.id === id);
