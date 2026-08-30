import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh' | 'en';

export interface Translations {
  // Brand & Navbar
  brandSub: string;
  tabExplorer: string;
  tabGif: string;
  tabDiy: string;
  tabSanta: string;
  langSwitch: string;

  // Footer
  footerDesc: string;
  footerSatflow: string;
  footerOrdnet: string;
  footerRights: string;

  // Explorer
  explorerBadge: string;
  explorerTitle: string;
  explorerSub: string;
  searchPlaceholder: string;
  allBodies: string;
  sortBy: string;
  sortRank: string;
  sortId: string;
  orderAsc: string;
  orderDesc: string;
  totalFound: string;
  perPage: string;
  viewGrid: string;
  viewTable: string;
  tableThImage: string;
  tableThRank: string;
  tableThId: string;
  tableThInscription: string;
  tableThTraits: string;
  tableThActions: string;
  actionMakeGif: string;
  actionSanta: string;
  actionDetails: string;
  noResults: string;
  prevPage: string;
  nextPage: string;

  // Detail Modal
  modalRank: string;
  modalInscription: string;
  modalOwner: string;
  modalTraits: string;
  modalColorPalette: string;
  modalCopySuccess: string;
  modalOpenSatflow: string;
  modalOpenOrdnet: string;
  modalClose: string;

  // GIF Studio
  gifBadge: string;
  gifTitle: string;
  gifSub: string;
  gifModeTitle: string;
  gifModeClassic: string;
  gifModeSanta: string;
  gifBgTitle: string;
  gifBgNone: string;
  gifBgAuto: string;
  gifBgCustom: string;
  gifSpeedTitle: string;
  gifSpeedSlow: string;
  gifSpeedNormal: string;
  gifSpeedFast: string;
  gifSpeedUltra: string;
  gifSpeedExtreme: string;
  gifResTitle: string;
  gifSearchPlaceholder: string;
  gifConfirm: string;
  gifRandom: string;
  gifSaveBtn: string;
  gifSavingBtn: string;
  gifSuccess: string;
  gifSuccessDesc: string;

  // DIY Studio
  diyBadge: string;
  diyTitle: string;
  diySub: string;
  diyRandomBtn: string;
  diySaveBtn: string;
  diySavingBtn: string;
  diyResTitle: string;
  diyBgTitle: string;
  diyBgNone: string;
  diyBgOrange: string;
  diyBgAuto: string;
  diyBgCustom: string;
  diySeriesTitle: string;
  diyCatBody: string;
  diyCatEarring: string;
  diyCatEyes: string;
  diyCatHead: string;
  diyNotSupported: string;
  diyLoadingComponents: string;
  diySuccess: string;
  diySuccessDesc: string;

  // Santa Studio
  santaBadge: string;
  santaTitle: string;
  santaSub: string;
  santaTabSingle: string;
  santaTabCompare: string;
  santaOriginalLabel: string;
  santaMergedLabel: string;
  santaDownloadBtn: string;
  santaDownloadingBtn: string;
  santaRandomBtn: string;
  santaSearchPlaceholder: string;
  santaConfirm: string;
}

export const translations: Record<Language, Translations> = {
  zh: {
    // Brand & Navbar
    brandSub: 'Bitcoin Ordinals • 10,000 铭文藏品',
    tabExplorer: '全量图库',
    tabGif: 'GIF 动图',
    tabDiy: 'DIY 工坊',
    tabSanta: '圣诞版',
    langSwitch: 'EN',

    // Footer
    footerDesc: 'NodeMonkes 官方生态综合门户',
    footerSatflow: 'SatFlow 交易市场',
    footerOrdnet: 'Ord.net 交易市场',
    footerRights: '100% 纯前端离线合成渲染 • 2026',

    // Explorer
    explorerBadge: '10,000 铭文全量探索器',
    explorerTitle: 'NodeMonkes 稀有度与属性浏览器',
    explorerSub: '实时毫秒级检索 10,000 只 NodeMonkes 稀有度排行、Inscription 铭文属性与色彩分析。',
    searchPlaceholder: '搜索 ID、Inscription 编号或属性 (如 Gold, Beak)...',
    allBodies: '全部身体类型',
    sortBy: '排序方式',
    sortRank: '按稀有度 (Rank)',
    sortId: '按编号 (ID)',
    orderAsc: '升序 (从小到大)',
    orderDesc: '降序 (从大到小)',
    totalFound: '共计收录',
    perPage: '每页显示',
    viewGrid: '网格视图',
    viewTable: '列表视图',
    tableThImage: '预览图',
    tableThRank: '稀有度 Rank',
    tableThId: '藏品 ID',
    tableThInscription: '铭文编号',
    tableThTraits: '4 项核心属性 (Traits Breakdown)',
    tableThActions: '操作',
    actionMakeGif: '生成动图',
    actionSanta: '圣诞版',
    actionDetails: '详情',
    noResults: '未找到匹配的 NodeMonke',
    prevPage: '上一页',
    nextPage: '下一页',

    // Detail Modal
    modalRank: '稀有度排名',
    modalInscription: 'Inscription 铭文',
    modalOwner: '持有人地址 (ScriptPubKey)',
    modalTraits: '属性特征 (Traits & Rarity)',
    modalColorPalette: '主色调提取 (Color Palette)',
    modalCopySuccess: '复制成功',
    modalOpenSatflow: '在 SatFlow 查看交易',
    modalOpenOrdnet: '在 Ord.net 查看交易',
    modalClose: '关闭',

    // GIF Studio
    gifBadge: 'NODEMONKES 36 帧正版 GIF 工坊',
    gifTitle: 'NodeMonkes 点头动图生成器',
    gifSub: '100% 沿用原版点活动画算法与生成引擎，支持 0.1x ~ 5.0x 变速与多档高清分辨率。',
    gifModeTitle: '1. 模式选择 (Mode)',
    gifModeClassic: 'Classic 普通经典版',
    gifModeSanta: 'Santa 圣诞节日版',
    gifBgTitle: '2. 背景底色设置',
    gifBgNone: '无背景 (白色)',
    gifBgAuto: '自动背景色',
    gifBgCustom: '自选颜色',
    gifSpeedTitle: '3. 动画播放速度 (0.1x ~ 5.0x)',
    gifSpeedSlow: '0.5x 慢速',
    gifSpeedNormal: '1.0x 原速',
    gifSpeedFast: '2.0x 快速',
    gifSpeedUltra: '3.5x 极速',
    gifSpeedExtreme: '5.0x 狂暴',
    gifResTitle: '4. 分辨率尺寸 (100px ~ 1200px)',
    gifSearchPlaceholder: '输入 ID (1-10000)...',
    gifConfirm: '确定',
    gifRandom: '随机',
    gifSaveBtn: '保存 GIF 动图',
    gifSavingBtn: '正在导出 GIF...',
    gifSuccess: 'GIF 生成成功！',
    gifSuccessDesc: '动图已下载至本地',

    // DIY Studio
    diyBadge: 'OFFICIAL NODEMONKES DIY AVATAR CREATOR',
    diyTitle: 'NodeMonkes DIY 头像工坊',
    diySub: '100% 还原原版全部 5 大系列真实图层，支持身体、耳环、眼睛、头部自由拼装与最高 4K 极清导出。',
    diyRandomBtn: '🎲 随机搭配',
    diySaveBtn: '💾 保存头像',
    diySavingBtn: '正在合成保存...',
    diyResTitle: '导出分辨率:',
    diyBgTitle: '背景底色配置',
    diyBgNone: '无背景',
    diyBgOrange: '橙色背景',
    diyBgAuto: '自动背景',
    diyBgCustom: '自选颜色',
    diySeriesTitle: '系列切换 (Series)',
    diyCatBody: '身体 (Body)',
    diyCatEarring: '耳环 (Earring)',
    diyCatEyes: '眼睛 (Eyes)',
    diyCatHead: '头部 (Head)',
    diyNotSupported: '此系列不支持该组件',
    diyLoadingComponents: '正在加载组件...',
    diySuccess: '头像保存成功！',
    diySuccessDesc: '已下载高清无损 PNG',

    // Santa Studio
    santaBadge: 'NODEMONKES SANTA EDITION',
    santaTitle: 'NodeMonkes 圣诞节日工坊',
    santaSub: '10,000 只经典 NodeMonkes 圣诞主题图层融合，支持单图预览、前后对比与高清无损 PNG 下载。',
    santaTabSingle: '圣诞版单图',
    santaTabCompare: '原版 VS 圣诞版对比',
    santaOriginalLabel: 'ORIGINAL 原版',
    santaMergedLabel: 'SANTA 圣诞版',
    santaDownloadBtn: '下载圣诞高清原图 (1440px)',
    santaDownloadingBtn: '正在下载...',
    santaRandomBtn: '随机抽取',
    santaSearchPlaceholder: '输入 ID (1-10000)...',
    santaConfirm: '确定',
  },
  en: {
    // Brand & Navbar
    brandSub: 'Bitcoin Ordinals • 10,000 Inscription Collection',
    tabExplorer: 'Explorer',
    tabGif: 'Make GIF',
    tabDiy: 'DIY Studio',
    tabSanta: 'Santa Monkes',
    langSwitch: '中文',

    // Footer
    footerDesc: 'Official NodeMonkes All-in-One Ordinals Hub',
    footerSatflow: 'SatFlow Marketplace',
    footerOrdnet: 'Ord.net Marketplace',
    footerRights: '100% Client-Side Inscriptions Studio • 2026',

    // Explorer
    explorerBadge: '10,000 INSCRIPTIONS EXPLORER',
    explorerTitle: 'NodeMonkes Rarity & Traits Explorer',
    explorerSub: 'Instant search across 10,000 NodeMonkes for rarity rankings, inscription traits, and color analysis.',
    searchPlaceholder: 'Search ID, Inscription number, or traits (e.g. Gold, Beak)...',
    allBodies: 'All Body Types',
    sortBy: 'Sort By',
    sortRank: 'Rarity Rank',
    sortId: 'Monke ID',
    orderAsc: 'Ascending (Low to High)',
    orderDesc: 'Descending (High to Low)',
    totalFound: 'Total Monkes',
    perPage: 'Per Page',
    viewGrid: 'Grid View',
    viewTable: 'Table View',
    tableThImage: 'Image',
    tableThRank: 'Rarity Rank',
    tableThId: 'ID',
    tableThInscription: 'Inscription',
    tableThTraits: '4-Trait Breakdown & Rarity',
    tableThActions: 'Actions',
    actionMakeGif: 'Animate',
    actionSanta: 'Santa',
    actionDetails: 'Details',
    noResults: 'No NodeMonkes match your criteria',
    prevPage: 'Previous',
    nextPage: 'Next',

    // Detail Modal
    modalRank: 'Rarity Rank',
    modalInscription: 'Inscription Number',
    modalOwner: 'Owner ScriptPubKey',
    modalTraits: 'Traits & Rarity Percentages',
    modalColorPalette: 'Dominant Color Palette',
    modalCopySuccess: 'Copied to clipboard',
    modalOpenSatflow: 'Trade on SatFlow',
    modalOpenOrdnet: 'Trade on Ord.net',
    modalClose: 'Close',

    // GIF Studio
    gifBadge: 'NODEMONKES 36-FRAME GENUINE GIF STUDIO',
    gifTitle: 'NodeMonkes GIF Generator',
    gifSub: '100% authentic nodding animation engine, supporting 0.1x ~ 5.0x speed and multi-tier HD resolutions.',
    gifModeTitle: '1. Select Mode',
    gifModeClassic: 'Classic Edition',
    gifModeSanta: 'Santa Festive Edition',
    gifBgTitle: '2. Background Setting',
    gifBgNone: 'No Background (White)',
    gifBgAuto: 'Auto Body Color',
    gifBgCustom: 'Custom Color',
    gifSpeedTitle: '3. Animation Speed (0.1x ~ 5.0x)',
    gifSpeedSlow: '0.5x Slow',
    gifSpeedNormal: '1.0x Normal',
    gifSpeedFast: '2.0x Fast',
    gifSpeedUltra: '3.5x Ultra',
    gifSpeedExtreme: '5.0x Extreme',
    gifResTitle: '4. Output Resolution (100px ~ 1200px)',
    gifSearchPlaceholder: 'Enter ID (1-10000)...',
    gifConfirm: 'Go',
    gifRandom: 'Random',
    gifSaveBtn: 'Save Animated GIF',
    gifSavingBtn: 'Exporting GIF...',
    gifSuccess: 'GIF Generated Successfully!',
    gifSuccessDesc: 'Downloaded to your device',

    // DIY Studio
    diyBadge: 'OFFICIAL NODEMONKES DIY AVATAR CREATOR',
    diyTitle: 'NodeMonkes DIY Avatar Creator',
    diySub: '100% authentic 5 series layer engine. Freely customize Body, Earring, Eyes, Head with up to 4K Ultra HD export.',
    diyRandomBtn: '🎲 Randomize',
    diySaveBtn: '💾 Save Avatar',
    diySavingBtn: 'Rendering Avatar...',
    diyResTitle: 'Export Resolution:',
    diyBgTitle: 'Background Color',
    diyBgNone: 'Transparent',
    diyBgOrange: 'Orange',
    diyBgAuto: 'Auto Body Color',
    diyBgCustom: 'Custom Color',
    diySeriesTitle: 'Series Selection',
    diyCatBody: 'Body',
    diyCatEarring: 'Earring',
    diyCatEyes: 'Eyes',
    diyCatHead: 'Head',
    diyNotSupported: 'This series does not support this component',
    diyLoadingComponents: 'Loading components...',
    diySuccess: 'Avatar Saved Successfully!',
    diySuccessDesc: 'Lossless HD PNG downloaded',

    // Santa Studio
    santaBadge: 'NODEMONKES SANTA EDITION',
    santaTitle: 'NodeMonkes Santa Edition Studio',
    santaSub: '10,000 festive Santa-hat merged NodeMonkes with split comparison and lossless 1440px PNG download.',
    santaTabSingle: 'Santa Monke View',
    santaTabCompare: 'Original vs Santa Comparison',
    santaOriginalLabel: 'ORIGINAL CLASSIC',
    santaMergedLabel: 'SANTA EDITION',
    santaDownloadBtn: 'Download HD Santa Monke (1440px)',
    santaDownloadingBtn: 'Downloading...',
    santaRandomBtn: 'Random Monke',
    santaSearchPlaceholder: 'Enter ID (1-10000)...',
    santaConfirm: 'Go',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'zh',
  setLang: () => {},
  t: translations.zh,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nm_lang');
      if (saved === 'zh' || saved === 'en') return saved;
      // Default to Chinese as per requested primary audience
      return 'zh';
    }
    return 'zh';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nm_lang', newLang);
    }
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
