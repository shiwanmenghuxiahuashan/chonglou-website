/**
 * 错误处理插件
 * 统一处理 HTTP 错误和自定义错误处理逻辑
 */

import type { HttpError, Plugin } from '../types'

export type ErrorHandler = (error: HttpError) => void | Promise<void>

export interface ErrorHandlerConfig {
  // 全局错误处理器
  globalHandler?: ErrorHandler
  // 状态码特定处理器
  statusHandlers?: Record<number, ErrorHandler>
  // 是否启用自动错误提示
  showErrorMessage?: boolean
  // 自定义错误消息映射
  errorMessages?: Record<number, string>
}

class ErrorHandlerPlugin implements Plugin {
  name = 'errorHandler'
  private config: ErrorHandlerConfig
  private customErrorHandler?: ErrorHandler

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      showErrorMessage: true,
      errorMessages: {
        400: '请求参数错误',
        401: '未授权，请重新登录',
        403: '访问被拒绝',
        404: '请求的资源不存在',
        405: '请求方法不被允许',
        408: '请求超时',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时'
      },
      ...config
    }
  }

  /**
   * 设置自定义错误处理器（由外部框架注入）
   */
  setErrorHandler(handler: ErrorHandler): void {
    this.customErrorHandler = handler
  }

  errorInterceptor = async (error: HttpError): Promise<never> => {
    // 处理错误
    await this.handleError(error)

    // 继续抛出错误
    throw error
  }

  private async handleError(error: HttpError): Promise<void> {
    const status = error.status

    try {
      // 1. 优先使用状态码特定处理器
      if (status && this.config.statusHandlers?.[status]) {
        await this.config.statusHandlers[status](error)
        return
      }

      // 2. 使用全局处理器
      if (this.config.globalHandler) {
        await this.config.globalHandler(error)
        return
      }

      // 3. 使用自定义错误处理器（框架注入）
      if (this.customErrorHandler) {
        await this.customErrorHandler(error)
        return
      }

      // 4. 默认错误处理
      if (this.config.showErrorMessage) {
        this.showDefaultErrorMessage(error)
      }
    } catch (handlerError) {
      console.error('错误处理器执行失败:', handlerError)
    }
  }

  private showDefaultErrorMessage(error: HttpError): void {
    const status = error.status
    const message = this.getErrorMessage(error)

    // 默认使用 console.error，实际使用时会被框架的错误处理器替换
    console.error('HTTP错误:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method
    })
  }

  private getErrorMessage(error: HttpError): string {
    const status = error.status

    // 自定义错误消息
    if (status && this.config.errorMessages?.[status]) {
      return this.config.errorMessages[status]
    }

    // 网络错误
    if (error.isNetwork) {
      return '网络连接错误，请检查网络设置'
    }

    // 超时错误
    if (error.isTimeout) {
      return '请求超时，请重试'
    }

    // 取消错误
    if (error.isCancel) {
      return '请求已取消'
    }

    // 默认错误消息
    return error.message || '请求发生错误'
  }

  /**
   * 添加状态码处理器
   */
  addStatusHandler(status: number, handler: ErrorHandler): void {
    if (!this.config.statusHandlers) {
      this.config.statusHandlers = {}
    }
    this.config.statusHandlers[status] = handler
  }

  /**
   * 移除状态码处理器
   */
  removeStatusHandler(status: number): void {
    if (this.config.statusHandlers) {
      delete this.config.statusHandlers[status]
    }
  }
}

// 导出统一的错误处理函数供外部使用
export const handleError: ErrorHandler = (error: HttpError) => {
  // 这个函数将被外部框架重写
  console.error('未处理的HTTP错误:', error)
}

export { ErrorHandlerPlugin }
