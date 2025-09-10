# 重楼网站 - Chonglou Website

一个基于 Vue 3 + TypeScript + Vite 的现代化网站项目，专注于重楼的药用价值与种植技术分享。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **UI组件库**: Element Plus
- **样式处理**: SCSS
- **包管理器**: pnpm
- **代码规范**: ESLint + Prettier + Stylelint

## 项目结构

```
src/
├── components/           # 通用组件
│   └── Layout.vue       # 页面布局组件
├── views/               # 页面组件
│   ├── HomeView.vue     # 首页
│   ├── ArticlesView.vue # 文章列表页
│   └── ArticleDetailView.vue # 文章详情页
├── stores/              # Pinia 状态管理
│   └── article.ts       # 文章相关状态
├── data/                # 模拟数据
│   └── mockData.ts      # Mock 文章数据
├── styles/              # 样式文件
│   ├── _variables.scss  # CSS变量和SCSS变量
│   ├── _mixins.scss     # SCSS混入
│   ├── global.scss      # 全局样式
│   └── element-override.scss # Element Plus样式覆盖
├── router/              # 路由配置
│   └── index.ts         # 路由定义
└── main.ts              # 应用入口
```

## 第一阶段完成情况

### ✅ 任务 1.1：项目初始化与依赖配置
- 使用 `pnpm` 作为包管理工具
- 使用 `Vite` 初始化 Vue 3 + TypeScript 项目
- 集成 `Pinia`、`Vue Router`、`Element Plus`
- 项目可正常运行 (`pnpm install` 和 `pnpm run dev`)

### ✅ 任务 1.2：代码规范化与自动化
- 配置 `ESLint`、`Prettier`、`Stylelint`
- 集成 `Standardjs` 规范和 Vue/Element Plus 相关规则
- 配置文件：`.eslintrc.cjs`、`.prettierrc`、`.stylelintrc.cjs`

### ✅ 任务 1.3：基础响应式布局与路由实现
- 实现通用 `Layout` 组件（含导航栏和页脚）
- 定义三个核心路由：`/`、`/articles`、`/articles/:id`
- 使用 CSS Flexbox 实现响应式布局
- 支持移动端适配

### ✅ 任务 1.4：Mock 数据与 Pinia Store
- 创建 Mock 文章数据 (`src/data/mockData.ts`)
- 实现 `article` Pinia Store 模块
- 在文章列表页展示 Mock 数据

### ✅ 任务 1.5：UI样式
- **优先使用 CSS Variables** 定义主题色、背景色、边框色等
- **使用 SCSS 预处理器** 编写样式文件
- **采用官方推荐的 `@use` 语法** 替代 `@import`
- 实现全局样式系统和 Element Plus 样式覆盖
- 支持暗黑模式变量预设

## 样式系统特点

1. **CSS Variables 优先**: 主题色、字体、间距等都通过 CSS 自定义属性定义
2. **现代 SCSS 语法**: 使用 `@use` 替代 `@import`，更好的模块化
3. **响应式设计**: 内置移动端、平板、桌面端适配
4. **Element Plus 定制**: 深度定制 Element Plus 组件样式
5. **暗黑模式支持**: 预设暗黑模式 CSS 变量

## 开发指令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产版本
pnpm run preview

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 样式检查
pnpm run lint:style
```

## 浏览器支持

- Chrome ≥ 87
- Firefox ≥ 78
- Safari ≥ 14
- Edge ≥ 88

## 开发环境

- Node.js ≥ 18
- pnpm ≥ 8

---

*第一阶段开发已完成，接下来将进入第二阶段的核心功能开发。*
