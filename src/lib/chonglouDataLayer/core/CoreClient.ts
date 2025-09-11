/**
 * 核心 HTTP 客户端
 * 只负责基础的 HTTP 请求功能
 */

import axios from 'axios'

import type {
  HttpConfig,
  HttpError,
  HttpResponse,
  RequestConfig
} from '../types'
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

class CoreClient {
  private axiosInstance: AxiosInstance
  private config: HttpConfig

  constructor(config: HttpConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    }
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers
    })
  }

  /**
   * 执行 HTTP 请求
   */
  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.request(config)
      return this.transformResponse<T>(response)
    } catch (error) {
      throw this.transformError(error as AxiosError)
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(
    url: string,
    config: Omit<RequestConfig, 'url' | 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'GET'
    })
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}
  ): Promise<HttpResponse<T>> {
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
  async put<T = any>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}
  ): Promise<HttpResponse<T>> {
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
  async delete<T = any>(
    url: string,
    config: Omit<RequestConfig, 'url' | 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'DELETE'
    })
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PATCH',
      data
    })
  }

  /**
   * 转换响应对象
   */
  private transformResponse<T>(response: AxiosResponse): HttpResponse<T> {
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
    httpError.response = error.response
      ? this.transformResponse(error.response)
      : undefined
    httpError.status = error.response?.status
    httpError.isCancel = axios.isCancel(error)
    httpError.isTimeout = error.code === 'ECONNABORTED'
    httpError.isNetwork =
      !error.response && !httpError.isCancel && !httpError.isTimeout

    return httpError
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
    if (config.headers)
      this.axiosInstance.defaults.headers = {
        ...this.axiosInstance.defaults.headers,
        ...config.headers
      }
  }

  /**
   * 获取 axios 实例（用于高级操作）
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

export { CoreClient }
