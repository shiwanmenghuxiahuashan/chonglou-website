/**
 * 重试插件
 * 实现请求失败时的自动重试机制
 */

import type { HttpError, Plugin, RequestConfig } from '../types'

export interface RetryConfig {
  retries: number // 重试次数
  retryDelay: number // 重试延迟（毫秒）
  retryCondition: (error: HttpError) => boolean // 重试条件
  exponentialBackoff: boolean // 是否使用指数退避
}

class RetryPlugin implements Plugin {
  name = 'retry'
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      retries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      retryCondition: this.defaultRetryCondition,
      ...config
    }
  }

  errorInterceptor = async (error: HttpError): Promise<never> => {
    const { config } = error

    // 如果没有配置信息或已经超过重试次数，直接抛出错误
    if (!config || !this.shouldRetry(error, config)) {
      throw error
    }

    // 初始化重试计数
    if (typeof config.retries === 'undefined') {
      config.retries = this.config.retries
    }

    // 减少重试次数
    config.retries--

    // 计算延迟时间
    const delay = this.calculateDelay(config)

    // 等待延迟时间
    await this.sleep(delay)

    // 重新发起请求
    throw { shouldRetry: true, config }
  }

  private shouldRetry(error: HttpError, config: RequestConfig): boolean {
    // 检查是否还有重试次数
    const retriesLeft = config.retries ?? this.config.retries
    if (retriesLeft <= 0) {
      return false
    }

    // 检查是否被取消
    if (error.isCancel) {
      return false
    }

    // 使用自定义重试条件
    return this.config.retryCondition(error)
  }

  private defaultRetryCondition(error: HttpError): boolean {
    // 网络错误重试
    if (error.isNetwork) {
      return true
    }

    // 超时错误重试
    if (error.isTimeout) {
      return true
    }

    // 5xx 服务器错误重试
    if (error.status && error.status >= 500) {
      return true
    }

    // 429 Too Many Requests 重试
    if (error.status === 429) {
      return true
    }

    return false
  }

  private calculateDelay(config: RequestConfig): number {
    const baseDelay = config.retryDelay ?? this.config.retryDelay

    if (!this.config.exponentialBackoff) {
      return baseDelay
    }

    // 指数退避：每次重试延迟时间翻倍
    const retriesUsed =
      this.config.retries - (config.retries ?? this.config.retries)
    return baseDelay * 2 ** retriesUsed
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export { RetryPlugin }
