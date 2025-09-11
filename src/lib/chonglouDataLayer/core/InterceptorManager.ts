/**
 * 拦截器管理器
 * 负责统一管理所有拦截器逻辑
 */

import type { HttpError, HttpResponse, RequestConfig } from '../types'
import type { AuthManager } from './AuthManager'
import type { CoreClient } from './CoreClient'
import type { PluginManager } from './PluginManager'
import type { RequestEnhancer } from './RequestEnhancer'

export class InterceptorManager {
  private coreClient: CoreClient
  private pluginManager: PluginManager
  private authManager: AuthManager
  private requestEnhancer: RequestEnhancer

  constructor(
    coreClient: CoreClient,
    pluginManager: PluginManager,
    authManager: AuthManager,
    requestEnhancer: RequestEnhancer
  ) {
    this.coreClient = coreClient
    this.pluginManager = pluginManager
    this.authManager = authManager
    this.requestEnhancer = requestEnhancer

    this.setupInterceptors()
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    const axiosInstance = this.coreClient.getAxiosInstance()
    // 请求拦截器
    axiosInstance.interceptors.request.use(
      async config => {
        // 增强请求配置
        let enhancedConfig = this.requestEnhancer.enhanceRequest(
          config as RequestConfig
        )

        // 添加认证信息
        enhancedConfig = this.authManager.addAuthToRequest(enhancedConfig)

        // 竞态守卫检查
        const pendingRequest =
          this.requestEnhancer.checkRaceGuard(enhancedConfig)

        if (pendingRequest) {
          // TODO: 这里需要记录下来，当请求完成后返回
          throw { isRaceGuard: true, pendingRequest }
        }

        // 应用插件的请求拦截器
        enhancedConfig =
          await this.pluginManager.executeRequestInterceptors(enhancedConfig)

        return enhancedConfig
      },
      error => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    axiosInstance.interceptors.response.use(
      async response => {
        // 转换为 HttpResponse 格式
        const httpResponse: HttpResponse = {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: this.normalizeHeaders(response.headers),
          config: response.config as RequestConfig
        }

        // 应用插件的响应拦截器
        const processedResponse =
          await this.pluginManager.executeResponseInterceptors(httpResponse)

        // 将 HttpResponse 转换回 AxiosResponse 格式
        return {
          ...response,
          data: processedResponse.data,
          headers: response.headers,
          config: response.config
        }
      },
      async error => {
        return this.handleResponseError(error)
      }
    )
  }

  /**
   * 处理响应错误
   */
  private async handleResponseError(error: any): Promise<any> {
    // 处理竞态守卫的特殊情况
    if (error.isRaceGuard) {
      return error.pendingRequest
    }

    // 处理缓存命中
    if (error.isCache) {
      return error.response
    }

    // 转换为 HttpError
    const httpError: HttpError = {
      ...new Error(error.message),
      config: error.config as RequestConfig,
      response: error.response
        ? {
            data: error.response.data,
            status: error.response.status,
            statusText: error.response.statusText,
            headers: this.normalizeHeaders(error.response.headers),
            config: error.response.config as RequestConfig
          }
        : undefined,
      status: error.response?.status,
      isCancel: false, // 这里需要根据实际情况判断
      isTimeout: error.code === 'ECONNABORTED',
      isNetwork: !error.response && error.code !== 'ECONNABORTED'
    }

    // Token 过期处理
    if (
      this.authManager.shouldRefreshToken(
        httpError.status,
        httpError.config?.url
      )
    ) {
      try {
        await this.authManager.refreshToken()
        // 重试原请求
        if (httpError.config) {
          return this.coreClient.request(httpError.config)
        }
      } catch {
        await this.authManager.handleAuthError()
      }
    }

    // 应用插件的错误拦截器
    try {
      await this.pluginManager.executeErrorInterceptors(httpError)
    } catch (pluginError: any) {
      // 处理重试逻辑
      if (pluginError.shouldRetry && pluginError.config) {
        return this.coreClient.request(pluginError.config)
      }
    }

    return Promise.reject(httpError)
  }

  /**
   * 规范化 headers
   */
  private normalizeHeaders(headers: any): Record<string, string> {
    const normalizedHeaders: Record<string, string> = {}
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          normalizedHeaders[key] = value
        } else if (value != null) {
          normalizedHeaders[key] = String(value)
        }
      })
    }
    return normalizedHeaders
  }
}
