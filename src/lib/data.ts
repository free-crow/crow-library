import type { Book, Category } from "./types";
import { NEW_BOOKS } from "./books.generated";

/**
 * 示例数据：仅限已确认公版的内容（开源边界要求）。
 * 正式上线前，每本书必须走完“书源提交→初筛→权利核验→文件质检→二次审批→发布”流程，
 * 并替换为数据库中的真实记录。
 */
export const CATEGORIES: Category[] = [
  { id: "lit", name: "文学", children: [
    { id: "lit-classic", name: "中国古典文学", children: [
      { id: "lit-classic-novel", name: "古典小说" },
      { id: "lit-classic-poem", name: "诗词歌赋" },
    ]},
    { id: "lit-modern", name: "现代文学" },
    { id: "lit-world", name: "外国文学" },
  ]},
  { id: "hist", name: "历史", children: [
    { id: "hist-ancient", name: "古代史" },
  ]},
  { id: "phil", name: "哲学", children: [
    { id: "phil-cn", name: "中国哲学" },
  ]},
  { id: "sci", name: "科学" },
  { id: "tech", name: "技术", children: [
    { id: "tech-ai", name: "人工智能" },
  ]},
  { id: "econ", name: "经济学" },
];

const PUBLIC_DOMAIN = {
  status: "approved" as const,
  basis: "公版（Public Domain）原作",
  rightsHolder: "公有领域",
  licenseName: "公有领域",
  permissionScope: "在线阅读 / 下载 / 格式转换 / AI 索引与问答",
  attributionText: "公有领域作品，使用时请保留作者署名",
  sourceUrl: "公版文本（示例数据）",
  sourceDate: "2026-10-01",
  reviewedBy: "审核员A",
  reviewedAt: "2026-11-01",
};

export const BOOKS: Book[] = [
  {
    id: "lunyu",
    title: "论语",
    author: "孔子弟子及再传弟子 辑录",
    categoryId: "phil-cn",
    tags: ["儒家", "经典", "公版"],
    intro: "记录孔子及其弟子言行的语录体著作，儒家经典之一。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN },
    aiAllowed: true,
    heat: 986,
    updatedAt: "2026-11-01",
    chapters: [
      { title: "学而第一", paras: [
        "子曰：“学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？”",
        "有子曰：“其为人也孝弟，而好犯上者，鲜矣；不好犯上，而好作乱者，未之有也。君子务本，本立而道生。孝弟也者，其为仁之本与！”",
        "子曰：“巧言令色，鲜矣仁！”",
        "曾子曰：“吾日三省吾身：为人谋而不忠乎？与朋友交而不信乎？传不习乎？”",
      ]},
      { title: "为政第二", paras: [
        "子曰：“为政以德，譬如北辰，居其所而众星共之。”",
        "子曰：“温故而知新，可以为师矣。”",
        "子曰：“学而不思则罔，思而不学则殆。”",
        "子曰：“知之为知之，不知为不知，是知也。”",
      ]},
      { title: "八佾第三", paras: [
        "孔子谓季氏：“八佾舞于庭，是可忍也，孰不可忍也？”",
        "子曰：“人而不仁，如礼何？人而不仁，如乐何？”",
        "子曰：“《关雎》，乐而不淫，哀而不伤。”",
      ]},
    ],
    hasFullText: true,
  },
  {
    id: "daodejing",
    title: "道德经",
    author: "老子",
    categoryId: "phil-cn",
    tags: ["道家", "经典", "公版"],
    intro: "春秋时期老子所著，道家思想的奠基之作，全文五千余言。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN, reviewedAt: "2026-10-28" },
    aiAllowed: true,
    heat: 1204,
    updatedAt: "2026-10-28",
    chapters: [
      { title: "第一章", paras: [
        "道可道，非常道。名可名，非常名。",
        "无名天地之始；有名万物之母。",
        "故常无，欲以观其妙；常有，欲以观其徼。",
        "此两者，同出而异名，同谓之玄。玄之又玄，众妙之门。",
      ]},
      { title: "第二章", paras: [
        "天下皆知美之为美，斯恶已。皆知善之为善，斯不善已。",
        "有无相生，难易相成，长短相形，高下相倾，音声相和，前后相随。",
        "是以圣人处无为之事，行不言之教；万物作焉而不辞，生而不有，为而不恃，功成而弗居。夫唯弗居，是以不去。",
      ]},
      { title: "第八章", paras: [
        "上善若水。水善利万物而不争，处众人之所恶，故几于道。",
        "居善地，心善渊，与善仁，言善信，政善治，事善能，动善时。夫唯不争，故无尤。",
      ]},
    ],
    hasFullText: true,
  },
  {
    id: "hongloumeng",
    title: "红楼梦（公版卷·1–23回）",
    author: "曹雪芹",
    categoryId: "lit-classic-novel",
    tags: ["古典小说", "四大名著", "公版"],
    intro: "中国古典章回小说巅峰之作，以贾、史、王、薛四大家族兴衰为背景。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN, reviewedAt: "2026-10-30" },
    aiAllowed: true,
    heat: 2103,
    updatedAt: "2026-10-30",
    chapters: [
      { title: "第一回 甄士隐梦幻识通灵", paras: [
        "满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味？",
        "此开卷第一回也。作者自云：因曾历过一番梦幻之后，故将真事隐去，而借“通灵”之说，撰此《石头记》一书也。故曰“甄士隐”云云。",
        "虽我未学，下笔无文，又何妨用假语村言，敷演出一段故事来，亦可使闺阁昭传，复可悦世之目，破人愁闷，不亦宜乎？故曰“贾雨村”云云。",
      ]},
    ],
    hasFullText: true,
  },
  {
    id: "shiji",
    title: "史记（公版选卷）",
    author: "司马迁",
    categoryId: "hist-ancient",
    tags: ["史书", "公版"],
    intro: "中国第一部纪传体通史，记载了上起黄帝下至汉武帝的历史。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN, reviewedAt: "2026-10-29" },
    aiAllowed: true,
    heat: 755,
    updatedAt: "2026-10-29",
    chapters: [
      { title: "五帝本纪·节选", paras: [
        "黄帝者，少典之子，姓公孙，名曰轩辕。生而神灵，弱而能言，幼而徇齐，长而敦敏，成而聪明。",
        "轩辕之时，神农氏世衰。诸侯相侵伐，暴虐百姓，而神农氏弗能征。于是轩辕乃习用干戈，以征不享，诸侯咸来宾从。",
      ]},
    ],
    hasFullText: true,
  },
  {
    id: "sunzi-bingfa",
    title: "孙子兵法",
    author: "孙武",
    categoryId: "phil-cn",
    tags: ["兵家", "经典", "公版"],
    intro: "春秋末期孙武所著兵学经典，全书十三篇，被誉为“兵学圣典”。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN, reviewedAt: "2026-11-02" },
    aiAllowed: true,
    heat: 1680,
    updatedAt: "2026-11-02",
    chapters: [
      { title: "始计第一", paras: [
        "孙子曰：兵者，国之大事，死生之地，存亡之道，不可不察也。",
        "故经之以五事，校之以计，而索其情：一曰道，二曰天，三曰地，四曰将，五曰法。",
        "兵者，诡道也。故能而示之不能，用而示之不用，近而示之远，远而示之近。",
      ]},
      { title: "作战第二", paras: [
        "孙子曰：凡用兵之法，驰车千驷，革车千乘，带甲十万，千里馈粮，则内外之费，宾客之用，胶漆之材，车甲之奉，日费千金，然后十万之师举矣。",
        "故兵闻拙速，未睹巧之久也。夫兵久而国利者，未之有也。",
      ]},
      { title: "谋攻第三", paras: [
        "孙子曰：夫用兵之法，全国为上，破国次之；全军为上，破军次之。",
        "是故百战百胜，非善之善者也；不战而屈人之兵，善之善者也。",
        "故曰：知彼知己，百战不殆；不知彼而知己，一胜一负；不知彼不知己，每战必殆。",
      ]},
    ],
    hasFullText: true,
  },
  {
    id: "shijing",
    title: "诗经（全本·305篇）",
    author: "佚名（先秦）",
    categoryId: "lit-classic-poem",
    tags: ["诗歌", "经典", "公版"],
    intro: "中国最早的诗歌总集，收录西周至春秋中叶的诗歌三百余篇，公版全本。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN, reviewedAt: "2026-11-02" },
    aiAllowed: true,
    heat: 890,
    updatedAt: "2026-11-02",
    chapters: [
      { title: "周南·关雎", paras: [
        "关关雎鸠，在河之洲。窈窕淑女，君子好逑。",
        "参差荇菜，左右流之。窈窕淑女，寤寐求之。求之不得，寤寐思服。悠哉悠哉，辗转反侧。",
      ]},
      { title: "秦风·蒹葭", paras: [
        "蒹葭苍苍，白露为霜。所谓伊人，在水一方。",
        "溯洄从之，道阻且长。溯游从之，宛在水中央。",
      ]},
      { title: "周南·桃夭", paras: [
        "桃之夭夭，灼灼其华。之子于归，宜其室家。",
        "桃之夭夭，有蕡其实。之子于归，宜其家室。",
      ]},
    ],
    hasFullText: true,
  },
  {
    id: "zhuangzi",
    title: "庄子·逍遥游（节选）",
    author: "庄周",
    categoryId: "phil-cn",
    tags: ["道家", "经典", "公版"],
    intro: "战国中期庄子所著，道家经典《庄子》首篇，论绝对自由的人生观。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN, reviewedAt: "2026-11-02" },
    aiAllowed: true,
    heat: 720,
    updatedAt: "2026-11-02",
    chapters: [
      { title: "逍遥游（节选）", paras: [
        "北冥有鱼，其名为鲲。鲲之大，不知其几千里也。化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云。",
        "小知不及大知，小年不及大年。奚以知其然也？朝菌不知晦朔，蟪蛄不知春秋，此小年也。",
        "若夫乘天地之正，而御六气之辩，以游无穷者，彼且恶乎待哉？故曰：至人无己，神人无功，圣人无名。",
      ]},
    ],
  },
  {
    id: "mengzi",
    title: "孟子·梁惠王上（节选）",
    author: "孟轲",
    categoryId: "phil-cn",
    tags: ["儒家", "经典", "公版"],
    intro: "战国中期孟子言行录，儒家经典“四书”之一，此为梁惠王上节选。",
    originalLanguage: "中文",
    format: "TXT",
    copyright: { ...PUBLIC_DOMAIN, reviewedAt: "2026-11-02" },
    aiAllowed: true,
    heat: 610,
    updatedAt: "2026-11-02",
    chapters: [
      { title: "梁惠王上（节选）", paras: [
        "孟子见梁惠王。王曰：“叟！不远千里而来，亦将有以利吾国乎？”孟子对曰：“王！何必曰利？亦有仁义而已矣。”",
        "不违农时，谷不可胜食也；数罟不入洿池，鱼鳖不可胜食也；斧斤以时入山林，材木不可胜用也。",
        "老吾老，以及人之老；幼吾幼，以及人之幼。天下可运于掌。",
      ]},
    ],
  },
  {
    id: "art-of-war-epub",
    title: "The Art of War (EPUB)",
    author: "Sun Tzu",
    translator: "Lionel Giles (1910)",
    categoryId: "phil-cn",
    tags: ["Military", "English", "Public Domain"],
    intro: "Project Gutenberg eBook #132：孙子兵法英译本（Lionel Giles 译，1910），原作与译本均在美国进入公有领域。",
    originalLanguage: "英文",
    format: "EPUB",
    copyright: {
      status: "approved",
      basis: "公版（Public Domain，美国）原作与译本",
      rightsHolder: "公有领域",
      licenseName: "Project Gutenberg License / Public Domain (US)",
      licenseUrl: "https://www.gutenberg.org/ebooks/132",
      permissionScope: "在线阅读 / 下载 / AI 索引与问答",
      territory: "美国（其他地区需复核当地版权期限）",
      attributionText: "The Art of War by Sun Tzu, trans. Lionel Giles, Project Gutenberg eBook #132",
      sourceUrl: "https://www.gutenberg.org/ebooks/132",
      sourceDate: "2026-11-09",
      reviewedBy: "审核员B",
      reviewedAt: "2026-11-09",
    },
    aiAllowed: true,
    heat: 402,
    updatedAt: "2026-11-09",
    chapters: [],
    fileUrl: "/books/art-of-war.epub",
  },
  {
    id: "art-of-war-pdf",
    title: "The Art of War · Sample (PDF)",
    author: "Sun Tzu",
    translator: "Lionel Giles (1910)",
    categoryId: "phil-cn",
    tags: ["Military", "English", "Public Domain"],
    intro: "同一公版译本的 PDF 节选示例（第一章 Laying Plans），用于验证 PDF.js 阅读器。",
    originalLanguage: "英文",
    format: "PDF",
    copyright: {
      status: "approved",
      basis: "公版（Public Domain，美国）原作与译本",
      rightsHolder: "公有领域",
      licenseName: "Project Gutenberg License / Public Domain (US)",
      licenseUrl: "https://www.gutenberg.org/ebooks/132",
      permissionScope: "在线阅读 / 下载 / AI 索引与问答",
      territory: "美国（其他地区需复核当地版权期限）",
      attributionText: "The Art of War by Sun Tzu, trans. Lionel Giles, Project Gutenberg eBook #132",
      sourceUrl: "https://www.gutenberg.org/cache/epub/132/pg132.txt",
      sourceDate: "2026-11-09",
      reviewedBy: "审核员B",
      reviewedAt: "2026-11-09",
    },
    aiAllowed: true,
    heat: 388,
    updatedAt: "2026-11-09",
    chapters: [],
    fileUrl: "/books/art-of-war-sample.pdf",
  },
  ...NEW_BOOKS,
];

/** 分类 id → 名称（支持多级） */
export function categoryName(id: string, cats: Category[] = CATEGORIES): string {
  for (const c of cats) {
    if (c.id === id) return c.name;
    if (c.children) {
      const r = categoryName(id, c.children);
      if (r !== id) return r;
    }
  }
  return id;
}
