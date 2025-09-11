/**
 * 重楼数据层主入口
 * 提供预配置的客户端实例和自定义配置选项
 */

import { DataLayer } from './DataLayer'
import { CachePlugin, ErrorHandlerPlugin, RetryPlugin } from './plugins'
import { TokenService, tokenService } from './tokenService'
import { raceGuard, requestCancelManager } from './utils/performance'

import type { HttpConfig } from './types'

/**
 * 创建预配置的数据层客户端实例
 */
function createDataLayer(config: HttpConfig = {}): DataLayer {
  const _datalayer = new DataLayer(config)

  // 添加默认插件
  // const cachePlugin = new CachePlugin()
  const retryPlugin = new RetryPlugin()
  const errorHandlerPlugin = new ErrorHandlerPlugin()

  // _datalayer.use(cachePlugin)
  _datalayer.use(retryPlugin)
  _datalayer.use(errorHandlerPlugin)

  return _datalayer
}
/**
 * 默认数据层客户端实例
 */
const chonglouDataLayer = createDataLayer({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})
// 底部统一导出
export {
  chonglouDataLayer,
  createDataLayer,
  createHttpClient,
  DataLayer,
  tokenService,
  TokenService,
  CachePlugin,
  RetryPlugin,
  ErrorHandlerPlugin,
  raceGuard,
  requestCancelManager
}

export type * from './types'
