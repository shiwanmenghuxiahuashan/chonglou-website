export interface Article {
  id: number
  title: string
  summary: string
  content: string
  author: string
  publishDate: string
  tags: string[]
}

export const mockArticles: Article[] = [
  {
    id: 1,
    title: 'Vue 3 Composition API 深度解析',
    summary: 'Vue 3 引入的 Composition API 为组件开发带来了新的编程范式，本文深入探讨其核心概念和最佳实践。',
    content: `# Vue 3 Composition API 深度解析

## 什么是 Composition API

Composition API 是 Vue 3 中引入的一套新的 API，它提供了一种更灵活的方式来组织组件逻辑。与传统的 Options API 相比，Composition API 具有更好的逻辑复用性和类型推导能力。

## 核心概念

### reactive 和 ref
\`\`\`javascript
import { reactive, ref } from 'vue'

// 使用 reactive 创建响应式对象
const state = reactive({
  count: 0,
  name: 'Vue 3'
})

// 使用 ref 创建响应式引用
const message = ref('Hello World')
\`\`\`

### computed 和 watch
\`\`\`javascript
import { computed, watch } from 'vue'

const doubledCount = computed(() => state.count * 2)

watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log(\`count changed from \${oldValue} to \${newValue}\`)
  }
)
\`\`\`

## 最佳实践

1. 优先使用 \`ref\` 处理基本类型
2. 使用 \`reactive\` 处理对象类型
3. 合理组织可复用的逻辑
4. 充分利用 TypeScript 类型推导

Composition API 让我们能够更好地组织代码，提高开发效率和代码质量。`,
    author: '李重楼',
    publishDate: '2025-01-15',
    tags: ['Vue.js', 'Composition API', '前端开发']
  },
  {
    id: 2,
    title: 'TypeScript 在大型前端项目中的应用实践',
    summary: '详细介绍 TypeScript 在大型前端项目中的配置、类型设计、最佳实践等关键技术要点。',
    content: `# TypeScript 在大型前端项目中的应用实践

## 为什么选择 TypeScript

TypeScript 为 JavaScript 添加了静态类型检查，能够在开发阶段发现潜在的错误，提高代码质量和开发效率。

## 项目配置

### tsconfig.json 配置
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true
  }
}
\`\`\`

## 类型设计最佳实践

### 接口定义
\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
\`\`\`

### 泛型使用
\`\`\`typescript
function createApiClient<T>() {
  return {
    get: (url: string): Promise<ApiResponse<T>> => {
      // 实现
    }
  }
}
\`\`\`

TypeScript 让大型项目的维护变得更加轻松，类型安全性显著提升。`,
    author: '前端架构师',
    publishDate: '2025-01-20',
    tags: ['TypeScript', '大型项目', '类型安全']
  },
  {
    id: 3,
    title: 'Vite 构建工具深度优化指南',
    summary: '分析 Vite 在现代前端工程化中的优势，以及如何进行深度优化来提升开发和构建效率。',
    content: `# Vite 构建工具深度优化指南

## Vite 的核心优势

Vite 基于原生 ES 模块和 esbuild，提供了极快的冷启动速度和热更新体验。

## 开发环境优化

### 依赖预构建
\`\`\`javascript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['lodash-es', 'axios'],
    exclude: ['@my/lib']
  }
})
\`\`\`

### 热更新配置
\`\`\`javascript
export default defineConfig({
  server: {
    hmr: {
      overlay: false
    }
  }
})
\`\`\`

## 生产环境优化

### 代码分割
\`\`\`javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus']
        }
      }
    }
  }
})
\`\`\`

### 资源优化
\`\`\`javascript
export default defineConfig({
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
\`\`\`

通过这些优化策略，可以显著提升 Vite 项目的性能表现。`,
    author: '构建工程师',
    publishDate: '2025-02-01',
    tags: ['Vite', '构建优化', '前端工程化']
  },
  {
    id: 4,
    title: 'Pinia 状态管理最佳实践',
    summary: '深入研究 Pinia 的核心特性，包括状态定义、Actions、Getters 等高级用法和性能优化技巧。',
    content: `# Pinia 状态管理最佳实践

## Pinia vs Vuex

Pinia 是 Vue 官方推荐的新一代状态管理库，具有更好的 TypeScript 支持和更简洁的 API。

## Store 定义

### 基础 Store
\`\`\`typescript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  
  const login = async (credentials: LoginCredentials) => {
    const response = await api.login(credentials)
    user.value = response.data
  }
  
  const logout = () => {
    user.value = null
  }
  
  return {
    user,
    isLoggedIn,
    login,
    logout
  }
})
\`\`\`

### 模块化管理
\`\`\`typescript
// stores/modules/user.ts
export const useUserStore = defineStore('user', () => {
  // 用户相关状态和方法
})

// stores/modules/app.ts
export const useAppStore = defineStore('app', () => {
  // 应用相关状态和方法
})
\`\`\`

## 性能优化

### 状态持久化
\`\`\`typescript
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const theme = useLocalStorage('theme', 'light')
  const language = useLocalStorage('language', 'zh-CN')
  
  return { theme, language }
})
\`\`\`

Pinia 让状态管理变得更加直观和类型安全。`,
    author: '状态管理专家',
    publishDate: '2025-02-10',
    tags: ['Pinia', '状态管理', 'Vue.js']
  },
  {
    id: 5,
    title: 'Element Plus 组件库深度定制与主题开发',
    summary: '探讨 Element Plus 在现代 Vue 项目中的深度定制方案，包括主题系统、组件扩展和性能优化。',
    content: `# Element Plus 组件库深度定制与主题开发

## 主题系统设计

Element Plus 提供了强大的主题定制能力，支持 CSS 变量和 SCSS 变量两种方式。

## CSS 变量定制

### 基础主题变量
\`\`\`css
:root {
  --el-color-primary: #667eea;
  --el-color-success: #28a745;
  --el-color-warning: #ffc107;
  --el-color-danger: #dc3545;
  --el-color-info: #17a2b8;
}
\`\`\`

### 暗黑模式支持
\`\`\`css
[data-theme="dark"] {
  --el-bg-color: #1a1a1a;
  --el-text-color-primary: #e8eaed;
  --el-border-color: #404040;
}
\`\`\`

## 组件深度定制

### 全局样式覆盖
\`\`\`scss
.el-button {
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  
  &.el-button--primary {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-medium);
    }
  }
}
\`\`\`

### 按需导入优化
\`\`\`typescript
// 自动导入配置
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
\`\`\`

## 性能优化技巧

1. 使用按需导入减少包体积
2. 合理使用 CSS 变量提升主题切换性能  
3. 避免过度定制影响组件更新

通过这些技巧，可以打造出既美观又高效的 UI 组件库。`,
    author: 'UI 工程师',
    publishDate: '2025-02-15',
    tags: ['Element Plus', 'UI组件', '主题定制']
  },
  {
    id: 6,
    title: '现代前端性能优化实战指南',
    summary: '全面分析现代前端性能优化策略，包括代码分割、懒加载、缓存策略等核心技术。',
    content: `# 现代前端性能优化实战指南

## 性能优化的重要性

随着用户对 Web 应用体验要求的提高，前端性能优化变得越来越重要。良好的性能不仅提升用户体验，还能提高 SEO 排名和转化率。

## 核心优化策略

### 代码分割
\`\`\`typescript
// 路由级别的代码分割
const routes = [
  {
    path: '/home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]
\`\`\`

### 组件懒加载
\`\`\`vue
<template>
  <div>
    <Suspense>
      <template #default>
        <LazyComponent />
      </template>
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </div>
</template>

<script setup>
const LazyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
</script>
\`\`\`

### 资源预加载
\`\`\`html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 资源预加载 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="prefetch" href="/non-critical.js" as="script">
\`\`\`

## 缓存策略

### HTTP 缓存
\`\`\`javascript
// Service Worker 缓存策略
self.addEventListener('fetch', event => {
  if (event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request)
      })
    )
  }
})
\`\`\`

### 浏览器缓存
\`\`\`javascript
// Vite 构建配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'js/[name].[hash].js'
      }
    }
  }
})
\`\`\`

## 监控与分析

使用 Lighthouse、WebPageTest 等工具进行性能监控和分析，持续优化应用性能。

性能优化是一个持续的过程，需要结合具体业务场景选择合适的优化策略。`,
    author: '性能优化专家',
    publishDate: '2025-02-20',
    tags: ['性能优化', 'Web Performance', '前端工程化']
  }
]
