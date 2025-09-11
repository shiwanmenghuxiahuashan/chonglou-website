/**
 *  API 返回的原始文章数据结构
 */
interface ApiArticleData {
  id: string
  title: string
  content: string
  summary?: string
  author_info: {
    id: string
    name: string
    avatar_url?: string
  }
  category_name: string
  tag_list: string[]
  published_at: string
  updated_at: string
  view_count: number
  like_count: number
  comment_count: number
  is_featured: boolean
  status: string
}

/**
 * 视图组件需要的文章数据结构
 */
interface ViewArticleData {
  id: string
  title: string
  summary: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
    displayName: string
  }
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  readCount: number
  likeCount: number
  commentCount: number
  featured: boolean
  status: 'published' | 'draft' | 'archived'
  // 视图特有的计算属性
  formattedPublishDate: string
  readingTime: string
  isNew: boolean
  popularity: 'high' | 'medium' | 'low'
}
export type { ApiArticleData, ViewArticleData }
