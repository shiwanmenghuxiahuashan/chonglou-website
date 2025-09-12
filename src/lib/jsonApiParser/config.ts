import { assign } from 'lodash-unified'

import type { ParseConfig } from './types'

/**
 * 生成默认配置
 * @returns 默认解析配置
 */
const genDefaultConfig = (): Required<ParseConfig> => {
  return {
    parseIncluded: true, // 是否解析 included 中的数据，默认：true
    flatIncludedRelated: true, // 扁平化 included 中资源的 relationship 数据，默认：true
    collect: null, // 收集 included 的指定资源，默认：null，例：['article', 'user']
    collectIsParse: false, // collect 中的资源是否需要扁平化，默认：false
    /**
     * 调用层级限制
     * - 防止堆栈溢出和循环引用
     * - a.relationships.b -> level 1
     * - a.relationships.b.relationships.c -> level 2
     * - a.relationships.b.relationships.c.relationships.d -> level 3
     *
     * 例如：
     * - 文章(资源)a 的关系 b(作者) -> level 1
     * - 文章(资源)a 的关系 b(作者) 的关系 c(作者的公司) -> level 2
     * - 文章(资源)a 的关系 b(作者) 的关系 c(作者的公司) 的关系 d(公司的地址) -> level 3
     */
    callLevel: 5
  }
}

/**
 * 生成解析配置
 * @param parseConfig - 用户配置
 * @returns 合并后的配置
 * @throws {TypeError} callLevel 必须为数字类型
 */
const genConfig = (parseConfig?: ParseConfig): Required<ParseConfig> => {
  // 验证 callLevel 类型
  if (parseConfig?.callLevel !== undefined) {
    if (
      typeof parseConfig.callLevel !== 'number' ||
      parseConfig.callLevel < 0
    ) {
      throw new TypeError('callLevel must be a non-negative number')
    }
    if (parseConfig.callLevel > 10) {
      // eslint-disable-next-line no-console
      console.warn('callLevel > 10 may cause performance issues')
    }
  }

  // 验证 collect 类型
  if (parseConfig?.collect !== undefined && parseConfig.collect !== null) {
    if (!Array.isArray(parseConfig.collect)) {
      throw new TypeError('collect must be an array of strings or null')
    }
    if (parseConfig.collect.some(item => typeof item !== 'string')) {
      throw new TypeError('collect array must contain only strings')
    }
  }

  return assign({}, genDefaultConfig(), parseConfig)
}

export { genConfig, genDefaultConfig }
