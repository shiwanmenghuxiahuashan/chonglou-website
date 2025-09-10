/**
 * HTTP 客户端核心类型定义
 * 与框架无关的通用类型
 */

export interface HttpConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  retries?: number
  retryDelay?: number
}

export interface RequestConfig extends HttpConfig {
  url: string
  method: HttpMethod
  data?: any
  params?: Record<string, any>
  signal?: AbortSignal
  cache?: boolean
  cacheTime?: number
  throttle?: number
  debounce?: number
  requestId?: string
}

export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
}

export interface HttpError extends Error {
  config?: RequestConfig
  response?: HttpResponse
  status?: number
  isCancel?: boolean
  isTimeout?: boolean
  isNetwork?: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>
}

export interface ResponseInterceptor<T = any> {
  (response: HttpResponse<T>): HttpResponse<T> | Promise<HttpResponse<T>>
}

export interface ErrorInterceptor {
  (error: HttpError): Promise<never> | Promise<any>
}

export interface Plugin {
  name: string
  requestInterceptor?: RequestInterceptor
  responseInterceptor?: ResponseInterceptor
  errorInterceptor?: ErrorInterceptor
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expires: number
}

export interface PendingRequest {
  resolve: (value: any) => void
  reject: (reason: any) => void
}
