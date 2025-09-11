/**
 * 文章数据映射器
 * 将API返回的文章数据映射为视图组件需要的格式
 */

import type { ApiArticleData, ViewArticleData } from './types'

import type { MapperRule } from '@/lib/projectDomain'

import { MapperBase } from '@/lib/projectDomain'
/**
 * 文章映射器
 * 实现从 API 数据到视图数据的转换
 */
class ArticleMapper extends MapperBase<ApiArticleData, ViewArticleData> {
  constructor() {
    super('ArticleMapper', '1.0.0', {
      deep: true,
      skipNullish: true,
      enableCache: true
    })
  }

  protected defineMapping(): MapperRule<ApiArticleData, ViewArticleData>[] {
    return [
      // 基础字段直接映射
      this.createRule('id', 'id'),
      this.createRule('title', 'title'),
      this.createRule('content', 'content'),

      // 摘要字段，有默认值
      this.createRule('summary', 'summary', {
        defaultValue: (source: ApiArticleData) =>
          source.content ? `${source.content.slice(0, 200)}...` : '暂无摘要',
        required: true
      }),

      // 作者信息映射（嵌套对象）
      this.createRule('author_info.id', 'author.id'),
      this.createRule('author_info.name', 'author.name'),
      this.createRule('author_info.avatar_url', 'author.avatar', {
        defaultValue: '/default-avatar.png'
      }),

      // 作者显示名称（计算字段）
      this.createRule('author_info.name', 'author.displayName', {
        transform: (name: string) => name || '匿名用户'
      }),

      // 分类和标签
      this.createRule('category_name', 'category'),
      this.createRule('tag_list', 'tags', {
        defaultValue: []
      }),

      // 时间字段
      this.createRule('published_at', 'publishedAt'),
      this.createRule('updated_at', 'updatedAt'),

      // 统计字段
      this.createRule('view_count', 'readCount', {
        defaultValue: 0
      }),
      this.createRule('like_count', 'likeCount', {
        defaultValue: 0
      }),
      this.createRule('comment_count', 'commentCount', {
        defaultValue: 0
      }),

      // 布尔字段
      this.createRule('is_featured', 'featured', {
        defaultValue: false
      }),

      // 状态字段（需要转换）
      this.createRule('status', 'status', {
        transform: (status: string): 'published' | 'draft' | 'archived' => {
          switch (status.toLowerCase()) {
            case 'published':
            case 'active':
              return 'published'
            case 'draft':
            case 'pending':
              return 'draft'
            case 'archived':
            case 'inactive':
              return 'archived'
            default:
              return 'draft'
          }
        }
      }),

      // 计算字段：格式化发布日期
      this.createRule('published_at', 'formattedPublishDate', {
        transform: (dateStr: string) => {
          const date = new Date(dateStr)
          return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      }),

      // 计算字段：阅读时长
      this.createRule('content', 'readingTime', {
        transform: (content: string) => {
          const wordsPerMinute = 200
          const wordCount = content.length
          const minutes = Math.ceil(wordCount / wordsPerMinute)
          return `约 ${minutes} 分钟阅读`
        }
      }),

      // 计算字段：是否为新文章
      this.createRule('published_at', 'isNew', {
        transform: (dateStr: string) => {
          const publishDate = new Date(dateStr)
          const now = new Date()
          const daysDiff =
            (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 7 // 7天内的文章认为是新文章
        }
      }),

      // 计算字段：热度
      this.createRule(
        ['view_count', 'like_count', 'comment_count'],
        'popularity',
        {
          transform: (_, source: ApiArticleData) => {
            const score =
              source.view_count +
              source.like_count * 5 +
              source.comment_count * 3
            if (score > 1000) return 'high'
            if (score > 100) return 'medium'
            return 'low'
          }
        }
      )
    ]
  }

  /**
   * 映射文章列表，添加排序功能
   */
  public mapArticleList(
    apiArticles: ApiArticleData[],
    sortBy?: 'popularity' | 'date' | 'featured'
  ): ViewArticleData[] {
    let mapped = this.mapArray(apiArticles)

    // 根据指定条件排序
    if (sortBy) {
      mapped = this.sortArticles(mapped, sortBy)
    }

    return mapped
  }

  /**
   * 映射单篇文章，添加相关文章
   */
  public mapArticleDetail(
    apiArticle: ApiArticleData
  ): ViewArticleData & { relatedArticles?: ViewArticleData[] } {
    const mapped = this.map(apiArticle)

    return {
      ...mapped
    }
  }

  /**
   * 排序文章
   */
  private sortArticles(
    article: ViewArticleData[],
    sortBy: string
  ): ViewArticleData[] {
    return [...article].sort((a, b) => {
      switch (sortBy) {
        case 'popularity': {
          const popularityOrder = { high: 3, medium: 2, low: 1 }
          return popularityOrder[b.popularity] - popularityOrder[a.popularity]
        }

        case 'date':
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          )

        case 'featured':
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          )

        default:
          return 0
      }
    })
  }

  /**
   * 过滤文章
   */
  public filterArticles(
    article: ViewArticleData[],
    filters: {
      category?: string
      tags?: string[]
      status?: string
      featured?: boolean
    }
  ): ViewArticleData[] {
    return article.filter(article => {
      if (filters.category && article.category !== filters.category) {
        return false
      }

      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag =>
          article.tags.includes(tag)
        )
        if (!hasMatchingTag) return false
      }

      if (filters.status && article.status !== filters.status) {
        return false
      }

      if (
        filters.featured !== undefined &&
        article.featured !== filters.featured
      ) {
        return false
      }

      return true
    })
  }

  /**
   * 获取文章统计信息
   */
  public getArticleStats(article: ViewArticleData[]): {
    total: number
    byCategory: Record<string, number>
    byStatus: Record<string, number>
    byPopularity: Record<string, number>
    featured: number
  } {
    const stats = {
      total: article.length,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byPopularity: {} as Record<string, number>,
      featured: 0
    }

    article.forEach(article => {
      // 按分类统计
      stats.byCategory[article.category] =
        (stats.byCategory[article.category] || 0) + 1

      // 按状态统计
      stats.byStatus[article.status] = (stats.byStatus[article.status] || 0) + 1

      // 按热度统计
      stats.byPopularity[article.popularity] =
        (stats.byPopularity[article.popularity] || 0) + 1

      // 精选文章统计
      if (article.featured) {
        stats.featured++
      }
    })

    return stats
  }
}

export { ArticleMapper, ApiArticleData, ViewArticleData }
