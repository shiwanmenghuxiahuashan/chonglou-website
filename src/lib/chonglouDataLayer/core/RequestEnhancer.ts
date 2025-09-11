/**
 * 请求增强器
 * 负责请求的高级功能：竞态守卫、节流防抖、请求取消等
 */

import { debounce, throttle } from 'lodash-unified'
import { raceGuard, requestCancelManager } from '../utils/performance'

import type { HttpResponse, RequestConfig } from '../types'

export class RequestEnhancer {
  /**
   * 生成请求 ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  /**
   * 为请求添加 ID 和取消信号
   */
  enhanceRequest(config: RequestConfig): RequestConfig {
    // 生成请求 ID
    if (!config.requestId) {
      config.requestId = this.generateRequestId()
    }

    // 设置取消信号
    if (!config.signal && config.requestId) {
      const controller = requestCancelManager.createController(config.requestId)
      config.signal = controller.signal
    }

    return config
  }

  /**
   * 检查竞态守卫
   */
  checkRaceGuard<T>(config: RequestConfig): Promise<HttpResponse<T>> | null {
    return raceGuard.getPendingRequest(config)
  }

  /**
   * 设置竞态守卫
   */
  setRaceGuard<T>(
    config: RequestConfig,
    promise: Promise<HttpResponse<T>>
  ): void {
    raceGuard.setPendingRequest(config, promise)
  }

  /**
   * 应用节流
   */
  applyThrottle<T>(
    requestFn: () => Promise<HttpResponse<T>>,
    delay: number
  ): () => Promise<HttpResponse<T>> {
    return throttle(requestFn, delay)
  }

  /**
   * 应用防抖
   */
  applyDebounce<T>(
    requestFn: () => Promise<HttpResponse<T>>,
    delay: number
  ): () => Promise<HttpResponse<T>> {
    return debounce(requestFn, delay)
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
   * 判断是否应用节流或防抖
   */
  shouldApplyThrottleOrDebounce(config: RequestConfig): boolean {
    return !!(config.throttle || config.debounce)
  }

  /**
   * 执行增强的请求
   */
  async executeEnhancedRequest<T>(
    config: RequestConfig,
    requestFn: () => Promise<HttpResponse<T>>
  ): Promise<HttpResponse<T>> {
    // 应用节流/防抖
    if (config.throttle) {
      const throttledRequest = this.applyThrottle(requestFn, config.throttle)
      return throttledRequest()
    }

    if (config.debounce) {
      const debouncedRequest = this.applyDebounce(requestFn, config.debounce)
      return debouncedRequest()
    }

    // 竞态守卫检查
    const pendingRequest = this.checkRaceGuard<T>(config)
    if (pendingRequest) {
      return pendingRequest
    }

    // 执行请求并设置竞态守卫
    const requestPromise = requestFn()
    this.setRaceGuard(config, requestPromise)

    return requestPromise
  }
}
