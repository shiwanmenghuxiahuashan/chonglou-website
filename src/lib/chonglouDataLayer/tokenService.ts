/**
 * Token 管理服务
 * 与框架无关的纯 TypeScript 实现
 */

export interface TokenConfig {
  storageType: 'localStorage' | 'sessionStorage'
  tokenKey: string
  refreshTokenKey: string
  expiresKey: string
}

export interface TokenInfo {
  accessToken: string
  refreshToken?: string
  expires?: number
}

class TokenService {
  private config: TokenConfig
  private storage: Storage

  constructor(config: Partial<TokenConfig> = {}) {
    this.config = {
      storageType: 'localStorage',
      tokenKey: 'access_token',
      refreshTokenKey: 'refresh_token',
      expiresKey: 'token_expires',
      ...config
    }

    this.storage =
      this.config.storageType === 'localStorage'
        ? window.localStorage
        : window.sessionStorage
  }

  /**
   * 获取访问令牌
   */
  getToken(): string | null {
    try {
      const token = this.storage.getItem(this.config.tokenKey)

      // 检查 Token 是否过期
      if (token && this.isTokenExpired()) {
        this.removeToken()
        return null
      }

      return token
    } catch (error) {
      console.error('获取 Token 失败:', error)
      return null
    }
  }

  /**
   * 设置访问令牌
   */
  setToken(tokenInfo: TokenInfo): void {
    try {
      this.storage.setItem(this.config.tokenKey, tokenInfo.accessToken)

      if (tokenInfo.refreshToken) {
        this.storage.setItem(
          this.config.refreshTokenKey,
          tokenInfo.refreshToken
        )
      }

      if (tokenInfo.expires) {
        this.storage.setItem(
          this.config.expiresKey,
          tokenInfo.expires.toString()
        )
      }
    } catch (error) {
      console.error('设置 Token 失败:', error)
    }
  }

  /**
   * 获取刷新令牌
   */
  getRefreshToken(): string | null {
    try {
      return this.storage.getItem(this.config.refreshTokenKey)
    } catch (error) {
      console.error('获取刷新 Token 失败:', error)
      return null
    }
  }

  /**
   * 移除所有令牌
   */
  removeToken(): void {
    try {
      this.storage.removeItem(this.config.tokenKey)
      this.storage.removeItem(this.config.refreshTokenKey)
      this.storage.removeItem(this.config.expiresKey)
    } catch (error) {
      console.error('移除 Token 失败:', error)
    }
  }

  /**
   * 检查 Token 是否过期
   */
  isTokenExpired(): boolean {
    try {
      const expiresStr = this.storage.getItem(this.config.expiresKey)
      if (!expiresStr) return false

      const expires = parseInt(expiresStr, 10)
      return Date.now() > expires
    } catch (error) {
      console.error('检查 Token 过期状态失败:', error)
      return true
    }
  }

  /**
   * 检查是否有有效的 Token
   */
  hasValidToken(): boolean {
    return !!this.getToken()
  }

  /**
   * 清除所有存储数据
   */
  clear(): void {
    this.removeToken()
  }
}

// 默认实例
const tokenService = new TokenService()

// 导出类以支持自定义配置
export { TokenService, tokenService }
