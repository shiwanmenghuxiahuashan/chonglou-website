/**
 * HTTP 客户端 - 基于组合模式的重构版本
 * 保持向后兼容性
 */

import { DataLayer } from './DataLayer'

// 为了向后兼容，重新导出 DataLayer 作为 HttpClient
export class HttpClient extends DataLayer {
  constructor(config: any = {}) {
    super(config)
  }
}

// 保持原有的导出方式
export { DataLayer }
export default HttpClient
