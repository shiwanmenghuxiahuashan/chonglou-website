/**
 * JSON:API 文章数据结构
 * 基于设计文档 design/resouce/article.md
 */
import type { Identification } from './jsonapi'

/**
 * 标签资源类型
 */
interface TagResource {
  type: 'tag'
  id: string
  attributes: {
    label: string
    color?: string
    desc?: string
  }
}

/**
 * 作者资源类型 (基于 account 资源)
 */
interface AuthorResource {
  type: 'account'
  id: string
  attributes: {
    username: string
    screen_name?: string
    description?: string
    company?: string
    location?: string
    job_title?: string
  }
}

/**
 * 媒体资源类型
 */
interface MediaResource {
  type: 'media'
  id: string
  attributes: {
    url: string
    filename: string
    size?: number
    mime_type: 'video' | 'image'
    mime_subtype: string
    description?: string
    cover_url?: string
  }
}

/**
 * JSON:API 文章数据结构
 */
interface JsonApiArticleData {
  type: 'article' // 修正：添加 type 字段，这是 JSON:API 规范要求的
  id: string
  attributes: {
    title: string
    summary: string
    content: string
    create_time: string // 秒时间戳字符串
    update_time: string // 秒时间戳字符串
    like_count: number
    view_count: number // 修正：原来写的是 read_count，应该是 view_count
  }
  relationships: {
    author: Identification[] // 修正：应该是 Identification[]，不是 Array<Identification>
    media?: Identification[] // 修正：添加可选标记，媒体文件不是必须的
    tags?: Identification[] // 修正：添加可选标记，标签不是必须的
  }
  // 修正：includes 不应该是空数组，而是可能包含相关资源的数组
}

/**
 * 扁平化的文章数据结构
 * 将 JSON:API 结构扁平化后的中间数据格式
 */
interface FlattenedArticleData {
  id: string
  // 修正：移除重复的 title 字段
  title: string
  summary: string
  content: string
  create_time: string // 保持原始时间戳字符串格式
  update_time: string // 保持原始时间戳字符串格式
  view_count: number // 修正：改为 view_count
  like_count: number
  // 关系数据保持为 Identification 格式，便于后续处理
  author: Identification[] // 修正：应该是数组，一篇文章可能有多个作者
  media?: Identification[] // 修正：可选字段
  tags?: Identification[] // 修正：可选字段
}

/**
 * 视图组件需要的文章数据结构
 * - 由 FlattenedArticleData 转换而来
 * - 包含前端展示所需的所有格式化数据
 */
interface ViewArticleData {
  id: string
  title: string
  summary: string
  content: string
  // 修正：作者信息应该是对象，不是嵌套的复杂结构
  author: {
    id: string
    name: string // 修正：对应 screen_name 或 username
    avatar?: string // 修正：头像不在 account 基础字段中，可能来自其他地方，标记为可选
    displayName: string // 修正：这个字段含义不明确，实际应该就是显示名称
    description?: string // 新增：作者描述
    jobTitle?: string // 修正：对应 job_title
  }
  // 修正：category 字段在设计文档中没有定义，应该移除或改为其他字段
  // category: string // 错误字段：设计文档中没有 category，应该用 tags
  tags: Array<{
    id: string
    label: string
    color?: string
    desc?: string
  }>
  // 修正：时间字段应该使用规范的命名和正确的数据类型
  publishedAt: Date // 修正：转换为 Date 对象，方便前端处理
  updatedAt: Date // 修正：转换为 Date 对象，方便前端处理
  viewCount: number // 修正：改为 viewCount，对应后端的 view_count
  likeCount: number // 修正：保持驼峰命名
  commentCount?: number // 修正：评论数不在基础设计中，标记为可选，可能来自其他 API
  featured?: boolean // 修正：是否精选文章，不在基础设计中，标记为可选
  status?: 'published' | 'draft' | 'archived' // 修正：文章状态不在基础设计中，标记为可选

  // 视图特有的计算属性
  formattedPublishDate: string // 格式化的发布日期字符串
  readingTime: string // 预估阅读时间
  isNew: boolean // 是否为新文章（基于发布时间计算）
  popularity: 'high' | 'medium' | 'low' // 流行度（基于浏览量和点赞数计算）

  // 可选的媒体资源信息
  media?: Array<{
    id: string
    url: string
    filename: string
    type: 'video' | 'image'
    coverUrl?: string
    description?: string
  }>
}
/**
 * 文章相关的额外类型定义
 */

// 文章状态枚举
type ArticleStatus = 'published' | 'draft' | 'archived'

// 文章流行度枚举
type ArticlePopularity = 'high' | 'medium' | 'low'

// 媒体类型枚举
type MediaType = 'video' | 'image'

// 导出所有类型
export type {
  JsonApiArticleData,
  FlattenedArticleData,
  ViewArticleData,
  TagResource,
  AuthorResource,
  MediaResource,
  ArticleStatus,
  ArticlePopularity,
  MediaType
}
