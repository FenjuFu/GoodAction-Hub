export interface AccessibilityFilter {
  deafFriendly?: boolean
  blindFriendly?: boolean
}

export interface BitesRestaurant {
  name: string
  address: string
  city: string
  tags: string[]
  description: string
  accessibility: {
    deafFriendly: boolean
    blindFriendly: boolean
  }
}

// Barrier-Free-Bites 页面展示的静态候选数据
export const BITES_CATALOG: BitesRestaurant[] = [
  {
    name: "培哥烟囱面包",
    address: "安徽省合肥市庐阳区含山路29号105-3室",
    city: "合肥",
    tags: ["听障友好", "面包", "烘焙"],
    description: "提供专业手语服务，图文菜单与电子点餐，视觉化叫号与写字板沟通。",
    accessibility: { deafFriendly: true, blindFriendly: false },
  },
  {
    name: "木马童话黑暗餐厅",
    address: "北京西城区西单北大街109号西西友谊酒店8层",
    city: "北京",
    tags: ["视障友好", "法餐", "日式料理"],
    description: "完全黑暗用餐体验，视障员工专业引导，盲文菜单与语音介绍。",
    accessibility: { deafFriendly: false, blindFriendly: true },
  },
  {
    name: "星巴克东方文德手语门店（广州）",
    address: "广州市越秀区文德北路68号东方文德广场一层",
    city: "广州",
    tags: ["听障友好", "咖啡"],
    description: "手语沟通与无障碍动线设计，伙伴支持可视化提示与社区友好活动。",
    accessibility: { deafFriendly: true, blindFriendly: false },
  },
  {
    name: "全聚德前门店（北京）",
    address: "北京市东城区前门大街 全聚德前门店",
    city: "北京",
    tags: ["无障碍服务", "盲文菜单", "手语"],
    description: "盲文菜单与无障碍用餐区，导盲犬友好；员工接受基础手语培训，提供贴心平等的用餐体验。",
    accessibility: { deafFriendly: true, blindFriendly: true },
  },
  {
    name: "那伽树无障碍咖啡披萨集合店（北京大栅栏）",
    address: "北京前门大栅栏 那伽树咖啡厅",
    city: "北京",
    tags: ["视障友好", "轮椅友好", "咖啡", "披萨"],
    description: "全国首家无障碍咖啡披萨集合店，设置缓坡、低位呼叫按钮、风铃定位与宽双开门等设施，倡导残健共融。",
    accessibility: { deafFriendly: false, blindFriendly: true },
  },
  {
    name: "无声饭店（云南玉溪）",
    address: "云南省玉溪市 无声饭店",
    city: "玉溪",
    tags: ["听障友好", "家常菜"],
    description: "由听障员工共同经营，通过学习手语与贴心服务打破沟通障碍，提供温暖、平等的用餐体验。",
    accessibility: { deafFriendly: true, blindFriendly: false },
  },
]

export function filterBitesCatalog(location: string, accessibility: AccessibilityFilter = {}) {
  const loc = (location || "").trim()
  const byCity = (item: BitesRestaurant) => (!loc ? true : item.city.includes(loc) || loc.includes(item.city))
  const byAccess = (item: BitesRestaurant) => {
    const needDeaf = !!accessibility?.deafFriendly
    const needBlind = !!accessibility?.blindFriendly
    if (needDeaf && !item.accessibility.deafFriendly) return false
    if (needBlind && !item.accessibility.blindFriendly) return false
    return true
  }
  return BITES_CATALOG.filter((x) => byCity(x) && byAccess(x))
}
