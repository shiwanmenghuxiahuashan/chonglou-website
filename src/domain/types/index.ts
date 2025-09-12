/**
 * 域类型统一导出文件
 * JSON:API 数据 → 扁平化数据 → 视图数据
 * JsonApiArticleData → FlattenedArticleData → ViewArticleData
 */

// 基础 JSON:API 类型
export type { Identification } from './jsonapi'

// 文章相关类型
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
} from './article'

// 账户相关类型
export type {
  JsonApiAccountData,
  FlattenedAccountData,
  ViewAccountData,
  AuthorInfo
} from './account'

// 媒体相关类型
export type {
  MimeType,
  MimeSubtype,
  JsonApiMediaData,
  FlattenedMediaData,
  ViewMediaData,
  MediaInfo
} from './media'
