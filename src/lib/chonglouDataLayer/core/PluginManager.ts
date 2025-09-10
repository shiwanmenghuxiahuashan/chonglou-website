/**
 * 插件管理器
 * 负责管理和执行插件
 */

import type { Plugin, RequestConfig, HttpResponse, HttpError } from '../types'

export class PluginManager {
  private plugins: Plugin[] = []

  /**
   * 添加插件
   */
  use(plugin: Plugin): void {
    this.plugins.push(plugin)
  }

  /**
   * 移除插件
   */
  removePlugin(pluginName: string): void {
    this.plugins = this.plugins.filter(plugin => plugin.name !== pluginName)
  }

  /**
   * 获取所有插件
   */
  getPlugins(): Plugin[] {
    return [...this.plugins]
  }

  /**
   * 执行请求拦截器
   */
  async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config
    
    for (const plugin of this.plugins) {
      if (plugin.requestInterceptor) {
        try {
          processedConfig = await plugin.requestInterceptor(processedConfig)
        } catch (error: any) {
          // 处理缓存命中等特殊情况
          if (error.isCache) {
            throw error
          }
          throw error
        }
      }
    }

    return processedConfig
  }

  /**
   * 执行响应拦截器
   */
  async executeResponseInterceptors(response: HttpResponse): Promise<HttpResponse> {
    let processedResponse = response
    
    for (const plugin of this.plugins) {
      if (plugin.responseInterceptor) {
        processedResponse = await plugin.responseInterceptor(processedResponse)
      }
    }

    return processedResponse
  }

  /**
   * 执行错误拦截器
   */
  async executeErrorInterceptors(error: HttpError): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.errorInterceptor) {
        try {
          await plugin.errorInterceptor(error)
        } catch (pluginError: any) {
          // 处理重试逻辑
          if (pluginError.shouldRetry && pluginError.config) {
            throw pluginError
          }
        }
      }
    }
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins = []
  }
}
