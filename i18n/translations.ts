export type Locale = "en" | "zh";

const translations = {
  // Navbar
  "nav.startup": { en: "Startup", zh: "创业" },
  "nav.research": { en: "Research", zh: "研究" },
  "nav.photo": { en: "Photo", zh: "摄影" },
  "nav.project": { en: "Project", zh: "项目" },

  // Home
  "home.label": { en: "Personal Website", zh: "个人网站" },
  "home.subtitle": { en: "Founder, researcher, builder.", zh: "创业者，研究者，建造者。" },

  // Startup
  "startup.label": { en: "01 / Startup", zh: "01 / 创业" },
  "startup.title": { en: "Startup", zh: "创业" },
  "startup.lede": {
    en: "Building Parthenon, an AI-native legal company focused on narrowing the justice gap.",
    zh: "创建 Parthenon，一家以AI驱动的法律科技公司，致力于缩小司法鸿沟。",
  },
  "startup.company": { en: "Company", zh: "公司" },
  "startup.companyDesc": {
    en: "The current wedge is an intelligent voice-based intake agent for law firms. The longer-term ambition is much larger: use legal AI to make access to justice cheaper, broader, and eventually close to ubiquitous.",
    zh: "当前切入点是面向律所的智能语音接案助手。长期愿景更为宏大：利用法律AI让司法服务更廉价、更广泛，最终实现近乎普惠。",
  },
  "startup.mission": { en: "Mission page", zh: "使命页面" },
  "startup.why": { en: "Why this", zh: "为什么做这个" },
  "startup.whyDesc": {
    en: "Legal services remain expensive while a large share of individuals and small businesses go unserved. Parthenon is positioned around a simple thesis: start with high-value B2B legal workflows, improve autonomy over time, and push the cost of legal help down-market.",
    zh: "法律服务依然昂贵，大量个人和小企业无法获得服务。Parthenon 基于一个简单论点：从高价值的B2B法律工作流切入，逐步提升自动化程度，将法律服务的成本推向大众市场。",
  },
  "startup.roadmap": { en: "Roadmap", zh: "路线图" },
  "startup.roadmap1": {
    en: "Intake agent for law firms.",
    zh: "面向律所的接案智能助手。",
  },
  "startup.roadmap2": {
    en: "Vertical AI paralegals for high-volume legal domains.",
    zh: "面向高频法律领域的垂直AI法律助理。",
  },
  "startup.roadmap3": {
    en: "Autonomous AI lawyer accessible to the general public.",
    zh: "面向大众的自主AI律师。",
  },

  // Research
  "research.label": { en: "02 / Research", zh: "02 / 研究" },
  "research.title": { en: "Research", zh: "研究" },
  "research.lede": { en: "Publications and preprints.", zh: "论文发表与预印本。" },
  "research.publications": { en: "Publications", zh: "论文列表" },
  "research.scholar": { en: "Google Scholar", zh: "Google Scholar" },

  // Photo
  "photo.label": { en: "03 / Photo Atlas", zh: "03 / 摄影地图" },
  "photo.title": { en: "Photo Atlas", zh: "摄影地图" },
  "photo.lede": {
    en: "Pin a place, open a memory. A living archive of travel photography.",
    zh: "标记一个地方，打开一段记忆。一座旅行摄影的活档案馆。",
  },
  "photo.globe": { en: "Travel Globe", zh: "旅行地球" },
  "photo.globeHint": {
    en: "Click a marker on the globe to open a destination.",
    zh: "点击地球上的标记以打开目的地。",
  },
  "photo.stops": { en: "stops", zh: "站点" },
  "photo.regions": { en: "regions", zh: "区域" },
  "photo.images": { en: "images", zh: "张照片" },
  "photo.destinations": { en: "Destinations", zh: "目的地" },
  "photo.destHint": {
    en: "Click a card to browse photos from that stop.",
    zh: "点击卡片浏览该站点的照片。",
  },
  "photo.loading": { en: "Loading atlas...", zh: "加载中..." },
  "photo.timeline": { en: "Timeline", zh: "时间轴" },
  "photo.photos": { en: "photo", zh: "张照片" },
  "photo.photosPlural": { en: "photos", zh: "张照片" },
  "photo.dragToOrbit": { en: "Drag to orbit", zh: "拖拽旋转" },

  // Project
  "project.label": { en: "04 / Project", zh: "04 / 项目" },
  "project.title": { en: "Project", zh: "项目" },
  "project.lede": {
    en: "A separate page for products, systems, and case studies.",
    zh: "产品、系统与案例研究的专属页面。",
  },
  "project.status": { en: "Status", zh: "状态" },
  "project.comingSoon": { en: "Coming soon.", zh: "即将上线。" },
  "project.comingSoonDesc": {
    en: "This page is reserved for projects once there is enough material for a proper write-up.",
    zh: "此页面将在有足够内容后正式开放。",
  },

  // Footer
  "footer.name": { en: "Hejia Geng", zh: "耿鹤嘉" },

  // Months
  "month.1": { en: "January", zh: "一月" },
  "month.2": { en: "February", zh: "二月" },
  "month.3": { en: "March", zh: "三月" },
  "month.4": { en: "April", zh: "四月" },
  "month.5": { en: "May", zh: "五月" },
  "month.6": { en: "June", zh: "六月" },
  "month.7": { en: "July", zh: "七月" },
  "month.8": { en: "August", zh: "八月" },
  "month.9": { en: "September", zh: "九月" },
  "month.10": { en: "October", zh: "十月" },
  "month.11": { en: "November", zh: "十一月" },
  "month.12": { en: "December", zh: "十二月" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key][locale];
}

export default translations;
