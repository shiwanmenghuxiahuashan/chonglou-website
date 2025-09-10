import type {
  Article,
  ArticleDetail,
  ArticleQueryParams,
  PaginatedResponse
} from '@/types/article'
import { chonglouDataLayer } from '@/lib/chonglouDataLayer'
import type { HttpResponse } from '@/lib/chonglouDataLayer'

/**
 * 获取文章列表
 * @param params 查询参数
 * @returns 分页文章列表
 */
export const getArticles = async (
  params: ArticleQueryParams = {}
): Promise<PaginatedResponse<Article>> => {
  try {
    // 使用新的 HTTP 客户端，支持缓存和重试
    const response: HttpResponse<PaginatedResponse<Article>> =
      await chonglouDataLayer.get('/articles', {
        params,
        cache: true, // 启用缓存
        cacheTime: 5 * 60 * 1000, // 缓存5分钟
        throttle: 500 // 500ms节流
      })

    return response.data
  } catch (error) {
    // 降级到模拟数据
    console.warn('API请求失败，使用模拟数据:', error)
    return getMockArticles(params)
  }
}

/**
 * 模拟数据 - 当 API 不可用时使用
 */
const getMockArticles = async (
  params: ArticleQueryParams = {}
): Promise<PaginatedResponse<Article>> => {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  const mockArticles: Article[] = [
    {
      id: 1,
      title: 'Vue 3 Composition API 深度解析',
      summary:
        '深入理解 Vue 3 的 Composition API，掌握响应式原理和组合式函数的最佳实践。',
      content: '',
      tags: ['Vue3', 'Composition API', '前端框架'],
      category: 'frontend',
      author: {
        id: 1,
        name: '重楼',
        avatar: '/avatars/author1.jpg'
      },
      publishedAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
      readCount: 1285,
      likeCount: 89,
      commentCount: 23,
      featured: true,
      status: 'published'
    },
    {
      id: 2,
      title: 'TypeScript 进阶技巧与最佳实践',
      summary: '探索 TypeScript 的高级特性，包括条件类型、映射类型和装饰器等。',
      content: '',
      tags: ['TypeScript', '类型系统', '进阶'],
      category: 'frontend',
      author: {
        id: 1,
        name: '重楼',
        avatar: '/avatars/author1.jpg'
      },
      publishedAt: '2024-03-10T14:30:00Z',
      updatedAt: '2024-03-10T14:30:00Z',
      readCount: 892,
      likeCount: 67,
      commentCount: 15,
      featured: false,
      status: 'published'
    },
    {
      id: 3,
      title: 'Vite 构建工具深度优化指南',
      summary: '从配置到插件开发，全面解析 Vite 的构建优化策略。',
      content: '',
      tags: ['Vite', '构建工具', '性能优化'],
      category: 'tools',
      author: {
        id: 1,
        name: '重楼',
        avatar: '/avatars/author1.jpg'
      },
      publishedAt: '2024-03-05T09:15:00Z',
      updatedAt: '2024-03-05T09:15:00Z',
      readCount: 634,
      likeCount: 45,
      commentCount: 8,
      featured: true,
      status: 'published'
    },
    {
      id: 4,
      title: 'Pinia 状态管理实战应用',
      summary: '学习如何在大型 Vue 应用中使用 Pinia 进行状态管理。',
      content: '',
      tags: ['Pinia', '状态管理', 'Vue生态'],
      category: 'frontend',
      author: {
        id: 1,
        name: '重楼',
        avatar: '/avatars/author1.jpg'
      },
      publishedAt: '2024-02-28T16:45:00Z',
      updatedAt: '2024-02-28T16:45:00Z',
      readCount: 756,
      likeCount: 52,
      commentCount: 12,
      featured: false,
      status: 'published'
    },
    {
      id: 5,
      title: 'Element Plus 组件库定制与扩展',
      summary: '深入了解如何定制 Element Plus 主题和扩展组件功能。',
      content: '',
      tags: ['Element Plus', 'UI组件', '主题定制'],
      category: 'ui',
      author: {
        id: 1,
        name: '重楼',
        avatar: '/avatars/author1.jpg'
      },
      publishedAt: '2024-02-20T11:20:00Z',
      updatedAt: '2024-02-20T11:20:00Z',
      readCount: 423,
      likeCount: 31,
      commentCount: 6,
      featured: false,
      status: 'published'
    },
    {
      id: 6,
      title: '前端性能优化综合指南',
      summary: '从代码分割到缓存策略，全方位提升前端应用性能。',
      content: '',
      tags: ['性能优化', '代码分割', '缓存策略'],
      category: 'performance',
      author: {
        id: 1,
        name: '重楼',
        avatar: '/avatars/author1.jpg'
      },
      publishedAt: '2024-02-15T13:00:00Z',
      updatedAt: '2024-02-15T13:00:00Z',
      readCount: 1156,
      likeCount: 78,
      commentCount: 19,
      featured: true,
      status: 'published'
    }
  ]

  // 应用过滤和分页逻辑（保持原有逻辑）
  let filteredArticles = mockArticles

  if (params.category) {
    filteredArticles = filteredArticles.filter(
      article => article.category === params.category
    )
  }

  if (params.tags && params.tags.length > 0) {
    filteredArticles = filteredArticles.filter(article =>
      params.tags!.some(tag => article.tags.includes(tag))
    )
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredArticles = filteredArticles.filter(
      article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower)
    )
  }

  if (params.status !== 'all') {
    filteredArticles = filteredArticles.filter(
      article => article.status === 'published'
    )
  }

  if (params.sortBy) {
    filteredArticles.sort((a, b) => {
      const field = params.sortBy!
      const order = params.sortOrder === 'desc' ? -1 : 1

      if (field === 'publishedAt') {
        return (
          order *
          (new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime())
        )
      }
      if (field === 'readCount') {
        return order * (b.readCount - a.readCount)
      }
      if (field === 'likeCount') {
        return order * (b.likeCount - a.likeCount)
      }
      return 0
    })
  }

  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedArticles = filteredArticles.slice(start, end)

  return {
    data: paginatedArticles,
    pagination: {
      page,
      pageSize,
      total: filteredArticles.length,
      totalPages: Math.ceil(filteredArticles.length / pageSize)
    }
  }
}

/**
 * 获取文章详情
 * @param id 文章ID
 * @returns 文章详情
 */
export const getArticleDetail = async (id: number): Promise<ArticleDetail> => {
  try {
    // 使用新的 HTTP 客户端
    const response: HttpResponse<ArticleDetail> = await chonglouDataLayer.get(
      `/articles/${id}`,
      {
        cache: true,
        cacheTime: 10 * 60 * 1000, // 缓存10分钟
        requestId: `article-detail-${id}` // 可取消的请求ID
      }
    )

    return response.data
  } catch (error) {
    // 降级到模拟数据
    console.warn('API请求失败，使用模拟数据:', error)
    return getMockArticleDetail(id)
  }
}

/**
 * 模拟文章详情数据
 */
const getMockArticleDetail = async (id: number): Promise<ArticleDetail> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  try {
    // Mock 数据 - 实际项目中这里会调用真实 API
    const mockArticleDetail: ArticleDetail = {
      id,
      title: `Vue 3 Composition API 深度解析`,
      summary:
        '深入理解 Vue 3 的 Composition API，掌握响应式原理和组合式函数的最佳实践。',
      content: `# Vue 3 Composition API 深度解析

## 引言

Vue 3 的 Composition API 是一个重大的改进，它为开发者提供了更灵活的组件逻辑组织方式。

## 什么是 Composition API

Composition API 是 Vue 3 中新增的一组 API，它允许我们通过导入函数的方式来使用 Vue 的响应式特性和生命周期等功能。

### 核心概念

1. **响应式引用 (ref)**
2. **响应式对象 (reactive)**
3. **计算属性 (computed)**
4. **侦听器 (watch)**

## 基础用法

\`\`\`javascript
import { ref, reactive, computed, watch } from 'vue'

export default {
  setup() {
    // 响应式引用
    const count = ref(0)
    
    // 响应式对象
    const state = reactive({
      name: '重楼',
      age: 25
    })
    
    // 计算属性
    const doubleCount = computed(() => count.value * 2)
    
    // 侦听器
    watch(count, (newValue, oldValue) => {
      console.log(\`count changed from \${oldValue} to \${newValue}\`)
    })
    
    return {
      count,
      state,
      doubleCount
    }
  }
}
\`\`\`

## 高级技巧

### 自定义组合式函数

\`\`\`javascript
// composables/useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = initialValue
  }
  
  return {
    count,
    increment,
    decrement,
    reset
  }
}
\`\`\`

### 生命周期钩子

\`\`\`javascript
import { onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    onUnmounted(() => {
      console.log('组件即将卸载')
    })
  }
}
\`\`\`

## 最佳实践

1. **逻辑复用**: 将相关逻辑封装成自定义组合式函数
2. **类型安全**: 结合 TypeScript 使用，提供更好的类型推导
3. **性能优化**: 合理使用 computed 和 watch

## 总结

Composition API 为 Vue 3 带来了更强大的逻辑复用能力和更好的 TypeScript 支持，是现代 Vue 开发的重要组成部分。
`,
      tags: ['Vue3', 'Composition API', '前端框架'],
      category: 'frontend',
      author: {
        id: 1,
        name: '重楼',
        avatar: '/avatars/author1.jpg',
        bio: '前端开发工程师，专注于 Vue.js 生态和现代前端技术'
      },
      publishedAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
      readCount: 1285,
      likeCount: 89,
      commentCount: 23,
      featured: true,
      status: 'published',
      seo: {
        metaTitle: 'Vue 3 Composition API 深度解析 - 重楼前端技术分享',
        metaDescription:
          '深入理解 Vue 3 的 Composition API，掌握响应式原理和组合式函数的最佳实践。',
        keywords: ['Vue3', 'Composition API', '前端框架', '响应式编程']
      },
      relatedArticles: [
        {
          id: 2,
          title: 'TypeScript 进阶技巧与最佳实践',
          summary:
            '探索 TypeScript 的高级特性，包括条件类型、映射类型和装饰器等。'
        },
        {
          id: 4,
          title: 'Pinia 状态管理实战应用',
          summary: '学习如何在大型 Vue 应用中使用 Pinia 进行状态管理。'
        }
      ]
    }

    return mockArticleDetail
  } catch (error) {
    console.error('获取文章详情失败:', error)
    throw new Error('获取文章详情失败')
  }
}

/**
 * 获取热门文章
 * @param limit 限制数量
 * @returns 热门文章列表
 */
export const getPopularArticles = async (limit = 5): Promise<Article[]> => {
  try {
    const response: HttpResponse<Article[]> = await chonglouDataLayer.get(
      '/articles/popular',
      {
        params: { limit },
        cache: true,
        cacheTime: 15 * 60 * 1000, // 缓存15分钟
        throttle: 1000 // 1秒节流
      }
    )

    return response.data
  } catch (error) {
    // 降级处理
    const fallbackResponse = await getArticles({
      sortBy: 'readCount',
      sortOrder: 'desc',
      pageSize: limit
    })
    return fallbackResponse.data
  }
}

/**
 * 获取精选文章
 * @param limit 限制数量
 * @returns 精选文章列表
 */
export const getFeaturedArticles = async (limit = 3): Promise<Article[]> => {
  try {
    const response: HttpResponse<Article[]> = await chonglouDataLayer.get(
      '/articles/featured',
      {
        params: { limit },
        cache: true,
        cacheTime: 30 * 60 * 1000 // 缓存30分钟
      }
    )

    return response.data
  } catch (error) {
    // 降级处理
    const fallbackResponse = await getArticles({
      pageSize: 20 // 获取更多文章进行筛选
    })
    return fallbackResponse.data
      .filter(article => article.featured)
      .slice(0, limit)
  }
}

/**
 * 搜索文章
 * @param query 搜索关键词
 * @param options 搜索选项
 * @returns 搜索结果
 */
export const searchArticles = async (
  query: string,
  options: Partial<ArticleQueryParams> = {}
): Promise<PaginatedResponse<Article>> => {
  try {
    const response: HttpResponse<PaginatedResponse<Article>> =
      await chonglouDataLayer.get('/articles/search', {
        params: { q: query, ...options },
        debounce: 500, // 500ms防抖
        cache: true,
        cacheTime: 2 * 60 * 1000 // 缓存2分钟
      })

    return response.data
  } catch (error) {
    // 降级到本地搜索
    return getArticles({
      search: query,
      ...options
    })
  }
}

// 导出 HTTP 客户端实例，供其他服务使用
export { chonglouDataLayer as apiClient }
