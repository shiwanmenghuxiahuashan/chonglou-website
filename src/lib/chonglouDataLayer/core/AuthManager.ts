/**
 * 认证管理器
 * 负责 Token 相关的认证逻辑
 */

import type { RequestConfig, HttpResponse } from '../types'
import { tokenService } from '../tokenService'
import type { CoreClient } from './CoreClient'

export class AuthManager {
  private coreClient: CoreClient
  private refreshTokenPromise: Promise<void> | null = null

  constructor(coreClient: CoreClient) {
    this.coreClient = coreClient
  }

  /**
   * 为请求添加认证信息
   */
  addAuthToRequest(config: RequestConfig): RequestConfig {
    const token = tokenService.getToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }

  /**
   * 检查是否需要刷新 Token
   */
  shouldRefreshToken(status?: number, url?: string): boolean {
    return status === 401 && !url?.includes('/refresh')
  }

  /**
   * 刷新 Token
   */
  async refreshToken(): Promise<void> {
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

  /**
   * 执行 Token 刷新
   */
  private async performTokenRefresh(): Promise<void> {
    const refreshToken = tokenService.getRefreshToken()
    if (!refreshToken) {
      throw new Error('没有可用的刷新 Token')
    }

    try {
      // 这里应该调用实际的刷新 Token API
      const response = await this.coreClient.post('/auth/refresh', {
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
   * 处理认证错误
   */
  async handleAuthError(): Promise<void> {
    tokenService.removeToken()
    // 可以在这里触发登录页面跳转或其他认证失败处理
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return !!tokenService.getToken()
  }
}
