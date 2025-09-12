import { beforeEach, describe, expect, it } from 'vitest'
import { Jsonapi } from './index'

describe('JsonApiParser', () => {
  let parser: Jsonapi

  // 测试数据
  const sampleJsonApiDocument = {
    data: {
      type: 'article',
      id: '1',
      attributes: {
        title: 'JSON:API 解析器优化',
        content: '这是一个示例文章内容...',
        publishedAt: '2024-01-01T00:00:00.000Z'
      },
      relationships: {
        author: {
          data: { type: 'user', id: '101' }
        },
        tags: {
          data: [
            { type: 'tag', id: '201' },
            { type: 'tag', id: '202' }
          ]
        }
      }
    },
    included: [
      {
        type: 'user',
        id: '101',
        attributes: {
          name: '张三',
          email: 'zhangsan@example.com'
        }
      },
      {
        type: 'tag',
        id: '201',
        attributes: {
          name: 'Vue.js',
          color: '#4FC08D'
        }
      },
      {
        type: 'tag',
        id: '202',
        attributes: {
          name: 'TypeScript',
          color: '#007ACC'
        }
      }
    ]
  }

  const simpleDocument = {
    data: {
      type: 'user',
      id: '123',
      attributes: {
        name: '李四',
        email: 'lisi@example.com'
      }
    }
  }

  beforeEach(() => {
    parser = new Jsonapi()
  })

  describe('基本功能测试', () => {
    it('应该能够解析简单的JSON:API文档', () => {
      const result = parser.parse(simpleDocument)

      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('123')
      expect(result.data.type).toBe('user')
      expect(result.data.name).toBe('李四')
      expect(result.data.email).toBe('lisi@example.com')
    })

    it('应该能够解析包含关系的JSON:API文档', () => {
      parser.setConfig({ parseIncluded: true, flatIncludedRelated: true })
      const result = parser.parse(sampleJsonApiDocument)

      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('1')
      expect(result.data.type).toBe('article')
      expect(result.data.title).toBe('JSON:API 解析器优化')

      // 测试关系解析
      expect(result.data.author).toBeDefined()
      expect(result.data.author.name).toBe('张三')
      expect(result.data.tags).toBeDefined()
      expect(result.data.tags).toHaveLength(2)
      expect(result.data.tags[0].name).toBe('Vue.js')
    })

    it('应该能够处理空数据', () => {
      const emptyDocument = { data: [] }
      const result = parser.parse(emptyDocument)

      expect(result).toEqual(emptyDocument)
    })

    it('应该能够处理null数据', () => {
      const result = parser.parse(null)
      expect(result).toBeNull()
    })
  })

  describe('配置测试', () => {
    it('应该能够设置和使用配置', () => {
      const config = {
        parseIncluded: true,
        flatIncludedRelated: true,
        maxCallLevel: 10
      }

      parser.setConfig(config)
      const result = parser.parse(sampleJsonApiDocument)

      expect(result.data.author).toBeDefined()
      expect(result.data.author.name).toBe('张三')
    })

    it('静态创建方法应该工作正常', () => {
      const staticParser = Jsonapi.create({
        parseIncluded: true,
        flatIncludedRelated: true
      })

      const result = staticParser.parse(sampleJsonApiDocument)
      expect(result.data.author).toBeDefined()
      expect(result.data.author.name).toBe('张三')
    })

    it('静态解析方法应该工作正常', () => {
      const result = Jsonapi.parse(sampleJsonApiDocument, {
        parseIncluded: true,
        flatIncludedRelated: true
      })

      expect(result.data.author).toBeDefined()
      expect(result.data.author.name).toBe('张三')
    })
  })

  describe('JSON:API 规范验证测试', () => {
    it('应该验证完整的JSON:API文档结构', () => {
      const validDocument = {
        data: {
          type: 'article',
          id: '1',
          attributes: { title: 'Test Article' }
        },
        meta: { count: 1 }
      }

      const result = parser.parse(validDocument)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe('1')
    })

    it('应该拒绝无效的JSON:API文档', () => {
      const invalidDocument = {
        data: {
          // 缺少必需的 type 字段
          id: '1',
          attributes: { name: 'test' }
        }
      }

      // 在开发环境下，无效文档应该返回原始文档
      const result = parser.parse(invalidDocument)
      expect(result).toEqual(invalidDocument)
    })

    it('应该验证关系对象结构', () => {
      const documentWithInvalidRelationship = {
        data: {
          type: 'article',
          id: '1',
          attributes: { title: 'Test' },
          relationships: {
            author: {
              // 关系对象必须包含 data, links, 或 meta 中的至少一个
            }
          }
        }
      }

      const result = parser.parse(documentWithInvalidRelationship)
      expect(result).toEqual(documentWithInvalidRelationship)
    })

    it('应该验证included数组中的资源', () => {
      const documentWithInvalidIncluded = {
        data: {
          type: 'article',
          id: '1',
          attributes: { title: 'Test' }
        },
        included: [
          {
            // 缺少必需的 id 字段
            type: 'user',
            attributes: { name: 'Test User' }
          }
        ]
      }

      const result = parser.parse(documentWithInvalidIncluded)
      expect(result).toEqual(documentWithInvalidIncluded)
    })

    it('应该验证data和errors不能同时存在', () => {
      const invalidDocument = {
        data: { type: 'article', id: '1' },
        errors: [{ title: 'Some error' }]
      }

      const result = parser.parse(invalidDocument)
      expect(result).toEqual(invalidDocument)
    })

    it('应该接受null data值', () => {
      const documentWithNullData = {
        data: null,
        meta: { message: 'No data' }
      }

      const result = parser.parse(documentWithNullData)
      expect(result.data).toBeNull()
    })

    it('应该验证资源标识符结构', () => {
      const documentWithInvalidIdentifier = {
        data: {
          type: 'article',
          id: '1',
          attributes: { title: 'Test' },
          relationships: {
            author: {
              data: {
                type: 'user'
                // 缺少必需的 id 字段
              }
            }
          }
        }
      }

      const result = parser.parse(documentWithInvalidIdentifier)
      expect(result).toEqual(documentWithInvalidIdentifier)
    })
  })

  describe('错误处理测试', () => {
    it('应该处理无效的资源对象', () => {
      const invalidDocument = {
        data: {
          // 缺少必需的 type 字段
          id: '1',
          attributes: { name: 'test' }
        }
      }

      // 在开发环境下，无效文档应该返回原始文档而不是抛出错误
      const result = parser.parse(invalidDocument)
      expect(result).toEqual(invalidDocument)
    })

    it('应该处理循环引用', () => {
      const circularDocument = {
        data: {
          type: 'parent',
          id: '1',
          attributes: { name: 'Parent' },
          relationships: {
            child: { data: { type: 'child', id: '2' } }
          }
        },
        included: [
          {
            type: 'child',
            id: '2',
            attributes: { name: 'Child' },
            relationships: {
              parent: { data: { type: 'parent', id: '1' } }
            }
          }
        ]
      }

      parser.setConfig({ parseIncluded: true, flatIncludedRelated: true })

      expect(() => {
        parser.parse(circularDocument)
      }).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该能够处理大量数据', () => {
      const iterations = 10000
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        parser.parse(sampleJsonApiDocument)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // 期望每次解析时间不超过1ms
      expect(duration / iterations).toBeLessThan(1)
    })

    it('应该能够处理嵌套关系', () => {
      const nestedDocument = {
        data: {
          type: 'article',
          id: '1',
          attributes: { title: 'Test' },
          relationships: {
            category: { data: { type: 'category', id: '1' } }
          }
        },
        included: [
          {
            type: 'category',
            id: '1',
            attributes: { name: 'Tech' },
            relationships: {
              parent: { data: { type: 'category', id: '2' } }
            }
          },
          {
            type: 'category',
            id: '2',
            attributes: { name: 'Root' }
          }
        ]
      }

      parser.setConfig({ parseIncluded: true, flatIncludedRelated: true })
      const result = parser.parse(nestedDocument)

      expect(result.data.category).toBeDefined()
      expect(result.data.category.name).toBe('Tech')
      expect(result.data.category.parent).toBeDefined()
      expect(result.data.category.parent.name).toBe('Root')
    })
  })

  describe('数据完整性测试', () => {
    it('应该保持原始meta数据', () => {
      const documentWithMeta = {
        data: {
          type: 'user',
          id: '1',
          attributes: { name: 'Test User' },
          meta: { timestamp: '2024-01-01' }
        },
        meta: { total: 100 }
      }

      const result = parser.parse(documentWithMeta)

      expect(result.meta).toEqual({ total: 100 })
      expect(result.data._meta).toEqual({ timestamp: '2024-01-01' })
    })

    it('应该保持links信息', () => {
      const documentWithLinks = {
        data: { type: 'user', id: '1', attributes: { name: 'Test' } },
        links: {
          self: 'http://example.com/users/1',
          next: 'http://example.com/users?page=2'
        }
      }

      const result = parser.parse(documentWithLinks)
      expect(result.links).toEqual({
        self: 'http://example.com/users/1',
        next: 'http://example.com/users?page=2'
      })
    })

    it('应该处理数组数据', () => {
      const arrayDocument = {
        data: [
          { type: 'user', id: '1', attributes: { name: 'User 1' } },
          { type: 'user', id: '2', attributes: { name: 'User 2' } }
        ]
      }

      const result = parser.parse(arrayDocument)

      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('User 1')
      expect(result.data[1].name).toBe('User 2')
    })
  })
})
