import type { JsonApiResource, JsonApiResourceIdentifier } from './types'

/**
 * 公共工具方法集合
 */
export class ParserUtils {
  /**
   * 生成资源唯一键
   */
  static generateResourceKey(resource: JsonApiResourceIdentifier): string {
    return `${resource.type}-${resource.id}`
  }

  /**
   * 安全地复制对象属性，避免原型污染
   */
  static safeAssign<T extends Record<string, any>>(
    target: T,
    ...sources: Array<Record<string, any> | null | undefined>
  ): T {
    for (const source of sources) {
      if (source && typeof source === 'object') {
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key]
          }
        }
      }
    }
    return target
  }

  /**
   * 创建安全的空对象
   */
  static createSafeObject<T = Record<string, any>>(): T {
    return Object.create(null) as T
  }

  /**
   * 深度复制对象（简单版本，避免引入外部依赖）
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T
    }

    if (Array.isArray(obj)) {
      return ParserUtils.mapArray(obj, item => ParserUtils.deepClone(item)) as T
    }

    if (typeof obj === 'object') {
      const cloned = ParserUtils.createSafeObject<T>()
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = ParserUtils.deepClone(obj[key])
        }
      }
      return cloned
    }

    return obj
  }

  /**
   * 检查对象是否为空
   */
  static isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined) {
      return true
    }

    if (typeof obj === 'string' || Array.isArray(obj)) {
      return obj.length === 0
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).length === 0
    }

    return false
  }

  /**
   * 批量处理数组
   */
  static mapArray<T, U>(
    array: T[],
    mapper: (item: T, index: number) => U
  ): U[] {
    const result: U[] = []
    for (const [index, item] of array.entries()) {
      result.push(mapper(item, index))
    }
    return result
  }

  /**
   * 安全的对象遍历
   */
  static forOwnProperties<T extends Record<string, any>>(
    obj: T,
    callback: (value: T[keyof T], key: keyof T) => void
  ): void {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        callback(obj[key], key)
      }
    }
  }

  /**
   * 验证资源对象的基本结构
   */
  static isValidResource(resource: any): resource is JsonApiResource {
    return (
      resource &&
      typeof resource === 'object' &&
      typeof resource.type === 'string' &&
      resource.type.length > 0 &&
      (typeof resource.id === 'string' || typeof resource.id === 'number') &&
      String(resource.id).length > 0
    )
  }

  /**
   * 提取资源的基本信息
   */
  static extractResourceIdentifier(
    resource: JsonApiResource
  ): JsonApiResourceIdentifier {
    return {
      type: resource.type,
      id: resource.id,
      ...(resource.meta && { meta: resource.meta })
    }
  }
}
