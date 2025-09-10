/**
 * HTTP 客户端主入口
 * 提供预配置的客户端实例和自定义配置选项
 */

import { HttpClient } from './httpClient'
import { tokenService, TokenService } from './tokenService'
import { CachePlugin, RetryPlugin, ErrorHandlerPlugin } from './plugins'
import type { HttpConfig } from './types'

/**
 * 创建预配置的 HTTP 客户端实例
 */
export function createHttpClient(config: HttpConfig = {}): HttpClient {
  const client = new HttpClient(config)

  // 添加默认插件
  const cachePlugin = new CachePlugin()
  const retryPlugin = new RetryPlugin()
  const errorHandlerPlugin = new ErrorHandlerPlugin()

  client.use(cachePlugin)
  client.use(retryPlugin)
  client.use(errorHandlerPlugin)

  return client
}

/**
 * 默认 HTTP 客户端实例
 */
export const httpClient = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 导出核心类和工具
export { HttpClient } from './httpClient'
export { tokenService, TokenService } from './tokenService'
export { CachePlugin, RetryPlugin, ErrorHandlerPlugin } from './plugins'
export { raceGuard, requestCancelManager, throttle, debounce } from './utils/performance'

// 导出类型
export type * from './types'

// 默认导出
export default httpClient
