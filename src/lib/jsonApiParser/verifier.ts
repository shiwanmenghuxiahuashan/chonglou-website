import { isArray, isObject, isString, isUndefined } from 'lodash-unified'

import type {
  JsonApiDocument,
  JsonApiRelationship,
  JsonApiResource
} from './types'

/**
 * 验证 JSON:API 规范的完整文档结构
 * @param doc - JSON:API Document Structure 对象
 * @returns 验证结果对象
 */
const validateJsonApiDocument = (
  doc: unknown
): {
  isValid: boolean
  errors: string[]
  document?: JsonApiDocument
} => {
  const errors: string[] = []

  // 基础类型检查
  if (!doc || !isObject(doc)) {
    return {
      isValid: false,
      errors: ['Document must be an object']
    }
  }

  const jsonApiDoc = doc as JsonApiDocument
  const { data, errors: docErrors, meta, jsonapi, links, included } = jsonApiDoc

  // 检查顶层必需属性
  if (isUndefined(data) && isUndefined(docErrors) && isUndefined(meta)) {
    errors.push('Document must contain at least one of: data, errors, or meta')
  }

  // data 和 errors 不能同时存在
  if (data !== undefined && docErrors !== undefined) {
    errors.push('Document cannot contain both data and errors')
  }

  // 验证 jsonapi 对象
  if (jsonapi !== undefined) {
    if (!isObject(jsonapi)) {
      errors.push('jsonapi member must be an object')
    } else {
      const { version, meta: jsonApiMeta } = jsonapi as any
      if (version !== undefined && !isString(version)) {
        errors.push('jsonapi.version must be a string')
      }
      if (jsonApiMeta !== undefined && !isObject(jsonApiMeta)) {
        errors.push('jsonapi.meta must be an object')
      }
    }
  }

  // 验证 links 对象
  if (links !== undefined && !isObject(links)) {
    errors.push('links must be an object')
  }

  // 验证 meta 对象
  if (meta !== undefined && !isObject(meta)) {
    errors.push('meta must be an object')
  }

  // 验证 data 结构
  if (data !== undefined) {
    if (isArray(data)) {
      data.forEach((resource, index) => {
        const resourceErrors = validateResourceObject(resource)
        resourceErrors.forEach(error => {
          errors.push(`data[${index}]: ${error}`)
        })
      })
    } else if (data !== null) {
      const resourceErrors = validateResourceObject(data)
      resourceErrors.forEach(error => {
        errors.push(`data: ${error}`)
      })
    }
  }

  // 验证 included 数组
  if (included !== undefined) {
    if (!isArray(included)) {
      errors.push('included must be an array')
    } else {
      included.forEach((resource, index) => {
        const resourceErrors = validateResourceObject(resource)
        resourceErrors.forEach(error => {
          errors.push(`included[${index}]: ${error}`)
        })
      })
    }
  }

  // 验证 errors 数组
  if (docErrors !== undefined) {
    if (!isArray(docErrors)) {
      errors.push('errors must be an array')
    } else {
      docErrors.forEach((error, index) => {
        const errorErrors = validateErrorObject(error)
        errorErrors.forEach(err => {
          errors.push(`errors[${index}]: ${err}`)
        })
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    document: errors.length === 0 ? jsonApiDoc : undefined
  }
}

/**
 * 验证资源对象结构
 * @param resource - 要验证的资源对象
 * @returns 错误信息数组
 */
const validateResourceObject = (resource: unknown): string[] => {
  const errors: string[] = []

  if (!isObject(resource)) {
    return ['Resource must be an object']
  }

  const res = resource as JsonApiResource
  const { type, id, attributes, relationships, links, meta } = res

  // type 是必需的
  if (!isString(type) || type.trim() === '') {
    errors.push('Resource must have a non-empty string type')
  }

  // id 是必需的（除了 POST 请求创建资源时）
  if (!isString(id) || id.trim() === '') {
    errors.push('Resource must have a non-empty string id')
  }

  // 验证 attributes 对象
  if (attributes !== undefined && !isObject(attributes)) {
    errors.push('attributes must be an object')
  }

  // 验证 relationships 对象
  if (relationships !== undefined) {
    if (!isObject(relationships)) {
      errors.push('relationships must be an object')
    } else {
      Object.entries(relationships).forEach(([key, relationship]) => {
        const relationshipErrors = validateRelationshipObject(relationship)
        relationshipErrors.forEach(error => {
          errors.push(`relationships.${key}: ${error}`)
        })
      })
    }
  }

  // 验证 links 对象
  if (links !== undefined && !isObject(links)) {
    errors.push('links must be an object')
  }

  // 验证 meta 对象
  if (meta !== undefined && !isObject(meta)) {
    errors.push('meta must be an object')
  }

  return errors
}

/**
 * 验证关系对象结构
 * @param relationship - 要验证的关系对象
 * @returns 错误信息数组
 */
const validateRelationshipObject = (relationship: unknown): string[] => {
  const errors: string[] = []

  if (!isObject(relationship)) {
    return ['Relationship must be an object']
  }

  const rel = relationship as JsonApiRelationship
  const { data, links, meta } = rel

  // 关系对象必须至少包含 data, links, 或 meta 中的一个
  if (data === undefined && links === undefined && meta === undefined) {
    errors.push(
      'Relationship must contain at least one of: data, links, or meta'
    )
  }

  // 验证 data
  if (data !== undefined) {
    if (data === null) {
      // null 是有效的（表示空的 to-one 关系）
    } else if (isArray(data)) {
      // to-many 关系
      data.forEach((identifier, index) => {
        const identifierErrors = validateResourceIdentifier(identifier)
        identifierErrors.forEach(error => {
          errors.push(`data[${index}]: ${error}`)
        })
      })
    } else {
      // to-one 关系
      const identifierErrors = validateResourceIdentifier(data)
      identifierErrors.forEach(error => {
        errors.push(`data: ${error}`)
      })
    }
  }

  // 验证 links 对象
  if (links !== undefined && !isObject(links)) {
    errors.push('links must be an object')
  }

  // 验证 meta 对象
  if (meta !== undefined && !isObject(meta)) {
    errors.push('meta must be an object')
  }

  return errors
}

/**
 * 验证资源标识符对象
 * @param identifier - 要验证的资源标识符
 * @returns 错误信息数组
 */
const validateResourceIdentifier = (identifier: unknown): string[] => {
  const errors: string[] = []

  if (!isObject(identifier)) {
    return ['Resource identifier must be an object']
  }

  const id = identifier as any
  const { type, id: resourceId, meta } = id

  // type 是必需的
  if (!isString(type) || type.trim() === '') {
    errors.push('Resource identifier must have a non-empty string type')
  }

  // id 是必需的
  if (!isString(resourceId) || resourceId.trim() === '') {
    errors.push('Resource identifier must have a non-empty string id')
  }

  // 验证 meta 对象
  if (meta !== undefined && !isObject(meta)) {
    errors.push('meta must be an object')
  }

  return errors
}

/**
 * 验证错误对象结构
 * @param error - 要验证的错误对象
 * @returns 错误信息数组
 */
const validateErrorObject = (error: unknown): string[] => {
  const errors: string[] = []

  if (!isObject(error)) {
    return ['Error must be an object']
  }

  const err = error as any
  const { id, links, status, code, title, detail, source, meta } = err

  // 验证各个字段类型
  if (id !== undefined && !isString(id)) {
    errors.push('error.id must be a string')
  }

  if (links !== undefined && !isObject(links)) {
    errors.push('error.links must be an object')
  }

  if (status !== undefined && !isString(status)) {
    errors.push('error.status must be a string')
  }

  if (code !== undefined && !isString(code)) {
    errors.push('error.code must be a string')
  }

  if (title !== undefined && !isString(title)) {
    errors.push('error.title must be a string')
  }

  if (detail !== undefined && !isString(detail)) {
    errors.push('error.detail must be a string')
  }

  if (source !== undefined && !isObject(source)) {
    errors.push('error.source must be an object')
  }

  if (meta !== undefined && !isObject(meta)) {
    errors.push('error.meta must be an object')
  }

  return errors
}

/**
 * 基础检查，验证 JSON:API 文档结构
 * @param doc - JSON:API Document Structure 对象
 * @returns 是否通过基础检查
 */
const baseCheck = (doc: unknown): doc is JsonApiDocument => {
  // 不是对象或值无效则停止解析
  if (!doc || !isObject(doc)) {
    return false
  }

  const jsonApiDoc = doc as JsonApiDocument
  const { data, errors, meta, jsonapi } = jsonApiDoc

  // 如果 top-level 的三个属性 data, errors, meta 都未定义则停止解析
  if (isUndefined(data) && isUndefined(errors) && isUndefined(meta)) {
    return false
  }

  // 如果已解析则停止解析并返回解析结果
  if (jsonapi?.parsed) {
    return false
  }

  return true
}

/**
 * 验证资源对象结构（简化版，兼容现有代码）
 * @param resource - 要验证的资源对象
 * @returns 是否为有效的资源对象
 */
const validateResource = (resource: unknown): boolean => {
  if (!isObject(resource)) {
    return false
  }

  const res = resource as Record<string, any>
  return typeof res.type === 'string' && typeof res.id === 'string'
}

/**
 * 验证关系对象结构（简化版，兼容现有代码）
 * @param relationship - 要验证的关系对象
 * @returns 是否为有效的关系对象
 */
const validateRelationship = (relationship: unknown): boolean => {
  if (!isObject(relationship)) {
    return false
  }

  const rel = relationship as Record<string, any>
  // 关系对象必须至少包含 data, links, 或 meta 中的一个
  return (
    rel.data !== undefined || rel.links !== undefined || rel.meta !== undefined
  )
}

export {
  baseCheck,
  validateResource,
  validateRelationship,
  validateJsonApiDocument,
  validateResourceObject,
  validateRelationshipObject,
  validateResourceIdentifier,
  validateErrorObject
}
