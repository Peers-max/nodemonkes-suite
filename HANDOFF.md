# 🐒 NodeMonkes All-in-One Suite — 工程交接与维护文档 (HANDOFF.md)

> 本文档旨在为后续维护者、开发者与 AI 协作 Agent 提供清晰详尽的系统架构、模块拆解、数据流向、开发调试与持续部署指南。

---

## 📑 目录
1. [项目背景与 4 合 1 整合总览](#1-项目背景与-4-合-1-整合总览)
2. [技术栈与核心依赖](#2-技术栈与核心依赖)
3. [目录与代码架构](#3-目录与代码架构)
4. [四大核心功能模块详解](#4-四大核心功能模块详解)
5. [数据流、静态资源与 CDN 策略](#5-数据流静态资源与-cdn-策略)
6. [本地开发与构建调试](#6-本地开发与构建调试)
7. [CI/CD 自动化构建与 GitHub Pages 部署](#7-cicd-自动化构建与-github-pages-部署)
8. [常见问题排查与日常维护 (Troubleshooting)](#8-常见问题排查与日常维护-troubleshooting)
9. [未来演进建议 (Roadmap)](#9-未来演进建议-roadmap)

---

## 1. 项目背景与 4 合 1 整合总览

**NodeMonkes** 是比特币 Ordinals 生态的顶级 10,000 像素头像艺术系列。此前，社区工具分散在 4 个独立的 GitHub 仓库中，各自为政，UI 简陋且缺乏联动。

本项目将这 4 个独立系统重构并合并为一个**统一架构、极高流畅度、暗黑赛博毛玻璃 UI 的单页应用（SPA）**：

| 原独立仓库 | 对应功能模块 | 迁移与整合实现 |
| :--- | :--- | :--- |
| `supercrypto1984/nodemonkes-browser` | **🔍 1. Explorer (主浏览器)** | 10,000 数据多维筛选、网格 (Grid) / 表格 (Table) 双视图秒切、稀有度彩色发光胶囊、Script PubKey 一键复制、详情弹窗。 |
| `supercrypto1984/nodemonkes-gif` | **🎬 2. GIF Studio (动态工坊)** | 纯前端 HTML5 Canvas 24 帧正弦插值点头动效、自动匹配肤色底色、透明背景、Web Worker 多线程 GIF 渲染导出。 |
| `supercrypto1984/diynm` | **🎨 3. DIY Studio (捏猴工坊)** | 原生 Canvas 图层拼装（Body, Head, Eyes, Earring, Background）、一键随机 (🎲 Randomize)、重置与 560px 高清无损 PNG 导出。 |
| `supercrypto1984/santa-nodemonkes` | **🎅 4. Santa Monkes (圣诞限定)** | 10,000 圣诞帽全集画廊、自定义节日色盘、多分辨率（280px / 560px / 1120px 4K）头像一键生成与下载。 |

---

## 2. 技术栈与核心依赖

| 类别 | 选用技术 | 版本 / 说明 | 选型优势 |
| :--- | :--- | :--- | :--- |
| **基础框架** | `React` + `TypeScript` | `React 18.3.1` / `TS 5.4.5` | 严格类型约束，组件高度模块化 |
| **构建工具** | `Vite` | `Vite 5.2.11` | 秒级 HMR 启动，打包体积极小（生产包 ~60KB） |
| **样式系统** | `Tailwind CSS` | `v3.4.4` | 原子化 CSS，无运行时开销，暗黑赛博风格深度定制 |
| **图标库** | `lucide-react` | `v0.344.0` | 现代轻量矢量图标，按需 Tree-shaking |
| **动态动图引擎** | `gif.js` + Web Worker | Worker 托管于 `/public/gif.worker.js` | 纯客户端离线生成 GIF，不占用服务器，不卡顿主线程 |

---

## 3. 目录与代码架构

```text
nodemonkes-suite/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动化构建部署至 GitHub Pages
├── public/
│   └── gif.worker.js           # GIF.js 后台多线程 Worker 脚本
├── src/
│   ├── components/
│   │   ├── diy/
│   │   │   └── DiyStudio.tsx   # DIY 捏猴换装画布与图层配置
│   │   ├── explorer/
│   │   │   ├── MonkeDetailModal.tsx # 节点猴大图、全属性、色板与链上公钥详情弹窗
│   │   │   └── MonkesExplorer.tsx   # 主画廊/数据表、筛选器、排序与分页组件
│   │   ├── gif/
│   │   │   └── GifStudio.tsx   # 动态 GIF 实时画布预览、调色盘与导出控制器
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # 顶部响应式导航栏、Tab 切换与全站快捷搜索
│   │   │   └── Footer.tsx      # 底部版权与 Web3 外部生态链接
│   │   ├── santa/
│   │   │   └── SantaStudio.tsx # 圣诞限定版画廊、色盘与多分辨率下载器
│   │   └── ui/
│   │       ├── Badge.tsx       # 稀有度百分比自适应发光胶囊
│   │       └── Toast.tsx       # 全局轻量通知提示系统
│   ├── types/
│   │   └── index.ts            # 全局 TypeScript 接口定义 (Monke, Attributes, Tabs)
│   ├── utils/
│   │   ├── api.ts              # 元数据拉取 (带内存缓存) 与色板提取
│   │   ├── constants.ts        # 33 种 Body 肤色、动画参数、CDN 地址与预置色盘
│   │   └── gifEngine.ts        # Canvas 帧插值计算与 GIF 生成器核心
│   ├── App.tsx                 # 根组件：全局状态管理、URL Query 同步与模块路由
│   ├── index.css               # Tailwind 注入、毛玻璃面板与像素渲染配置
│   └── main.tsx                # React 18 入口挂载
├── .gitignore
├── HANDOFF.md                  # 本工程交接维护文档
├── index.html                  # 宿主 HTML (配置字体、描述与像素图标)
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. 四大核心功能模块详解

### 4.1 🔍 Explorer（节点猴浏览器与稀有度大盘）
- **文件路径**：`src/components/explorer/MonkesExplorer.tsx`
- **核心逻辑**：
  - **搜索索引**：支持按数字 ID（1-10000）、铭文编号（`inscription`）、身体/头部属性进行大小写不敏感的实时模糊匹配。
  - **排序引擎**：支持按 `Rank (稀有度排名)`、`ID`、`Inscription #`、`Block Height` 正序/倒序排列。
  - **双视图秒切**：
    - `Grid View`：卡片式流式布局，自适应响应式（移动端 2 列，桌面 4~6 列），悬停放大动效；
    - `Table View`：高密度数据表，Script PubKey 自动截断并提供一键复制与已复制状态反馈。
  - **模块联动**：在详情弹窗中点击任意 Monke，可直接一键将当前 Monke ID 传参至 GIF 工坊或 Santa 模块。

### 4.2 🎬 GIF Studio（动态 GIF 工坊）
- **文件路径**：`src/components/gif/GifStudio.tsx` + `src/utils/gifEngine.ts`
- **核心逻辑**：
  - **24 帧正弦形变算法**：使用 `Math.sin(t) * rotationRange` 与 `1 - Math.abs(Math.sin(t)) * squashStrength` 模拟经典点头与微挤压。
  - **背景模式**：
    - `Transparent`：输出透明通道 GIF；
    - `Auto`：自动读取该 Monke 的 `Body` 属性在 `BODY_COLORS` 映射表中的官方色值进行铺底；
    - `Custom`：支持 8 种 Web3 预置色及原生 HTML5 取色器。
  - **导出优化**：调用 Web Worker 分片渲染，导出过程带有百分比进度条提示。

### 4.3 🎨 DIY Studio（节点猴捏猴换装）
- **文件路径**：`src/components/diy/DiyStudio.tsx`
- **核心逻辑**：
  - 基于 28x28 像素标准网格，按 10 倍无损放大（280x280 Canvas）进行层叠渲染：
    `Background → Body Base → Eyes/Visors → Headwear → Earrings`。
  - **🎲 Randomize**：从内置预设库中随机抽取组合，快速激发创作灵感。
  - **无损高清导出**：在导出时创建独立的 560x560 离屏 Canvas，`imageSmoothingEnabled = false` 导出高清 PNG 头像。

### 4.4 🎅 Santa Monkes（圣诞限定款画廊）
- **文件路径**：`src/components/santa/SantaStudio.tsx`
- **核心逻辑**：
  - 访问 `supercrypto1984/santa-nodemonkes` 官方图源（10,000 张圣诞帽合成图）。
  - 支持更换背景色、切换 `280px / 560px / 1120px` 三档分辨率并导出。

---

## 5. 数据流、静态资源与 CDN 策略

1. **元数据（Metadata）**：
   - 数据源：`https://pub-ce8a03b190984a3d99332e13b7d5e3cb.r2.dev/transformed_metadata.json`
   - 首次加载后自动存入 `cachedMonkes` 内存变量，全应用跨 Tab 切换不产生二次网络请求。
2. **图片资源（CDN）**：
   - 节点猴原图：`https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/{id}.png`
   - 圣诞款原图：`https://raw.githubusercontent.com/supercrypto1984/santa-nodemonkes/main/public/assets/merged/{id}.png`
   - 所有图片均开启 `crossOrigin = "anonymous"`，支持跨域 Canvas 像素读取与色板提取。
3. **URL 状态同步（Query-Driven Routing）**：
   - 格式：`https://domain/?tab=gif&id=209`
   - 通过 `window.history.pushState` 实时同步，刷新或分享链接可直接定位到特定模块与特定 Monke。

---

## 6. 本地开发与构建调试

### 6.1 前置环境
- Node.js >= 18.0.0 (推荐 Node v20 或 v24)
- npm >= 9.0.0

### 6.2 常用命令
```bash
# 1. 克隆代码
git clone https://github.com/Peers-max/nodemonkes-suite.git
cd nodemonkes-suite

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器 (默认端口 3000)
npm run dev

# 4. TypeScript 类型检查与生产编译
npm run build

# 5. 本地预览生产构建产物
npm run preview
```

---

## 7. CI/CD 自动化构建与 GitHub Pages 部署

本项目已在 `.github/workflows/deploy.yml` 中配置全自动流水线：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

- **部署触发**：向 `main` 分支执行 `git push` 时自动触发。
- **自定义域名绑定**：如需绑定独立域名，在仓库根目录添加 `CNAME` 文件（例如写入 `nodemonke.xyz`），并在域名 DNS 设置 CNAME 指向 `peers-max.github.io` 即可。

---

## 8. 常见问题排查与日常维护 (Troubleshooting)

### Q1: 图片加载出现 CORS 跨域错误？
- **原因**：通过 Canvas 提取像素色板或导出 GIF 时，如果图片服务器没有配置 `Access-Control-Allow-Origin: *` 会导致 Canvas 污染（Tainted Canvas）。
- **解决**：所有图片元素必须设置 `crossOrigin = "anonymous"`（代码中已统一封装在 `api.ts` 与 `gifEngine.ts` 中）。

### Q2: 导出 GIF 时控制台提示 `workerScript not found`？
- **原因**：`gif.worker.js` 未正确放置在 `public/` 静态资源目录。
- **解决**：确保 `public/gif.worker.js` 文件存在，构建后会自动复制到 `dist/gif.worker.js`。

### Q3: 属性百分比显示 NaN？
- **原因**：部分 Monke 属性值为 None 或缺少 `BodyCount` 字段。
- **解决**：`Badge.tsx` 中已做了 `percentage !== undefined` 的保护性断言，确保缺失数据时降级为普通标签显示。

---

## 9. 未来演进建议 (Roadmap)

1. **Web3 钱包连接与持仓筛选**：
   - 集成 Unisat / Xverse 比特币钱包连接；
   - 自动扫描用户钱包并一键筛选出“我拥有的 NodeMonkes”。
2. **多资产对比模式 (Compare Mode)**：
   - 允许用户勾选 2~4 个 Monke 进行并排稀有度、属性与外观对比。
3. **PWA 离线支持**：
   - 增加 Service Worker 缓存，支持无网环境下离线制作 GIF 与 DIY 头像。
