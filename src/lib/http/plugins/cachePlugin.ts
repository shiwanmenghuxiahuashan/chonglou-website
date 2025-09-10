/**
 * 缓存插件
 * 基于 web-memcache 的请求缓存实现
 */

import {
    MemCache
} from 'web-memcache';
import type { Plugin, RequestConfig, HttpResponse, CacheEntry } from '../types'

export interface CacheConfig {
  defaultTTL: number // 默认缓存时间（毫秒）
  maxSize: number    // 最大缓存条目数
  enableGet: boolean // 是否缓存 GET 请求
  enablePost: boolean // 是否缓存 POST 请求
}

class CachePlugin implements Plugin {
  name = 'cache'
  private cache: MemCache
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5分钟
      maxSize: 100,
      enableGet: true,
      enablePost: false,
      ...config
    }

    this.cache = new MemCache({
      maxSize: this.config.maxSize
    })
  }

  requestInterceptor = (config: RequestConfig): RequestConfig => {
    // 只对启用缓存的请求进行处理
    if (!this.shouldCache(config)) {
      return config
    }

    const cacheKey = this.generateCacheKey(config)
    const cachedData = this.cache.get(cacheKey)

    if (cachedData && !this.isCacheExpired(cachedData)) {
      // 返回缓存数据，阻止实际请求
      const response: HttpResponse = {
        data: cachedData.data,
        status: 200,
        statusText: 'OK',
        headers: { 'x-cache': 'HIT' },
        config
      }
      
      // 通过 Promise.resolve 返回缓存数据
      throw { isCache: true, response }
    }

    return config
  }

  responseInterceptor = <T>(response: HttpResponse<T>): HttpResponse<T> => {
    // 缓存成功的响应
    if (response.status >= 200 && response.status < 300 && this.shouldCache(response.config)) {
      const cacheKey = this.generateCacheKey(response.config)
      const cacheTime = response.config.cacheTime || this.config.defaultTTL
      
      const cacheEntry: CacheEntry<T> = {
        data: response.data,
        timestamp: Date.now(),
        expires: Date.now() + cacheTime
      }
      
      this.cache.set(cacheKey, cacheEntry)
    }

    return response
  }

  private shouldCache(config: RequestConfig): boolean {
    // 如果明确禁用缓存
    if (config.cache === false) {
      return false
    }

    // 如果明确启用缓存
    if (config.cache === true) {
      return true
    }

    // 根据请求方法判断
    const method = config.method.toUpperCase()
    if (method === 'GET' && this.config.enableGet) {
      return true
    }
    if (method === 'POST' && this.config.enablePost) {
      return true
    }

    return false
  }

  private generateCacheKey(config: RequestConfig): string {
    const { url, method, params, data } = config
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
  }

  private isCacheExpired(cacheEntry: CacheEntry): boolean {
    return Date.now() > cacheEntry.expires
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 清除指定缓存
   */
  clearCacheByKey(key: string): void {
    this.cache.del(key)
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize
    }
  }
}

export { CachePlugin }
