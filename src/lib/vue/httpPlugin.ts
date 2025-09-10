/**
 * Vue 框架集成层
 * 将通用数据层与 Vue 框架集成
 */

import type { App } from 'vue'
import { ElMessage } from 'element-plus'
import { httpClient, ErrorHandlerPlugin } from '../http'
import type { HttpError } from '../http'

/**
 * Vue 错误处理器
 */
const vueErrorHandler = (error: HttpError): void => {
  // 根据错误类型显示不同的消息
  if (error.isNetwork) {
    ElMessage.error('网络连接错误，请检查网络设置')
  } else if (error.isTimeout) {
    ElMessage.error('请求超时，请重试')
  } else if (error.isCancel) {
    // 取消的请求通常不需要显示错误消息
    return
  } else if (error.status) {
    const statusMessages: Record<number, string> = {
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
    }
    
    const message = statusMessages[error.status] || `HTTP错误: ${error.status}`
    ElMessage.error(message)
  } else {
    ElMessage.error(error.message || '请求发生错误')
  }
}

/**
 * Vue 插件安装函数
 */
export function install(app: App): void {
  // 注入 Vue 错误处理器
  const errorHandlerPlugin = httpClient['plugins'].find(
    plugin => plugin.name === 'errorHandler'
  ) as ErrorHandlerPlugin

  if (errorHandlerPlugin) {
    errorHandlerPlugin.setErrorHandler(vueErrorHandler)
  }

  // 将 httpClient 注入到 Vue 实例中
  app.config.globalProperties.$http = httpClient
  app.provide('httpClient', httpClient)
}

/**
 * Vue 组合式 API Hook
 */
export function useHttp() {
  return httpClient
}

/**
 * Vue 插件对象
 */
export default {
  install
}
