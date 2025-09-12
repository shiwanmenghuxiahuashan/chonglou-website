import * as config from './config'
import * as verifier from './verifier'
import { MapPool, PlainObjectPool, SetPool } from './ObjectPool'
import { ParserUtils } from './ParserUtils'

import type {
  FlattenedResource,
  JsonApiDocument,
  JsonApiRelationship,
  JsonApiResource,
  JsonApiResourceIdentifier,
  ParseConfig
} from './types'

/**
 * 优化版 JSON:API 数据解析器
 *
 * 处理步骤：
 * 1. 文档验证 - 验证输入的 JSON:API 文档结构
 * 2. 配置初始化 - 设置解析配置和对象池
 * 3. 构建资源映射 - 将 included 资源构建为高效的查找表
 * 4. 数据扁平化 - 将资源对象转换为扁平结构
 * 5. 关系解析 - 处理资源间的关联关系
 * 6. 结果构建 - 组装最终的解析结果
 * 7. 资源清理 - 释放对象池资源
 */
class OptimizedJsonapi {
  // === 对象池管理 ===
  private mapPool = new MapPool(20)
  private setPool = new SetPool(10)
  private objectPool = new PlainObjectPool(100)

  // === 解析状态 ===
  private config: Required<ParseConfig> | null = null
  private includedMap: Map<string, JsonApiResource> | null = null
  private circularRefGuard: Set<string> | null = null
  private specifiedCollections: Record<string, JsonApiResource[]> | null = null

  /**
   * 步骤1: 文档验证
   */
  private validateDocument(document: unknown): {
    isValid: boolean
    validatedDocument?: JsonApiDocument
    errors?: string[]
  } {
    const isDevelopment = this.isDevelopmentMode()

    if (isDevelopment) {
      // 开发环境：完整验证
      const validation = verifier.validateJsonApiDocument(document)
      if (!validation.isValid) {
        this.logValidationErrors(validation.errors)
        return { isValid: false, errors: validation.errors }
      }
      return { isValid: true, validatedDocument: validation.document! }
    } else {
      // 生产环境：快速验证
      if (!verifier.baseCheck(document)) {
        return { isValid: false }
      }
      return { isValid: true, validatedDocument: document as JsonApiDocument }
    }
  }

  // === 配置管理 ===

  /**
   * 设置解析配置（为了向后兼容性）
   */
  setConfig(parseConfig?: ParseConfig): void {
    // 暂时存储配置，在下次解析时使用
    this.tempConfig = parseConfig
  }

  private tempConfig: ParseConfig | undefined

  /**
   * 步骤2: 配置初始化
   */
  private initializeConfig(parseConfig?: ParseConfig): void {
    this.resetState()

    // 优先使用方法参数，然后是临时配置
    const configToUse = parseConfig || this.tempConfig

    try {
      this.config = config.genConfig(configToUse)
      this.initializeCollections()
    } catch (error) {
      throw new Error(`配置初始化失败: ${(error as Error).message}`)
    }
  }

  /**
   * 步骤3: 构建资源映射
   */
  private buildResourceMap(
    document: JsonApiDocument
  ): Map<string, JsonApiResource> | null {
    if (!document.included?.length) {
      return null
    }

    const resourceMap = this.mapPool.get()
    const isParsing = this.config?.collectIsParse || false

    for (const resource of document.included) {
      if (!ParserUtils.isValidResource(resource)) {
        if (this.isDevelopmentMode()) {
          // 在开发模式下记录警告
        }
        continue
      }

      // 收集指定类型的资源
      this.collectResourceIfSpecified(resource, isParsing)

      // 构建查找映射
      const resourceKey = ParserUtils.generateResourceKey(resource)
      resourceMap.set(resourceKey, resource)
    }

    return resourceMap
  }

  /**
   * 步骤4: 数据扁平化
   */
  private flattenResource(resource: JsonApiResource): FlattenedResource {
    if (!ParserUtils.isValidResource(resource)) {
      throw new Error('资源对象缺少必需的 type 或 id 字段')
    }

    // 处理关系字段
    let processedResource = resource
    if (this.config?.parseIncluded && this.includedMap) {
      processedResource = this.resolveRelationships(
        resource,
        this.includedMap,
        this.config.flatIncludedRelated
      )
    }

    return this.createFlattenedResource(processedResource)
  }

  /**
   * 步骤5: 关系解析
   */
  private resolveRelationships(
    resource: JsonApiResource,
    resourceMap: Map<string, JsonApiResource>,
    shouldFlattenRelated: boolean,
    callDepth = 0
  ): JsonApiResource {
    // 防止无限递归
    if (callDepth >= (this.config?.callLevel || 5)) {
      return this.handleMaxDepthReached(resource)
    }

    const { attributes = {}, relationships } = resource

    if (!relationships) {
      return resource
    }

    // 处理所有关系
    ParserUtils.forOwnProperties(relationships, (relationship, relationKey) => {
      if (!verifier.validateRelationship(relationship)) {
        return // 跳过无效关系
      }

      this.processRelationship(
        attributes,
        relationship,
        relationKey as string,
        resourceMap,
        shouldFlattenRelated,
        callDepth + 1
      )
    })

    return { ...resource, attributes }
  }

  /**
   * 步骤6: 结果构建
   */
  private buildParseResult(
    document: JsonApiDocument,
    parsedData: FlattenedResource | FlattenedResource[]
  ): any {
    const result = this.objectPool.get()

    ParserUtils.safeAssign(result, {
      data: parsedData,
      jsonapi: ParserUtils.safeAssign(
        this.objectPool.get(),
        document.jsonapi || {},
        { parsed: true }
      ),
      meta: document.meta || null,
      links: document.links || null
    })

    // 添加收集的资源
    if (
      this.specifiedCollections &&
      !ParserUtils.isEmpty(this.specifiedCollections)
    ) {
      result.collect = this.specifiedCollections
    }

    return result
  }

  /**
   * 步骤7: 资源清理
   */
  private cleanupResources(): void {
    if (this.includedMap) {
      this.mapPool.release(this.includedMap)
      this.includedMap = null
    }

    if (this.circularRefGuard) {
      this.setPool.release(this.circularRefGuard)
      this.circularRefGuard = null
    }

    this.specifiedCollections = null
  }

  /**
   * 主解析方法 - 协调所有处理步骤
   */
  parse(
    jsonapiDocument: unknown,
    parseConfig?: ParseConfig
  ): FlattenedResource | FlattenedResource[] | unknown {
    try {
      // 步骤1: 文档验证
      const validation = this.validateDocument(jsonapiDocument)
      if (!validation.isValid) {
        return jsonapiDocument // 返回原始文档
      }

      const document = validation.validatedDocument!

      // 步骤2: 配置初始化
      this.initializeConfig(parseConfig)

      // 检查是否有数据需要解析
      if (!this.hasDataToParse(document)) {
        return document
      }

      // 步骤3: 构建资源映射
      this.includedMap = this.buildResourceMap(document)

      // 步骤4: 数据扁平化
      const parsedData = Array.isArray(document.data)
        ? ParserUtils.mapArray(document.data, resource =>
            this.flattenResource(resource)
          )
        : this.flattenResource(document.data)

      // 步骤6: 结果构建
      const result = this.buildParseResult(document, parsedData)
      return result
    } catch (error) {
      return this.handleParseError(error, jsonapiDocument)
    } finally {
      // 步骤7: 资源清理
      this.cleanupResources()
    }
  }

  // === 私有辅助方法 ===

  private isDevelopmentMode(): boolean {
    return (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test' ||
      process.env.VITEST === 'true'
    )
  }

  private logValidationErrors(errors: string[]): void {
    console.error('JSON:API 文档验证失败:')
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
  }

  private resetState(): void {
    this.cleanupResources()
    this.config = null
  }

  private initializeCollections(): void {
    if (this.config?.collect) {
      this.specifiedCollections = this.objectPool.get()
      for (const resourceType of this.config.collect) {
        this.specifiedCollections[resourceType] = []
      }
    }
  }

  private collectResourceIfSpecified(
    resource: JsonApiResource,
    shouldParse: boolean
  ): void {
    if (this.specifiedCollections?.[resource.type]) {
      const collectedResource = shouldParse
        ? this.createFlattenedResource(resource)
        : resource
      this.specifiedCollections[resource.type].push(collectedResource)
    }
  }

  private createFlattenedResource(
    resource: JsonApiResource,
    extraMeta?: Record<string, any>
  ): FlattenedResource {
    const { id, type, attributes = {}, meta } = resource
    const flattened = this.objectPool.get()

    // 合并属性和元数据
    ParserUtils.safeAssign(flattened, extraMeta, attributes, { id, type })

    // 保存原始元数据
    if (meta && !ParserUtils.isEmpty(meta)) {
      flattened._meta = ParserUtils.deepClone(meta)
    }

    return flattened as FlattenedResource
  }

  private hasDataToParse(document: JsonApiDocument): boolean {
    return !!(
      document.data &&
      (!Array.isArray(document.data) || document.data.length > 0)
    )
  }

  private handleMaxDepthReached(resource: JsonApiResource): JsonApiResource {
    const { attributes = {}, relationships } = resource

    if (relationships) {
      // 在最大深度时，直接将关系数据添加到属性中
      ParserUtils.forOwnProperties(relationships, (relationship, key) => {
        if (relationship.data) {
          attributes[key as string] = relationship.data
        }
      })
    }

    return { ...resource, attributes }
  }

  private processRelationship(
    attributes: Record<string, any>,
    relationship: JsonApiRelationship,
    relationKey: string,
    resourceMap: Map<string, JsonApiResource>,
    shouldFlattenRelated: boolean,
    callDepth: number
  ): void {
    // 处理关系元数据
    if (relationship.meta && !ParserUtils.isEmpty(relationship.meta)) {
      // 这里可以根据需要处理关系的元数据
    }

    // 处理关系数据
    if (relationship.data) {
      const resolvedData = Array.isArray(relationship.data)
        ? ParserUtils.mapArray(relationship.data, data =>
            this.resolveResourceReference(
              data,
              resourceMap,
              shouldFlattenRelated,
              callDepth
            )
          )
        : this.resolveResourceReference(
            relationship.data,
            resourceMap,
            shouldFlattenRelated,
            callDepth
          )

      attributes[relationKey] = resolvedData
    } else {
      // 处理没有 data 字段的关系
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { links: _links, ...otherFields } = relationship
      const filteredFields = this.objectPool.get()

      ParserUtils.forOwnProperties(otherFields, (value, key) => {
        if (!ParserUtils.isEmpty(value)) {
          filteredFields[key as string] = value
        }
      })

      if (!ParserUtils.isEmpty(filteredFields)) {
        attributes[relationKey] = filteredFields
      }
    }
  }

  private resolveResourceReference(
    resourceRef: JsonApiResourceIdentifier,
    resourceMap: Map<string, JsonApiResource>,
    shouldFlattenRelated: boolean,
    callDepth: number
  ): FlattenedResource | JsonApiResourceIdentifier {
    const resourceKey = ParserUtils.generateResourceKey(resourceRef)
    const matchedResource = resourceMap.get(resourceKey)

    if (!matchedResource) {
      return resourceRef // 返回原始引用
    }

    // 循环引用检测
    if (!this.circularRefGuard) {
      this.circularRefGuard = this.setPool.get()
    }

    if (this.circularRefGuard.has(resourceKey)) {
      return ParserUtils.extractResourceIdentifier(matchedResource)
    }

    this.circularRefGuard.add(resourceKey)

    try {
      let processedResource = matchedResource
      if (shouldFlattenRelated) {
        processedResource = this.resolveRelationships(
          matchedResource,
          resourceMap,
          true,
          callDepth
        )
      }

      const extraMeta = ParserUtils.safeAssign(
        this.objectPool.get(),
        matchedResource.meta,
        resourceRef.meta
      )

      return this.createFlattenedResource(processedResource, extraMeta)
    } finally {
      this.circularRefGuard.delete(resourceKey)
    }
  }

  private handleParseError(error: unknown, originalDocument: unknown): unknown {
    if (this.isDevelopmentMode()) {
      console.error('解析错误:', error)
      throw error
    }
    return originalDocument
  }

  // === 静态工厂方法 ===

  static create(): OptimizedJsonapi {
    return new OptimizedJsonapi()
  }

  static parse(
    jsonapiDocument: unknown,
    parseConfig?: ParseConfig
  ): FlattenedResource | FlattenedResource[] | unknown {
    const parser = new OptimizedJsonapi()
    return parser.parse(jsonapiDocument, parseConfig)
  }
}

// 导出默认实例
const optimizedParser = new OptimizedJsonapi()
export default optimizedParser

// 同时导出类
export { OptimizedJsonapi }
