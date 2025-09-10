/**
 * HTTP 客户端主入口
 * 提供预配置的客户端实例和自定义配置选项
 */

import { HttpClient } from './DataLayer'
import { tokenService, TokenService } from './tokenService'
import { CachePlugin, RetryPlugin, ErrorHandlerPlugin } from './plugins'
import type { HttpConfig } from './types'

/**
 * 创建预配置的 HTTP 客户端实例
 */
function createHttpClient(config: HttpConfig = {}): HttpClient {
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
const httpClient = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 底部统一导出
export { createHttpClient, httpClient }
export { HttpClient } from './DataLayer'
export { tokenService, TokenService } from './tokenService'
export { CachePlugin, RetryPlugin, ErrorHandlerPlugin } from './plugins'
export { raceGuard, requestCancelManager, throttle, debounce } from './utils/performance'
export type * from './types'
export default httpClient
