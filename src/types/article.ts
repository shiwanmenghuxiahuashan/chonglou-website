// 作者信息
export interface Author {
  id: number
  name: string
  avatar: string
  bio?: string
}

// 文章基础信息
export interface Article {
  id: number
  title: string
  summary: string
  content: string
  tags: string[]
  category: string
  author: Author
  publishedAt: string
  updatedAt: string
  readCount: number
  likeCount: number
  commentCount: number
  featured: boolean
  status: 'published' | 'draft' | 'archived'
}

// 文章详情（包含更多信息）
export interface ArticleDetail extends Article {
  seo?: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  relatedArticles?: {
    id: number
    title: string
    summary: string
  }[]
}

// 文章查询参数
export interface ArticleQueryParams {
  page?: number
  pageSize?: number
  category?: string
  tags?: string[]
  search?: string
  sortBy?: 'publishedAt' | 'readCount' | 'likeCount'
  sortOrder?: 'asc' | 'desc'
  status?: 'published' | 'draft' | 'archived' | 'all'
}

// 分页信息
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

// 文章分类
export interface Category {
  id: string
  name: string
  description?: string
  count: number
}

// 标签
export interface Tag {
  name: string
  count: number
  color?: string
}

// 文章统计
export interface ArticleStats {
  totalArticles: number
  totalViews: number
  totalLikes: number
  totalComments: number
  categoriesCount: number
  tagsCount: number
}
