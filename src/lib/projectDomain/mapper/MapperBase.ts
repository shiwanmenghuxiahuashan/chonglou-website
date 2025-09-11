/**
 * MapperBase - 基础映射器类
 * 基于 DDD 领域驱动设计的映射器模式
 *
 * 功能特性：
 * - 提供通用的映射方法
 * - 支持深度映射和浅度映射
 * - 支持数组映射和单对象映射
 * - 支持条件映射和转换函数
 * - 提供缓存机制优化性能
 * - 支持映射验证和错误处理
 */

export interface MapperOptions {
  /** 是否进行深度映射 */
  deep?: boolean
  /** 是否跳过空值 */
  skipNullish?: boolean
  /** 是否跳过未定义值 */
  skipUndefined?: boolean
  /** 是否启用映射缓存 */
  enableCache?: boolean
  /** 自定义转换函数 */
  transform?: (value: any, key: string) => any
  /** 映射验证函数 */
  validate?: (source: any, target: any) => boolean
}

export interface MapperRule<TSource = any, TTarget = any> {
  /** 源字段路径 */
  sourceField: string | string[]
  /** 目标字段路径 */
  targetField: string
  /** 转换函数 */
  transform?: (value: any, source: TSource) => any
  /** 映射条件 */
  condition?: (source: TSource) => boolean
  /** 默认值 */
  defaultValue?: any
  /** 是否必需 */
  required?: boolean
}

export interface MapperMetadata {
  /** 映射器名称 */
  name: string
  /** 映射器版本 */
  version: string
  /** 创建时间 */
  createdAt: Date
  /** 最后映射时间 */
  lastMappedAt?: Date
  /** 映射次数 */
  mappingCount: number
}

/**
 * 抽象映射器基类
 * 所有具体映射器都应继承此类
 */
export abstract class MapperBase<TSource = any, TTarget = any> {
  protected readonly metadata: MapperMetadata
  protected readonly defaultOptions: MapperOptions
  private readonly cache = new Map<string, any>()

  constructor(
    name: string,
    version = '1.0.0',
    defaultOptions: MapperOptions = {}
  ) {
    this.metadata = {
      name,
      version,
      createdAt: new Date(),
      mappingCount: 0
    }

    this.defaultOptions = {
      deep: true,
      skipNullish: false,
      skipUndefined: false,
      enableCache: false,
      ...defaultOptions
    }
  }

  /**
   * 抽象方法：定义映射规则
   * 子类必须实现此方法
   */
  protected abstract defineMapping(): MapperRule<TSource, TTarget>[]

  /**
   * 映射单个对象
   */
  public map(source: TSource, options?: MapperOptions): TTarget {
    if (!source) {
      throw new Error(
        `[${this.metadata.name}] Source object cannot be null or undefined`
      )
    }

    const mergedOptions = { ...this.defaultOptions, ...options }
    const cacheKey = this.generateCacheKey(source, mergedOptions)

    // 检查缓存
    if (mergedOptions.enableCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const target = this.performMapping(source, mergedOptions)

      // 验证映射结果
      if (mergedOptions.validate && !mergedOptions.validate(source, target)) {
        throw new Error(`[${this.metadata.name}] Mapping validation failed`)
      }

      // 缓存结果
      if (mergedOptions.enableCache) {
        this.cache.set(cacheKey, target)
      }

      this.updateMetadata()
      return target
    } catch (error) {
      this.handleMappingError(error as Error, source)
      throw error
    }
  }

  /**
   * 映射对象数组
   */
  public mapArray(sources: TSource[], options?: MapperOptions): TTarget[] {
    if (!Array.isArray(sources)) {
      throw new TypeError(`[${this.metadata.name}] Sources must be an array`)
    }

    return sources.map(source => this.map(source, options))
  }

  /**
   * 批量映射（优化版本）
   */
  public mapBatch(sources: TSource[], options?: MapperOptions): TTarget[] {
    if (!Array.isArray(sources)) {
      throw new TypeError(`[${this.metadata.name}] Sources must be an array`)
    }

    const mergedOptions = { ...this.defaultOptions, ...options }
    const results: TTarget[] = []

    for (const source of sources) {
      try {
        results.push(this.map(source, mergedOptions))
      } catch (error) {
        // 在批量映射中，可以选择跳过错误的项目或抛出错误
        console.warn(`[${this.metadata.name}] Failed to map item:`, error)
        // 可以根据需要决定是否继续或抛出错误
      }
    }

    return results
  }

  /**
   * 反向映射（如果支持）
   */
  public mapReverse(target: TTarget, options?: MapperOptions): TSource {
    throw new Error(
      `[${this.metadata.name}] Reverse mapping is not implemented`
    )
  }

  /**
   * 执行实际的映射逻辑
   */
  protected performMapping(source: TSource, options: MapperOptions): TTarget {
    const rules = this.defineMapping()
    const target = {} as TTarget

    for (const rule of rules) {
      try {
        this.applyMappingRule(source, target, rule, options)
      } catch (error) {
        if (rule.required) {
          throw new Error(
            `[${this.metadata.name}] Required field mapping failed: ${rule.targetField}`
          )
        }
        console.warn(
          `[${this.metadata.name}] Optional field mapping failed: ${rule.targetField}`,
          error
        )
      }
    }

    return target
  }

  /**
   * 应用单个映射规则
   */
  protected applyMappingRule(
    source: TSource,
    target: TTarget,
    rule: MapperRule<TSource, TTarget>,
    options: MapperOptions
  ): void {
    // 检查条件
    if (rule.condition && !rule.condition(source)) {
      return
    }

    // 获取源值
    let sourceValue = this.getValueByPath(source, rule.sourceField)

    // 检查是否跳过空值
    if (
      options.skipNullish &&
      (sourceValue === null || sourceValue === undefined)
    ) {
      return
    }
    if (options.skipUndefined && sourceValue === undefined) {
      return
    }

    // 应用转换
    if (rule.transform) {
      sourceValue = rule.transform(sourceValue, source)
    } else if (options.transform) {
      sourceValue = options.transform(sourceValue, rule.targetField)
    }

    // 如果值仍然为空且有默认值，使用默认值
    if (
      (sourceValue === undefined || sourceValue === null) &&
      rule.defaultValue !== undefined
    ) {
      sourceValue =
        typeof rule.defaultValue === 'function'
          ? rule.defaultValue(source)
          : rule.defaultValue
    }

    // 设置目标值
    this.setValueByPath(target, rule.targetField, sourceValue, options)
  }

  /**
   * 根据路径获取值
   */
  protected getValueByPath(obj: any, path: string | string[]): any {
    if (!obj) return undefined

    const pathArray = Array.isArray(path) ? path : path.split('.')

    let current = obj
    for (const key of pathArray) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[key]
    }

    return current
  }

  /**
   * 根据路径设置值
   */
  protected setValueByPath(
    obj: any,
    path: string,
    value: any,
    options: MapperOptions
  ): void {
    const pathArray = path.split('.')
    const lastKey = pathArray.pop()!

    let current = obj
    for (const key of pathArray) {
      if (!(key in current)) {
        current[key] = {}
      }
      current = current[key]
    }

    // 深度复制处理
    if (options.deep && typeof value === 'object' && value !== null) {
      current[lastKey] = this.deepClone(value)
    } else {
      current[lastKey] = value
    }
  }

  /**
   * 深度克隆对象
   */
  protected deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T
    }

    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }

    return cloned
  }

  /**
   * 生成缓存键
   */
  protected generateCacheKey(source: TSource, options: MapperOptions): string {
    const sourceHash = this.simpleHash(JSON.stringify(source))
    const optionsHash = this.simpleHash(JSON.stringify(options))
    return `${this.metadata.name}_${sourceHash}_${optionsHash}`
  }

  /**
   * 简单哈希函数
   */
  protected simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  /**
   * 更新元数据
   */
  protected updateMetadata(): void {
    this.metadata.lastMappedAt = new Date()
    this.metadata.mappingCount++
  }

  /**
   * 处理映射错误
   */
  protected handleMappingError(error: Error, source: TSource): void {
    console.error(`[${this.metadata.name}] Mapping failed:`, {
      error: error.message,
      source,
      metadata: this.metadata
    })
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * 获取映射器元数据
   */
  public getMetadata(): Readonly<MapperMetadata> {
    return { ...this.metadata }
  }

  /**
   * 验证映射规则
   */
  protected validateMappingRules(rules: MapperRule<TSource, TTarget>[]): void {
    const targetFields = new Set<string>()

    for (const rule of rules) {
      if (targetFields.has(rule.targetField)) {
        throw new Error(
          `[${this.metadata.name}] Duplicate target field: ${rule.targetField}`
        )
      }
      targetFields.add(rule.targetField)

      if (!rule.sourceField || rule.sourceField === '') {
        throw new Error(
          `[${this.metadata.name}] Source field cannot be empty for target: ${rule.targetField}`
        )
      }
    }
  }

  /**
   * 创建映射规则的便捷方法
   */
  protected createRule(
    sourceField: string | string[],
    targetField: string,
    options: Partial<
      Omit<MapperRule<TSource, TTarget>, 'sourceField' | 'targetField'>
    > = {}
  ): MapperRule<TSource, TTarget> {
    return {
      sourceField,
      targetField,
      ...options
    }
  }
}
