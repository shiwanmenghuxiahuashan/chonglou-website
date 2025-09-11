/**
 * 集成映射器的文章服务示例
 * 展示如何在服务层使用映射器进行数据转换
 */

import { ApiArticleData, ArticleMapper, ViewArticleData } from './mapper'

import type {
  Article,
  ArticleDetail,
  ArticleQueryParams,
  PaginatedResponse
} from '@/types/article'

import { chonglouDataLayer } from '@/lib/chonglouDataLayer'

/**
 * 使用映射器的文章服务类
 */
class ArticleService {
  private readonly articleMapper = new ArticleMapper()

  /**
   * 获取文章列表（使用映射器）
   */
  async getArticles(
    params: ArticleQueryParams = {}
  ): Promise<PaginatedResponse<ViewArticleData>> {
    try {
      // 1. 获取 API 原始数据
      const response = await chonglouDataLayer.get('/articles', {
        params,
        cache: true,
        cacheTime: 5 * 60 * 1000,
        throttle: 500
      })

      // 2. 使用映射器转换数据
      const mappedArticles = this.articleMapper.mapArticleList(
        response.data.data,
        params.sortBy as any
      )

      // 3. 返回转换后的数据
      return {
        data: mappedArticles,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.warn('API请求失败，使用模拟数据:', error)
      return this.getMockArticles(params)
    }
  }

  /**
   * 获取文章详情（使用映射器）
   */
  async getArticleDetail(id: number): Promise<ViewArticleData> {
    try {
      // 1. 获取文章详情
      const response: HttpResponse<ApiArticleData> =
        await chonglouDataLayer.get(`/articles/${id}`, {
          cache: true,
          cacheTime: 10 * 60 * 1000,
          requestId: `article-detail-${id}`
        })

      // 2. 获取相关文章
      const relatedResponse: HttpResponse<ApiArticleData[]> =
        await chonglouDataLayer.get(`/articles/${id}/related`, {
          cache: true,
          cacheTime: 15 * 60 * 1000
        })

      // 3. 使用映射器转换数据
      const mappedArticle = this.articleMapper.mapArticleDetail(
        response.data,
        relatedResponse.data
      )

      return mappedArticle
    } catch (error) {
      console.warn('API请求失败，使用模拟数据:', error)
      return this.getMockArticleDetail(id)
    }
  }
}

// 导出服务实例
const articleService = new ArticleService()

export { articleService }
