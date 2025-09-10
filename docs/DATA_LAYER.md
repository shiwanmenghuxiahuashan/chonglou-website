# 数据层架构使用文档

## 概述

这是一个功能完备、可扩展且与任何前端框架无关的通用数据层。采用 TypeScript 编写，严格遵循模块化、高内聚、低耦合的设计原则。

## 核心特性

### 🚀 核心功能
- ✅ 与框架无关的纯 TypeScript 实现
- ✅ 完整的 TypeScript 类型支持
- ✅ RESTful 风格的 HTTP 方法
- ✅ 原生 Promise 支持
- ✅ 模块化插件系统

### 🔒 认证与安全
- ✅ 自动 Token 管理
- ✅ Token 自动刷新机制
- ✅ 安全的本地存储
- ✅ 请求自动认证

### 🔌 插件系统
- ✅ 基于 web-memcache 的智能缓存
- ✅ 自动重试机制
- ✅ 统一错误处理
- ✅ 请求/响应拦截器链

### ⚡ 性能优化
- ✅ 竞态守卫
- ✅ 请求节流与防抖
- ✅ 请求取消功能
- ✅ 内存优化缓存策略

## 快速开始

### 1. 基础用法

```typescript
import { httpClient } from '@/lib/http'

// GET 请求
const response = await httpClient.get('/api/articles')

// POST 请求
const newArticle = await httpClient.post('/api/articles', {
  title: '新文章',
  content: '文章内容'
})

// 带参数的请求
const articles = await httpClient.get('/api/articles', {
  params: { page: 1, size: 10 }
})
```

### 2. 缓存功能

```typescript
// 启用缓存 (默认5分钟)
const response = await httpClient.get('/api/articles', {
  cache: true
})

// 自定义缓存时间
const response = await httpClient.get('/api/articles', {
  cache: true,
  cacheTime: 10 * 60 * 1000 // 10分钟
})
```

### 3. 性能优化

```typescript
// 节流请求 (防止频繁调用)
const response = await httpClient.get('/api/search', {
  throttle: 1000 // 1秒内只执行一次
})

// 防抖请求 (延迟执行)
const response = await httpClient.get('/api/search', {
  debounce: 500 // 500ms内如有新请求则取消之前的
})
```

### 4. 请求取消

```typescript
// 可取消的请求
const response = await httpClient.get('/api/long-task', {
  requestId: 'my-request'
})

// 取消特定请求
httpClient.cancelRequest('my-request')

// 取消所有请求
httpClient.cancelAllRequests()
```

### 5. Token 管理

```typescript
import { tokenService } from '@/lib/http'

// 设置 Token
tokenService.setToken({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  expires: Date.now() + 3600000 // 1小时后过期
})

// 获取 Token
const token = tokenService.getToken()

// 检查 Token 是否有效
const isValid = tokenService.hasValidToken()

// 清除 Token
tokenService.removeToken()
```

## 高级用法

### 1. 自定义插件

```typescript
import { HttpClient, Plugin } from '@/lib/http'

const customPlugin: Plugin = {
  name: 'custom',
  requestInterceptor: (config) => {
    console.log('请求发送前:', config)
    return config
  },
  responseInterceptor: (response) => {
    console.log('响应接收后:', response)
    return response
  },
  errorInterceptor: (error) => {
    console.log('请求错误:', error)
    throw error
  }
}

const client = new HttpClient()
client.use(customPlugin)
```

### 2. 创建专用客户端

```typescript
import { createHttpClient } from '@/lib/http'

const apiClient = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 15000,
  headers: {
    'X-API-Key': 'your-api-key'
  }
})
```

### 3. Vue 集成

```typescript
// main.ts
import httpPlugin from '@/lib/vue/httpPlugin'

app.use(httpPlugin)

// 组件中使用
import { useHttp } from '@/lib/vue/httpPlugin'

export default {
  setup() {
    const http = useHttp()
    
    const fetchData = async () => {
      const response = await http.get('/api/data')
      return response.data
    }
    
    return { fetchData }
  }
}
```

## 错误处理

### 1. 自动错误处理

数据层会自动处理常见错误：
- 网络错误
- 超时错误
- HTTP 状态码错误
- Token 过期自动刷新

### 2. 自定义错误处理

```typescript
import { ErrorHandlerPlugin } from '@/lib/http'

const errorHandler = new ErrorHandlerPlugin({
  globalHandler: (error) => {
    // 全局错误处理逻辑
    console.error('全局错误:', error)
  },
  statusHandlers: {
    404: (error) => {
      // 处理404错误
      console.error('资源未找到:', error)
    },
    500: (error) => {
      // 处理服务器错误
      console.error('服务器错误:', error)
    }
  }
})

httpClient.use(errorHandler)
```

## 配置说明

### HTTP 客户端配置

```typescript
interface HttpConfig {
  baseURL?: string          // 基础URL
  timeout?: number          // 超时时间 (毫秒)
  headers?: Record<string, string> // 默认请求头
  retries?: number          // 重试次数
  retryDelay?: number       // 重试延迟 (毫秒)
}
```

### 请求配置

```typescript
interface RequestConfig {
  url: string               // 请求URL
  method: HttpMethod        // 请求方法
  data?: any               // 请求体数据
  params?: Record<string, any> // URL参数
  signal?: AbortSignal     // 取消信号
  cache?: boolean          // 是否缓存
  cacheTime?: number       // 缓存时间 (毫秒)
  throttle?: number        // 节流时间 (毫秒)
  debounce?: number        // 防抖时间 (毫秒)
  requestId?: string       // 请求ID (用于取消)
}
```

## 最佳实践

### 1. 服务层封装

```typescript
// services/article.service.ts
import { httpClient } from '@/lib/http'
import type { Article, PaginatedResponse } from '@/types'

export class ArticleService {
  static async getList(params = {}): Promise<PaginatedResponse<Article>> {
    const response = await httpClient.get('/articles', {
      params,
      cache: true,
      cacheTime: 5 * 60 * 1000 // 5分钟缓存
    })
    return response.data
  }
  
  static async getDetail(id: number): Promise<Article> {
    const response = await httpClient.get(`/articles/${id}`, {
      cache: true,
      cacheTime: 10 * 60 * 1000 // 10分钟缓存
    })
    return response.data
  }
}
```

### 2. 错误边界处理

```typescript
export const getArticles = async (params = {}) => {
  try {
    // 优先使用 API
    const response = await httpClient.get('/articles', { params })
    return response.data
  } catch (error) {
    // 降级到本地模拟数据
    console.warn('API 不可用，使用模拟数据:', error)
    return getMockData(params)
  }
}
```

### 3. 类型安全

```typescript
interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

// 使用泛型确保类型安全
const response = await httpClient.get<ApiResponse<Article[]>>('/articles')
const articles = response.data.data // 完整的类型提示
```

## 注意事项

1. **缓存策略**: 合理设置缓存时间，避免数据过时
2. **错误处理**: 始终提供降级方案
3. **性能优化**: 适当使用节流/防抖，避免过度请求
4. **内存管理**: 及时取消不需要的请求
5. **安全性**: 敏感数据不要存储在本地存储中

## 演示页面

访问 `/demo/data-layer` 查看完整的功能演示。

## 技术栈

- **TypeScript**: 类型安全
- **Axios**: HTTP 客户端基础
- **web-memcache**: 缓存实现
- **Vue 3**: 框架集成 (可选)
- **Element Plus**: UI 组件 (演示用)

这个数据层架构提供了企业级应用所需的所有功能，同时保持了高度的灵活性和可扩展性。
