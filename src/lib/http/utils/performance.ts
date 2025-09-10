/**
 * 性能优化工具
 * 包含竞态守卫、节流、防抖等功能
 */

import type { RequestConfig, PendingRequest } from '../types'

/**
 * 竞态守卫
 * 防止同一个请求同时发起多次
 */
class RaceGuard {
  private pendingRequests = new Map<string, Promise<any>>()

  /**
   * 生成请求唯一键
   */
  private generateKey(config: RequestConfig): string {
    const { url, method, params, data } = config
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
  }

  /**
   * 检查并获取正在进行的请求
   */
  getPendingRequest(config: RequestConfig): Promise<any> | null {
    const key = this.generateKey(config)
    return this.pendingRequests.get(key) || null
  }

  /**
   * 添加正在进行的请求
   */
  setPendingRequest(config: RequestConfig, promise: Promise<any>): void {
    const key = this.generateKey(config)
    this.pendingRequests.set(key, promise)

    // 请求完成后清除
    promise.finally(() => {
      this.pendingRequests.delete(key)
    })
  }

  /**
   * 取消指定请求
   */
  cancelRequest(config: RequestConfig): void {
    const key = this.generateKey(config)
    this.pendingRequests.delete(key)
  }

  /**
   * 清除所有请求
   */
  clear(): void {
    this.pendingRequests.clear()
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastExecution = 0
  let timeoutId: NodeJS.Timeout | null = null
  let lastPromise: Promise<ReturnType<T>> | null = null

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now()

    // 如果还在节流期间，返回上一次的 Promise
    if (lastPromise && now - lastExecution < delay) {
      return lastPromise
    }

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // 立即执行或延迟执行
    if (now - lastExecution >= delay) {
      lastExecution = now
      lastPromise = Promise.resolve(func(...args))
      return lastPromise
    } else {
      lastPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          lastExecution = Date.now()
          try {
            resolve(func(...args))
          } catch (error) {
            reject(error)
          }
        }, delay - (now - lastExecution))
      })
      return lastPromise
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null
  let currentPromise: {
    resolve: (value: ReturnType<T>) => void
    reject: (reason: any) => void
  } | null = null

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    return new Promise<ReturnType<T>>((resolve, reject) => {
      // 如果有正在等待的 Promise，取消它
      if (currentPromise) {
        currentPromise.reject(new Error('Debounced'))
      }

      currentPromise = { resolve, reject }

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args)
          if (currentPromise) {
            currentPromise.resolve(result)
            currentPromise = null
          }
        } catch (error) {
          if (currentPromise) {
            currentPromise.reject(error)
            currentPromise = null
          }
        }
      }, delay)
    })
  }
}

/**
 * 请求取消管理器
 */
class RequestCancelManager {
  private controllers = new Map<string, AbortController>()

  /**
   * 创建取消控制器
   */
  createController(requestId: string): AbortController {
    // 如果已存在，先取消
    this.cancelRequest(requestId)

    const controller = new AbortController()
    this.controllers.set(requestId, controller)
    return controller
  }

  /**
   * 取消指定请求
   */
  cancelRequest(requestId: string): boolean {
    const controller = this.controllers.get(requestId)
    if (controller) {
      controller.abort()
      this.controllers.delete(requestId)
      return true
    }
    return false
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void {
    this.controllers.forEach(controller => {
      controller.abort()
    })
    this.controllers.clear()
  }

  /**
   * 清理已完成的请求
   */
  cleanup(): void {
    this.controllers.forEach((controller, requestId) => {
      if (controller.signal.aborted) {
        this.controllers.delete(requestId)
      }
    })
  }

  /**
   * 获取活跃请求数量
   */
  getActiveRequestCount(): number {
    return this.controllers.size
  }
}

// 导出单例实例
export const raceGuard = new RaceGuard()
export const requestCancelManager = new RequestCancelManager()

export { RaceGuard, RequestCancelManager }
