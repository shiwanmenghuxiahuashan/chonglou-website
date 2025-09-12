import { assign, cloneDeep, forIn, isArray, isEmpty, map } from 'lodash-unified'
import * as config from './config'
import * as verifier from './verifier'

import type {
  FlattenedResource,
  JsonApiResource,
  JsonApiResourceIdentifier,
  ParseConfig
} from './types'

/**
 * JSON:API 数据解析器
 * 用于将符合 JSON:API 规范的数据扁平化为更易于前端使用的格式
 */
class Jsonapi {
  /**
   * 解析配置
   */
  private config: Required<ParseConfig> | null = null

  /**
   * 指定资源集合
   */
  private specifiedSet: Record<string, JsonApiResource[]> | null = null

  /**
   * included 资源的 HashMap，格式：{type-id: resource}
   */
  private includedMap: Record<string, JsonApiResource> | null = null

  /**
   * 循环引用检测缓存
   */
  private circularCache = new Set<string>()

  /**
   * 扁平化单个资源对象
   * @param resourceObject - 要扁平化的资源对象
   * @param extraMeta - 额外的元数据
   * @returns 扁平化后的资源
   */
  /**
   * 扁平化资源对象
   * @param resourceObject - 要扁平化的资源对象
   * @param extraMeta - 额外的元数据
   * @returns 扁平化的资源对象
   */
  private flatten(
    resourceObject: JsonApiResource,
    extraMeta?: Record<string, any>
  ): FlattenedResource {
    if (!verifier.validateResource(resourceObject)) {
      throw new Error(`Invalid resource object: missing type or id`)
    }

    const { id, type, attributes = {}, meta } = resourceObject

    // 安全地合并属性和元数据，避免原型污染
    const flattened: FlattenedResource = Object.assign(
      Object.create(null),
      extraMeta && cloneDeep(extraMeta),
      cloneDeep(attributes),
      { id, type }
    )

    // 保存原始 meta 数据
    if (meta && !isEmpty(meta)) {
      flattened._meta = cloneDeep(meta)
    }

    return flattened
  }

  /**
   * 获取匹配的资源
   * @param data - 要匹配的数据对象
   * @param includedMap - 包含的资源映射表
   * @param flatIncludedRelated - 是否扁平化关联资源
   * @param callLevel - 调用层级
   * @returns 匹配的资源对象
   */
  private getMatchingResource(
    data: JsonApiResourceIdentifier,
    includedMap: Record<string, JsonApiResource> | null,
    flatIncludedRelated: boolean,
    callLevel = 0
  ): FlattenedResource | JsonApiResourceIdentifier {
    if (!includedMap) {
      return data
    }

    const resourceKey = `${data.type}-${data.id}`
    const match = includedMap[resourceKey]

    // 没有匹配的资源，返回原始关系信息
    if (!match) {
      return data
    }

    // 循环引用检测
    if (this.circularCache.has(resourceKey)) {
      return { id: data.id, type: data.type }
    }

    this.circularCache.add(resourceKey)

    try {
      let processedMatch = match
      if (flatIncludedRelated) {
        processedMatch = this.populateRelatedFields(
          match,
          includedMap,
          true,
          callLevel
        )
      }

      return this.flatten(processedMatch, assign({}, match.meta, data.meta))
    } finally {
      // 清理循环引用标记
      this.circularCache.delete(resourceKey)
    }
  }

  /**
   * 填充资源对象的相关字段
   * @param resourceObject - 要填充的资源对象
   * @param includedMap - 包含资源的映射
   * @param flatIncludedRelated - 是否扁平化包含的相关资源
   * @param callLevel - 函数的调用层级
   * @returns 填充了相关字段的资源对象
   */
  private populateRelatedFields(
    resourceObject: JsonApiResource,
    includedMap: Record<string, JsonApiResource> | null,
    flatIncludedRelated = false,
    callLevel = 0
  ): JsonApiResource {
    // 验证资源对象
    if (!verifier.validateResource(resourceObject)) {
      throw new Error('Invalid resource object')
    }

    // 如果无属性则赋值空对象 - attributes 存放着"真正的返回数据"
    const { attributes = {}, relationships } = resourceObject

    // 超出调用层级限制，返回基础数据避免无限递归
    if (callLevel >= (this.config?.callLevel || 5)) {
      // 在最后一层将关系的 data 直接赋值给 attributes
      if (relationships) {
        forIn(relationships, (relationship, relationshipKey) => {
          if (relationship.data) {
            attributes[relationshipKey] = relationship.data
          }
        })
      }
      resourceObject.attributes = attributes
      return resourceObject
    }

    // 递增调用层级
    callLevel++

    // 处理关系字段
    if (relationships) {
      forIn(relationships, (relationship, relationshipKey) => {
        // 验证关系对象结构
        if (!verifier.validateRelationship(relationship)) {
          return // 跳过无效的关系
        }

        // 如果关系对象有 meta 则将其追加到资源的 meta 中
        if (relationship.meta && !isEmpty(relationship.meta)) {
          if (!resourceObject.meta) {
            resourceObject.meta = {}
          }
          resourceObject.meta[relationshipKey] = relationship.meta
        }

        let fields = null

        if (relationship.data) {
          const matchingHandler = (data: JsonApiResourceIdentifier) => {
            return this.getMatchingResource(
              data,
              includedMap,
              flatIncludedRelated,
              callLevel
            )
          }

          fields = isArray(relationship.data)
            ? map(relationship.data, matchingHandler)
            : matchingHandler(relationship.data)
        } else {
          // 在 data 不存在的情况下，将关系对象的其他字段(排除 links)赋值给 attributes
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { links, ...rest } = relationship
          const other = Object.fromEntries(
            Object.entries(rest).filter(([, value]) => !isEmpty(value))
          )
          fields = isEmpty(other) ? null : other
        }

        attributes[relationshipKey] = fields
      })
    }

    resourceObject.attributes = attributes
    return resourceObject
  }

  /**
   * 设置解析配置
   * @param parseConfig - 解析配置
   */
  private setConfig(parseConfig?: ParseConfig): void {
    this.resetConfig()

    try {
      this.config = config.genConfig(parseConfig)

      // 初始化指定资源集合
      if (this.config.collect) {
        this.specifiedSet = {}
        for (const resourceType of this.config.collect) {
          this.specifiedSet[resourceType] = []
        }
      }
    } catch (error) {
      throw new Error(`Configuration error: ${error.message}`)
    }
  }

  /**
   * 重置配置
   */
  private resetConfig(): void {
    this.config = null
    this.specifiedSet = null
    this.includedMap = null
    this.circularCache.clear()
  }

  /**
   * 解析符合 JSON:API Document Structure 的对象为指定结构
   * @see https://jsonapi.org/format/#document-structure
   * @param jsonapiDocument - JSON:API 文档
   * @param parseConfig - 解析配置
   * @returns 解析后的对象或原始文档
   */
  parse(
    jsonapiDocument: unknown,
    parseConfig?: ParseConfig
  ): FlattenedResource | FlattenedResource[] | unknown {
    const isDev =
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test' ||
      process.env.VITEST === 'true'

    // 开发环境和测试环境下进行完整的 JSON:API 结构验证
    if (isDev) {
      const validation = verifier.validateJsonApiDocument(jsonapiDocument)
      if (!validation.isValid) {
        // eslint-disable-next-line no-console
        console.error('JSON:API document validation failed:')
        validation.errors.forEach(error => {
          // eslint-disable-next-line no-console
          console.error(`  - ${error}`)
        })
        // 在开发环境下，不符合规范的直接返回原始文档
        return jsonapiDocument
      }
      jsonapiDocument = validation.document!
    } else {
      // 生产环境下使用基础验证
      if (!verifier.baseCheck(jsonapiDocument)) {
        return jsonapiDocument
      }
    }

    try {
      this.setConfig(parseConfig)
      return this.parsing(jsonapiDocument as any)
    } catch (error) {
      if (isDev) {
        // eslint-disable-next-line no-console
        console.error('Parse error:', error)
        throw error // 开发环境下抛出错误便于调试
      }
      return jsonapiDocument // 生产环境下返回原始文档
    }
  }

  /**
   * 构建 included 资源的 HashMap
   * @param jsonapiDocument - JSON:API 文档
   * @returns included 资源映射表
   */
  private buildIncludeMap(
    jsonapiDocument: any
  ): Record<string, JsonApiResource> | null {
    if (!jsonapiDocument.included?.length) {
      return null
    }

    const includedMap: Record<string, JsonApiResource> = {}
    const isParse = this.config?.collectIsParse || false

    for (const resourceObject of jsonapiDocument.included) {
      // 验证资源对象
      if (!verifier.validateResource(resourceObject)) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('Invalid resource in included:', resourceObject)
        }
        continue
      }

      // 收集指定类型的资源
      if (this.specifiedSet?.[resourceObject.type]) {
        this.specifiedSet[resourceObject.type].push(
          isParse
            ? this.flatten(resourceObject, resourceObject.relationships)
            : resourceObject
        )
      }

      // 构建资源映射
      const resourceKey = `${resourceObject.type}-${resourceObject.id}`
      includedMap[resourceKey] = resourceObject
    }

    return includedMap
  }

  /**
   * 扁平化单个资源
   * @param resourceObject - 资源对象
   * @returns 扁平化后的资源
   */
  private flattenResource(resourceObject: JsonApiResource): FlattenedResource {
    if (!resourceObject) {
      throw new Error('Resource object is required')
    }

    // 填充关系字段，解析 includedMap
    if (this.config?.parseIncluded && this.includedMap) {
      resourceObject = this.populateRelatedFields(
        resourceObject,
        this.includedMap,
        this.config.flatIncludedRelated
      )
    }

    return this.flatten(resourceObject)
  }

  /**
   * 执行解析逻辑
   * @param jsonapiDocument - JSON:API 文档
   * @returns 解析结果
   */
  private parsing(jsonapiDocument: any): any {
    // 验证文档是否包含有效数据
    if (
      !jsonapiDocument?.data ||
      (Array.isArray(jsonapiDocument.data) && jsonapiDocument.data.length === 0)
    ) {
      return jsonapiDocument
    }

    try {
      // 构建 included 资源映射
      this.includedMap = this.buildIncludeMap(jsonapiDocument)

      // 扁平化数据 - 支持单个资源或资源数组
      const parsedData = isArray(jsonapiDocument.data)
        ? map(jsonapiDocument.data, (resource: JsonApiResource) =>
            this.flattenResource(resource)
          )
        : this.flattenResource(jsonapiDocument.data)

      // 构建解析结果
      const result = {
        data: parsedData,
        jsonapi: assign(jsonapiDocument.jsonapi || {}, {
          parsed: true
        }),
        meta: jsonapiDocument.meta || null,
        links: jsonapiDocument.links || null,
        ...(this.specifiedSet && { collect: this.specifiedSet })
      }

      // 清理临时状态
      this.specifiedSet = null
      this.circularCache.clear()

      return result
    } catch (error) {
      // 在生产环境中，返回原始文档而不是抛出错误
      if (process.env.NODE_ENV === 'development') {
        throw error
      }
      return jsonapiDocument
    }
  }

  /**
   * 静态方法：创建新的解析器实例
   * @param parseConfig - 解析配置
   * @returns 新的解析器实例
   */
  static create(parseConfig?: ParseConfig): Jsonapi {
    const parser = new Jsonapi()
    if (parseConfig) {
      parser.setConfig(parseConfig)
    }
    return parser
  }

  /**
   * 静态方法：直接解析文档
   * @param jsonapiDocument - JSON:API 文档
   * @param parseConfig - 解析配置
   * @returns 解析结果
   */
  static parse(
    jsonapiDocument: unknown,
    parseConfig?: ParseConfig
  ): FlattenedResource | FlattenedResource[] | unknown {
    const parser = new Jsonapi()
    return parser.parse(jsonapiDocument, parseConfig)
  }
}

// 创建默认实例
const defaultJsonApiParser = new Jsonapi()

// 兼容旧的导出方式
export default defaultJsonApiParser

// 同时导出类，支持创建多个实例
export { Jsonapi }
