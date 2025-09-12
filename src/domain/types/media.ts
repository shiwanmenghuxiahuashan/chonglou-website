/**
 * 媒体相关类型定义
 * 基于设计文档 design/resouce/media.md
 */

/**
 * 媒体类型枚举
 */
type MimeType = 'video' | 'image'
type MimeSubtype =
  | 'mp4'
  | 'webm'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'gif'
  | 'webp'
  | string

/**
 * JSON:API 媒体数据结构
 */
interface JsonApiMediaData {
  type: 'media'
  id: string
  attributes: {
    url: string // 媒体文件链接，必填
    filename: string // 文件名，必填
    size?: number // 文件大小（字节）
    mime_type: MimeType // 数据类型大致分类，必填
    mime_subtype: MimeSubtype // 数据类型具体分类，必填
    description?: string // 媒体文件描述
    cover_url?: string // 视频封面/图片缩略图
  }
}

/**
 * 扁平化的媒体数据结构
 */
interface FlattenedMediaData {
  id: string
  url: string
  filename: string
  size?: number
  mime_type: MimeType
  mime_subtype: MimeSubtype
  description?: string
  cover_url?: string
}

/**
 * 视图组件需要的媒体数据结构
 */
interface ViewMediaData {
  id: string
  url: string
  filename: string
  size?: number
  type: MimeType // 简化的类型名称
  subtype: MimeSubtype // 转为驼峰命名
  description?: string
  coverUrl?: string // 转为驼峰命名

  // 视图特有的计算属性
  formattedSize?: string // 格式化的文件大小（如 "2.5 MB"）
  isImage: boolean // 是否为图片
  isVideo: boolean // 是否为视频
  displayUrl: string // 显示用的 URL（可能是缩略图或原图）
}

/**
 * 简化的媒体信息（用于文章列表等场景）
 */
interface MediaInfo {
  id: string
  url: string
  type: MimeType
  coverUrl?: string
}

// 导出所有类型
export type {
  MimeType,
  MimeSubtype,
  JsonApiMediaData,
  FlattenedMediaData,
  ViewMediaData,
  MediaInfo
}
