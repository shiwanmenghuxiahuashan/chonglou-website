import socarJsonApi2 from 'socar-jsonapi2'
import { MemCache } from 'web-memcache'

const generateInterceptors = tokenExpirationCallback => {
  const memCache = new MemCache({
    cacheLog: false,
    /**
     * 缓存过期时间
     * - 默认无过期时间 即 0
     * - 此处传递过期时间为 5 分钟
     * -
     */
    timeOut: 1000 * 60 * 5,
    limit: 30,
    /**
     * 关联资源映射
     * - 当key资源发生非GET请求时，删除key缓存同时，也会删除 value 关联资源的缓存
     */
    relatedResourceMapper: {}
  })
  window.memCache = memCache
  /**
   * 获取构建标识符options
   * - 用于保证缓存标识符构建的一致性
   * @param {object} requestOptions
   * @returns
   */
  const getBuildIdentifierOptions = requestOptions => {
    const { url, filter, page, sort, include } = requestOptions
    return {
      /**
       * 缓存key
       * - 如果是字符串则直接作为缓存id
       * - 如果是对象则根据其encode结果生成缓存id
       */
      cacheKey: { url, filter, page, sort, include }
    }
  }

  const setCache = originalData => {
    if (originalData.requestMethod !== 'get') return null

    const {
      requestData: {
        data: { type }
      },
      requestOptions,
      response
    } = originalData

    const cacheOptions = getBuildIdentifierOptions(requestOptions)

    // 如果缓存存在则不再设置
    if (memCache.has(type, cacheOptions)) {
      return
    }

    memCache.set(
      // 按 资源类型 缓存
      type,
      // options
      cacheOptions,
      // value
      response
    )
  }

  const getCache = originalData => {
    const {
      requestData: {
        data: { type }
      },
      requestOptions
    } = originalData

    if (originalData.requestMethod !== 'get') {
      // 非 get 请求删除缓存 保证数据一致性 例如 post put delete （缓存的是集合数据，post put delete 都是对集合数据进行的单一操作）
      memCache.delete(type)
      return originalData
    }

    // 获取缓存数据
    const cacheValue = memCache.get(
      // 按 资源类型 获取
      type,
      getBuildIdentifierOptions(requestOptions)
    )

    // ??? cacheValue 可能为 boolean ,所以需要判断是否为 undefined 来判断是否有缓存
    if (typeof cacheValue === 'undefined') return originalData

    return {
      ...originalData,
      response: cacheValue
    }
  }
  return {
    response: originalData => {
      const {
        response: { document, page, empty },
        ...reset
      } = originalData

      if (!document) return originalData
      /**
       * 扁平化jsonapi
       * - relationships 会被展开到数据当中
       * - included 会被展开到数据当中
       */
      const flatJsonapi = socarJsonApi2.parse(document)
      // 设置缓存
      setCache({
        ...reset,
        response: { data: flatJsonapi.data, page, empty }
      })
      return {
        data: flatJsonapi.data,
        page,
        empty
      }
    },
    request: originalData => {
      originalData = getCache(originalData)
      return originalData
    },
    error(originalData) {
      if (originalData.code && originalData.code === 401) {
        if (
          !tokenExpirationCallback ||
          typeof tokenExpirationCallback !== 'function'
        ) {
          console.error(
            '[generateInterceptors] tokenExpirationCallback 无效或者非函数 可能未正确传递 或 开发模式下未传递'
          )
          return false
        }
        tokenExpirationCallback()
      }
      return originalData
    }
  }
}

export { generateInterceptors }
