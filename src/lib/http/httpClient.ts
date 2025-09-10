/**
 * 核心 HTTP 客户端
 * 与框架无关的纯 TypeScript 实现
 */

import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type {
  HttpConfig,
  RequestConfig,
  HttpResponse,
  HttpError,
  HttpMethod,
  Plugin,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from './types'
import { tokenService } from './tokenService'
import { raceGuard, requestCancelManager, throttle, debounce } from './utils/performance'

class HttpClient {
  private axiosInstance: AxiosInstance
  private plugins: Plugin[] = []
  private config: HttpConfig
  private refreshTokenPromise: Promise<void> | null = null

  constructor(config: HttpConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      retries: 3,
      retryDelay: 1000,
      ...config
    }

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers
    })

    this.setupInterceptors()
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // 添加认证 Token
        const token = tokenService.getToken()
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }

        // 生成请求 ID
        const requestConfig = config as RequestConfig
        if (!requestConfig.requestId) {
          requestConfig.requestId = this.generateRequestId()
        }

        // 设置取消信号
        if (!requestConfig.signal && requestConfig.requestId) {
          const controller = requestCancelManager.createController(requestConfig.requestId)
          requestConfig.signal = controller.signal
        }

        // 竞态守卫检查
        const pendingRequest = raceGuard.getPendingRequest(requestConfig)
        if (pendingRequest) {
          return pendingRequest
        }

        // 应用插件的请求拦截器
        let processedConfig = requestConfig
        for (const plugin of this.plugins) {
          if (plugin.requestInterceptor) {
            try {
              processedConfig = await plugin.requestInterceptor(processedConfig)
            } catch (error: any) {
              // 处理缓存命中等特殊情况
              if (error.isCache) {
                return Promise.reject(error)
              }
              throw error
            }
          }
        }

        return processedConfig
      },
      (error) => {
        return Promise.reject(this.transformError(error))
      }
    )

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      async (response: AxiosResponse): Promise<AxiosResponse> => {
        const httpResponse = this.transformResponse(response)

        // 应用插件的响应拦截器
        let processedResponse = httpResponse
        for (const plugin of this.plugins) {
          if (plugin.responseInterceptor) {
            processedResponse = await plugin.responseInterceptor(processedResponse)
          }
        }

        // 将 HttpResponse 转换回 AxiosResponse 格式
        return {
          ...response,
          data: processedResponse.data,
          headers: response.headers,
          config: response.config
        }
      },
      async (error: AxiosError) => {
        // 处理缓存命中
        if ((error as any).isCache) {
          return (error as any).response
        }

        const httpError = this.transformError(error)

        // Token 过期处理
        if (httpError.status === 401 && !httpError.config?.url?.includes('/refresh')) {
          try {
            await this.refreshToken()
            // 重试原请求
            if (httpError.config) {
              return this.request(httpError.config)
            }
          } catch (refreshError) {
            tokenService.removeToken()
            // 可以在这里触发登录页面跳转
          }
        }

        // 应用插件的错误拦截器
        for (const plugin of this.plugins) {
          if (plugin.errorInterceptor) {
            try {
              await plugin.errorInterceptor(httpError)
            } catch (pluginError: any) {
              // 处理重试逻辑
              if (pluginError.shouldRetry && pluginError.config) {
                return this.request(pluginError.config)
              }
            }
          }
        }

        return Promise.reject(httpError)
      }
    )
  }

  /**
   * Token 刷新
   */
  private async refreshToken(): Promise<void> {
    // 防止多个请求同时刷新 Token
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise
    }

    this.refreshTokenPromise = this.performTokenRefresh()
    
    try {
      await this.refreshTokenPromise
    } finally {
      this.refreshTokenPromise = null
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const refreshToken = tokenService.getRefreshToken()
    if (!refreshToken) {
      throw new Error('没有可用的刷新 Token')
    }

    try {
      // 这里应该调用实际的刷新 Token API
      const response = await this.axiosInstance.post('/auth/refresh', {
        refreshToken
      })

      const { accessToken, refreshToken: newRefreshToken, expires } = response.data
      
      tokenService.setToken({
        accessToken,
        refreshToken: newRefreshToken,
        expires
      })
    } catch (error) {
      tokenService.removeToken()
      throw error
    }
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    // 应用节流/防抖
    if (config.throttle) {
      const throttledRequest = throttle(() => this.performRequest<T>(config), config.throttle)
      return throttledRequest()
    }

    if (config.debounce) {
      const debouncedRequest = debounce(() => this.performRequest<T>(config), config.debounce)
      return debouncedRequest()
    }

    return this.performRequest<T>(config)
  }

  private async performRequest<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    // 竞态守卫
    const pendingRequest = raceGuard.getPendingRequest(config)
    if (pendingRequest) {
      return pendingRequest
    }

    const requestPromise = this.axiosInstance.request(config).then(response => {
      return this.transformResponse<T>(response)
    })
    raceGuard.setPendingRequest(config, requestPromise)

    return requestPromise
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config: Omit<RequestConfig, 'url' | 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'GET'
    })
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      data
    })
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      data
    })
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config: Omit<RequestConfig, 'url' | 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'DELETE'
    })
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PATCH',
      data
    })
  }

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
   * 取消请求
   */
  cancelRequest(requestId: string): boolean {
    return requestCancelManager.cancelRequest(requestId)
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void {
    requestCancelManager.cancelAllRequests()
  }

  /**
   * 转换响应对象
   */
  private transformResponse(response: AxiosResponse): HttpResponse {
    // 安全地转换 headers
    const headers: Record<string, string> = {}
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value
        } else if (value != null) {
          headers[key] = String(value)
        }
      })
    }

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers,
      config: response.config as RequestConfig
    }
  }

  /**
   * 转换错误对象
   */
  private transformError(error: AxiosError): HttpError {
    const httpError = new Error(error.message) as HttpError
    
    httpError.config = error.config as RequestConfig
    httpError.response = error.response ? this.transformResponse(error.response) : undefined
    httpError.status = error.response?.status
    httpError.isCancel = axios.isCancel(error)
    httpError.isTimeout = error.code === 'ECONNABORTED'
    httpError.isNetwork = !error.response && !httpError.isCancel && !httpError.isTimeout

    return httpError
  }

  /**
   * 生成请求 ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取配置
   */
  getConfig(): HttpConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<HttpConfig>): void {
    this.config = { ...this.config, ...config }
    
    // 更新 axios 实例配置
    if (config.baseURL) this.axiosInstance.defaults.baseURL = config.baseURL
    if (config.timeout) this.axiosInstance.defaults.timeout = config.timeout
    if (config.headers) this.axiosInstance.defaults.headers = { ...this.axiosInstance.defaults.headers, ...config.headers }
  }
}

export { HttpClient }
