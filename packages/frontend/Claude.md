# Claude.md - 宠物校园登记网站前端项目（更新版）

## 项目概述

**项目名称**：PawCampus - 宠物校园登记系统
**目标**：为校园内的宠物（学生宠物、校园流浪猫狗等）提供信息登记与展示平台。前端需实现现代化、高视觉冲击力的交互体验，强调"高级显示"效果，包括玻璃态 UI、3D 元素、流畅动画及响应式布局。

**核心功能（依据最新需求）**：
1. **首页大屏轮播**：进入页面后，顶部展示横向自动切换的可爱宠物图片（狗狗、猫咪等），采用全宽/大尺寸展示，营造视觉冲击。
2. **动物学生展示区**：轮播图下方展示"动物学生"卡片列表，每张卡片包含宠物可爱照片、姓名、学号、年龄、体重等简略信息，采用网格布局。
3. **详情查看**：点击任意宠物卡片，跳转至该宠物的详细信息页面，展示完整资料（包括疫苗接种状态、主人信息、健康记录等）。
4. 后续可扩展：宠物登记表单、校园地图、数据看板等。

**技术定位**：纯前端应用，通过 RESTful API 与后端交互，使用 Mock 数据或真实 API。

---

## 技术栈

| 类别       | 技术选型                        | 说明                                                         |
| ---------- | ------------------------------- | ------------------------------------------------------------ |
| 核心框架   | React 18 + TypeScript           | 类型安全，组件化开发                                         |
| 构建工具   | Vite                            | 快速开发与构建                                               |
| 样式方案   | TailwindCSS + CSS Modules       | 原子化样式 + 组件级隔离，配合自定义设计系统                  |
| UI 组件库   | Radix UI (无样式) + Headless UI | 保证完全定制化外观，结合 Tailwind 实现高级视觉效果             |
| 动画与交互 | Framer Motion + GSAP            | Framer Motion 用于 React 组件动画，GSAP 实现复杂滚动/3D 动画      |
| 3D 图形     | Three.js + React Three Fiber    | 创建 3D 背景、宠物模型或装饰元素                               |
| 状态管理   | Zustand + React Query           | Zustand 管理 UI 状态（主题、模态框等），React Query 管理服务端状态 |
| 表单管理   | React Hook Form + Zod           | 高性能表单验证，Zod 定义数据模型                              |
| 路由       | React Router v6                 | 实现多页面导航，支持动态路由                                 |
| 地图       | Leaflet + React Leaflet         | 展示宠物登记地点，可集成 Mapbox 瓦片                           |
| HTTP 客户端 | Axios / Fetch                   | 与后端 API 交互，统一错误处理                                  |
| 代码规范   | ESLint + Prettier + Husky       | 保证代码质量                                                 |

---

## 项目目录结构

```
packages/fronted/
├── public/
│   ├── models/             # 3D 模型文件（glTF/glb）
│   ├── images/             # 轮播图、宠物头像等图片
│   └── icons/
├── src/
│   ├── assets/             # 图片、字体等
│   ├── components/         # 可复用组件
│   │   ├── ui/             # 基础 UI 组件（Button, Card, Modal 等）
│   │   ├── carousel/       # 大屏轮播图组件（HeroCarousel）
│   │   ├── petCard/        # 宠物卡片组件（PetCard）
│   │   ├── petList/        # 宠物列表组件（PetGrid）
│   │   ├── forms/          # 表单相关组件
│   │   ├── layout/         # 布局组件（Header, Footer）
│   │   ├── 3d/             # Three.js 相关组件（可选背景）
│   │   └── maps/           # 地图相关组件（可选）
│   ├── pages/              # 页面级组件
│   │   ├── HomePage/       # 首页：大屏轮播 + 宠物网格
│   │   ├── PetDetailPage/  # 宠物详情页
│   │   ├── RegisterPage/   # 宠物登记页面（后续）
│   │   └── MapPage/        # 校园地图页面（后续）
│   ├── hooks/              # 自定义 Hook
│   │   ├── usePets.ts      # 获取宠物列表数据
│   │   ├── usePetDetail.ts # 获取单个宠物详情
│   │   └── useTheme.ts     # 主题切换
│   ├── store/              # Zustand 状态管理
│   │   ├── uiStore.ts      # UI 状态（侧边栏、模态框、主题）
│   │   └── petStore.ts     # 宠物本地缓存/筛选状态
│   ├── services/           # API 调用封装
│   │   ├── apiClient.ts    # Axios 实例
│   │   └── petService.ts   # 宠物相关 API
│   ├── types/              # TypeScript 类型定义
│   │   └── pet.ts          # 宠物实体类型（含学号字段）
│   ├── utils/              # 工具函数
│   │   ├── formatters.ts   # 日期、疫苗状态格式化
│   │   └── validators.ts   # 自定义验证器
│   ├── styles/             # 全局样式
│   │   ├── globals.css     # Tailwind 注入及自定义 CSS 变量
│   │   └── animations.css  # 关键帧动画定义
│   ├── App.tsx             # 根组件（路由配置）
│   ├── main.tsx            # 入口文件
│   └── vite-env.d.ts
├── index.html
├── tailwind.config.js      # Tailwind 配置（主题扩展、插件）
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 类型定义（关键）

在 `types/pet.ts` 中定义宠物实体，包含"学号"字段：

```typescript
export interface Pet {
  id: string;
  name: string;           // 宠物姓名
  studentId: string;      // 学号（例如 "P20240001"）
  species: string;        // 种类（狗、猫等）
  breed?: string;         // 品种
  age: number;            // 年龄（月或年，统一单位）
  weight: number;         // 体重（kg）
  gender: 'male' | 'female';
  photoUrl: string;       // 可爱照片 URL
  description?: string;   // 简介
  // 详细信息字段（详情页展示）
  ownerName?: string;
  ownerContact?: string;
  vaccinationDate?: string;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  healthStatus?: string;
  // 其他...
}
```

## 首页实现规范

### 1. 大屏轮播图（HeroCarousel）

- **位置**：`components/carousel/HeroCarousel.tsx`
- **实现方式**：使用 `swiper` 或 `react-slick` 库，配置自动播放、循环、过渡动画。
- **视觉效果**：
  - 图片全宽、固定高度（如 `h-screen` 或 `h-[80vh]`），图片对象覆盖（`object-cover`）。
  - 叠加玻璃态渐变遮罩，提升文字可读性。
  - 轮播图上方可放置标题和标语（如"欢迎来到 PawCampus"）。
  - 支持手势滑动（移动端）和鼠标拖拽。
- **数据来源**：初期使用静态图片数组（存放于 `public/images/carousel/`），后续可改为 API 动态获取热门宠物图片。
- **自动切换**：间隔 3-5 秒，提供手动切换箭头和指示点。

### 2. 动物学生展示区（PetGrid）

- **位置**：`components/petList/PetGrid.tsx`
- **布局**：响应式网格，桌面端 3-4 列，平板 2 列，手机 1 列。卡片间距适中，使用玻璃态卡片。
- **卡片组件**：`components/petCard/PetCard.tsx`
  - 显示宠物可爱照片（圆角或圆形，根据设计定）。
  - 下方展示简略信息：姓名、学号、年龄、体重。
  - 悬浮效果：卡片上浮、边框发光、阴影加深，点击区域为整个卡片。
  - 点击卡片触发路由跳转至 `/pets/:id`。
- **数据获取**：使用 `usePets` Hook（基于 React Query）从 `/api/pets` 获取宠物列表，支持分页加载（无限滚动或"加载更多"按钮）。
- **筛选排序**：可在网格上方添加筛选栏（按种类、疫苗接种状态等），但第一阶段可简单展示所有"动物学生"。

### 3. 页面结构（HomePage）

```tsx
// pages/HomePage/index.tsx
import HeroCarousel from '@/components/carousel/HeroCarousel';
import PetGrid from '@/components/petList/PetGrid';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          动物学生
        </h2>
        <PetGrid />
      </section>
    </div>
  );
}
```

## 宠物详情页（PetDetailPage）

- **路由**：`/pets/:id`
- **功能**：
  - 展示宠物高清大图（或轮播图）。
  - 展示详细信息：姓名、学号、种类、品种、年龄、体重、性别、主人信息、疫苗接种状态、是否绝育、健康备注等。
  - 使用玻璃态卡片分组展示。
  - 如果已登录用户，可提供"编辑"或"申请领养"按钮（后续）。
- **数据获取**：`usePetDetail(id)` 从 `/api/pets/:id` 获取。

------

## 高级视觉效果补充

在满足核心功能的同时，继续沿用之前设计的高端视觉效果，使项目脱颖而出：

- **全局 3D 背景**（可选）：使用 Three.js 渲染一个轻量级旋转几何体，置于页面底层，增强科技感。
- **粒子特效**：在轮播图区域添加跟随鼠标的粒子效果。
- **滚动动画**：宠物卡片列表在滚动时逐个淡入上浮（Framer Motion）。
- **页面转场**：路由切换时使用滑动淡入淡出。
- **悬停光效**：卡片悬停时出现渐变边框光晕。

------

## 数据流与 API 约定

### 宠物列表接口

```
GET /api/pets?page=1&limit=12
响应格式：
{
  data: Pet[],
  total: number,
  page: number,
  totalPages: number
}
```

### 宠物详情接口

```
GET /api/pets/:id
响应格式：Pet 对象
```

### 轮播图图片接口（可选）

```
GET /api/carousel/images
响应格式：{ images: string[] }
```

初期可使用静态数据模拟。

## 开发状态

### 已完成功能

- [x] 项目初始化（React 18 + TypeScript + Vite + TailwindCSS）
- [x] 全局样式（玻璃态效果、渐变边框、滚动条美化）
- [x] 类型定义（Pet 实体、API 响应类型）
- [x] API 客户端（Axios 实例、拦截器、错误处理）
- [x] 服务层（petService 封装）
- [x] 自定义 Hooks（usePets、usePetDetail）
- [x] 状态管理（Zustand UI Store）
- [x] 组件：HeroCarousel（大屏轮播）、PetCard（宠物卡片）、PetGrid（宠物网格）
- [x] 布局组件：Header、Footer
- [x] 页面：HomePage、PetDetailPage
- [x] 路由配置（React Router v6）
- [x] React Query 数据获取

### 下一步

1. 添加 Mock 数据用于测试（或使用后端 API）
2. 完善宠物登记页面（RegisterPage）
3. 添加校园地图页面（MapPage）
4. 实现用户登录功能
5. 添加 3D 背景效果（Three.js）

---

## 注意事项

- **图片资源**：轮播图和宠物照片应使用高分辨率图片，优化加载速度（使用 Next.js 的 Image 组件或普通 img 的懒加载）。
- **移动端适配**：确保轮播图和卡片布局在手机端显示良好，触摸滑动流畅。
- **无障碍**：为轮播图添加 `aria-label`，卡片可键盘聚焦。

