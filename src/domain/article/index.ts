/**
 * 集成映射器的文章服务示例
 * 展示如何在服务层使用映射器进行数据转换
 */
import { ArticleMapper } from './mapper'

import type { ViewArticleData, jsonApiArticleData } from './mapper'

import type { ArticleQueryParams, PaginatedResponse } from '@/types/article'

import { chonglouDataLayer } from '@/lib/chonglouDataLayer'

/**
 * 使用映射器的文章服务类
 */
class ArticleService {
  private readonly articleMapper = new ArticleMapper()

  /**
   * 获取文章列表（使用映射器）
   */
  async getArticle(
    params: ArticleQueryParams = {}
  ): Promise<PaginatedResponse<ViewArticleData>> {
    try {
      // 1. 获取 API 原始数据
      const response = await chonglouDataLayer.get(
        __RESOURCE_CONFIG__.ARTICLE,
        {
          params,
          cache: true,
          cacheTime: 5 * 60 * 1000,
          throttle: 500
        }
      )
      // 2. 使用映射器转换数据
      const mappedArticles = this.articleMapper.mapArticleList(
        response.data,
        params.sortBy as any
      )

      // 3. 返回转换后的数据
      return {
        data: mappedArticles,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error('API请求失败，使用模拟数据:', error)
    }
  }

  /**
   * 获取文章详情（使用映射器）
   */
  async getArticleDetail(id: number): Promise<ViewArticleData> {
    try {
      // 1. 获取文章详情
      const response: HttpResponse<jsonApiArticleData> =
        await chonglouDataLayer.get(`${__RESOURCE_CONFIG__.ARTICLE}/${id}`, {
          cache: true,
          cacheTime: 10 * 60 * 1000,
          requestId: `article-detail-${id}`
        })

      // 2. 使用映射器转换数据
      const mappedArticle = this.articleMapper.mapArticleDetail(response.data)
      // TODO 统一返回格式
      return {
        data: mappedArticle
      }
      return mappedArticle
    } catch (error) {
      console.error('API请求失败，使用模拟数据:', error)
    }
  }

  async createArticle(data: Partial<jsonApiArticleData>): Promise<void> {
    try {
      await chonglouDataLayer.post(__RESOURCE_CONFIG__.ARTICLE, data)
    } catch (error) {
      console.error('API请求失败，无法创建文章:', error)
      throw error
    }
  }
}

// 导出服务实例
const articleService = new ArticleService()

export { articleService }
