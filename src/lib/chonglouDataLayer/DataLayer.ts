/**
 * 数据层客户端
 * 基于组合模式，整合各个功能组件
 */

import type { HttpConfig, RequestConfig, HttpResponse, Plugin } from './types'
import { 
  CoreClient, 
  PluginManager, 
  AuthManager, 
  RequestEnhancer, 
  InterceptorManager 
} from './core'

export class DataLayer {
  private coreClient: CoreClient
  private pluginManager: PluginManager
  private authManager: AuthManager
  private requestEnhancer: RequestEnhancer
  private interceptorManager: InterceptorManager

  constructor(config: HttpConfig = {}) {
    // 初始化核心组件
    this.coreClient = new CoreClient(config)
    this.pluginManager = new PluginManager()
    this.authManager = new AuthManager(this.coreClient)
    this.requestEnhancer = new RequestEnhancer()
    
    // 初始化拦截器管理器（它会自动设置拦截器）
    this.interceptorManager = new InterceptorManager(
      this.coreClient,
      this.pluginManager,
      this.authManager,
      this.requestEnhancer
    )
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    // 使用请求增强器处理高级功能
    return this.requestEnhancer.executeEnhancedRequest(config, () => {
      return this.coreClient.request<T>(config)
    })
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config: Omit<RequestConfig, 'url' | 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'GET'
    })
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}): Promise<HttpResponse<T>> {
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
  async put<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}): Promise<HttpResponse<T>> {
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
  async delete<T = any>(url: string, config: Omit<RequestConfig, 'url' | 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'DELETE'
    })
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, data?: any, config: Omit<RequestConfig, 'url' | 'method' | 'data'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PATCH',
      data
    })
  }

  /**
   * 插件管理
   */
  use(plugin: Plugin): void {
    this.pluginManager.use(plugin)
  }

  removePlugin(pluginName: string): void {
    this.pluginManager.removePlugin(pluginName)
  }

  getPlugins(): Plugin[] {
    return this.pluginManager.getPlugins()
  }

  /**
   * 请求取消
   */
  cancelRequest(requestId: string): boolean {
    return this.requestEnhancer.cancelRequest(requestId)
  }

  cancelAllRequests(): void {
    this.requestEnhancer.cancelAllRequests()
  }

  /**
   * 认证状态
   */
  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated()
  }

  /**
   * 配置管理
   */
  getConfig(): HttpConfig {
    return this.coreClient.getConfig()
  }

  updateConfig(config: Partial<HttpConfig>): void {
    this.coreClient.updateConfig(config)
  }

  /**
   * 获取核心组件（用于高级操作）
   */
  getCoreClient(): CoreClient {
    return this.coreClient
  }

  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  getAuthManager(): AuthManager {
    return this.authManager
  }

  getRequestEnhancer(): RequestEnhancer {
    return this.requestEnhancer
  }
}
