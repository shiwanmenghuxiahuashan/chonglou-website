/**
 * 账户相关类型定义
 * 基于设计文档 design/resouce/account.md
 */

/**
 * JSON:API 账户数据结构
 */
interface JsonApiAccountData {
  type: 'account'
  id: string
  attributes: {
    username: string // 登录用户名，必填
    screen_name?: string // 昵称，显示的用户名称
    description?: string // 个人简介
    company?: string // 工作单位
    location?: string // 所在地
    job_title?: string // 工作职位
  }
}

/**
 * 扁平化的账户数据结构
 */
interface FlattenedAccountData {
  id: string
  username: string
  screen_name?: string
  description?: string
  company?: string
  location?: string
  job_title?: string
}

/**
 * 视图组件需要的账户数据结构
 */
interface ViewAccountData {
  id: string
  username: string
  screen_name: string
  avatar?: string // 头像 URL，可能来自其他 API
  description?: string
  company?: string
  location?: string
  job_title?: string // 转为驼峰命名
}

/**
 * 简化的作者信息（用于文章列表等场景）
 */
interface AuthorInfo {
  id: string
  name: string // 显示名称
  avatar?: string
  job_title?: string
}

// 导出所有类型
export type {
  JsonApiAccountData,
  FlattenedAccountData,
  ViewAccountData,
  AuthorInfo
}
