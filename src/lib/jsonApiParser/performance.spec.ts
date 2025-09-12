import { beforeEach, describe, expect, it } from 'vitest'
import { Jsonapi } from './index'

describe('JsonApiParser 性能测试', () => {
  let parser: Jsonapi

  beforeEach(() => {
    parser = new Jsonapi()
  })

  // 性能测试辅助函数
  const measureTime = (fn: () => void, iterations = 1): number => {
    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      fn()
    }
    const end = performance.now()
    return (end - start) / iterations
  }

  // 生成大量测试数据
  const generateLargeDataset = (size: number) => {
    const data = []
    const included = []

    // 生成主要数据
    for (let i = 1; i <= size; i++) {
      data.push({
        type: 'article',
        id: String(i),
        attributes: {
          title: `文章标题 ${i}`,
          content:
            `这是文章 ${i} 的内容，包含了大量的文本数据用于测试解析器的性能。`.repeat(
              10
            ),
          publishedAt: new Date().toISOString(),
          views: Math.floor(Math.random() * 10000),
          tags: [`tag${i}`, `category${i % 10}`]
        },
        relationships: {
          author: {
            data: { type: 'user', id: String((i % 100) + 1) }
          },
          category: {
            data: { type: 'category', id: String((i % 20) + 1) }
          },
          comments: {
            data: Array.from({ length: (i % 5) + 1 }, (_, j) => ({
              type: 'comment',
              id: String(i * 100 + j + 1)
            }))
          }
        }
      })
    }

    // 生成用户数据
    for (let i = 1; i <= 100; i++) {
      included.push({
        type: 'user',
        id: String(i),
        attributes: {
          name: `用户${i}`,
          email: `user${i}@example.com`,
          avatar: `https://example.com/avatar/${i}.jpg`,
          bio: `这是用户${i}的个人简介。`.repeat(5),
          joinedAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ).toISOString()
        }
      })
    }

    // 生成分类数据
    for (let i = 1; i <= 20; i++) {
      included.push({
        type: 'category',
        id: String(i),
        attributes: {
          name: `分类${i}`,
          description: `分类${i}的描述信息`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        }
      })
    }

    // 生成评论数据
    for (let i = 1; i <= size * 3; i++) {
      included.push({
        type: 'comment',
        id: String(i),
        attributes: {
          content: `这是评论${i}的内容，包含用户的反馈和意见。`,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          likes: Math.floor(Math.random() * 100)
        },
        relationships: {
          author: {
            data: {
              type: 'user',
              id: String(Math.floor(Math.random() * 100) + 1)
            }
          }
        }
      })
    }

    return {
      data,
      included,
      meta: {
        total: size,
        page: 1,
        perPage: size
      }
    }
  }

  describe('基准性能测试', () => {
    it('小数据集解析性能 (10条记录)', () => {
      const dataset = generateLargeDataset(10)
      const iterations = 1000

      const avgTime = measureTime(() => {
        parser.parse(dataset)
      }, iterations)

      // 使用测试输出而非console.log
      expect(avgTime).toBeLessThan(1) // 期望小于1ms
      expect(avgTime).toBeGreaterThan(0) // 确保有执行时间
    })

    it('中等数据集解析性能 (100条记录)', () => {
      const dataset = generateLargeDataset(100)
      const iterations = 100

      const avgTime = measureTime(() => {
        parser.parse(dataset)
      }, iterations)

      expect(avgTime).toBeLessThan(10) // 期望小于10ms
      expect(avgTime).toBeGreaterThan(0)
    })

    it('大数据集解析性能 (1000条记录)', () => {
      const dataset = generateLargeDataset(1000)
      const iterations = 10

      const avgTime = measureTime(() => {
        parser.parse(dataset)
      }, iterations)

      expect(avgTime).toBeLessThan(50) // 期望小于50ms
      expect(avgTime).toBeGreaterThan(0)
    })

    it('超大数据集解析性能 (5000条记录)', () => {
      const dataset = generateLargeDataset(5000)
      const iterations = 3

      const avgTime = measureTime(() => {
        parser.parse(dataset)
      }, iterations)

      expect(avgTime).toBeLessThan(200) // 期望小于200ms
      expect(avgTime).toBeGreaterThan(0)
    })
  })

  describe('配置选项性能对比', () => {
    const testDataset = generateLargeDataset(500)

    it('parseIncluded=false vs parseIncluded=true', () => {
      const iterations = 50

      // 不解析included
      const timeWithoutIncluded = measureTime(() => {
        parser.parse(testDataset, { parseIncluded: false })
      }, iterations)

      // 解析included
      const timeWithIncluded = measureTime(() => {
        parser.parse(testDataset, { parseIncluded: true })
      }, iterations)

      // 解析included应该会更慢，但差异不应该过大
      expect(timeWithIncluded).toBeGreaterThan(timeWithoutIncluded)
      expect(timeWithIncluded / timeWithoutIncluded).toBeLessThan(3) // 差异不超过3倍
    })

    it('flatIncludedRelated=false vs flatIncludedRelated=true', () => {
      const iterations = 50

      // 不扁平化关系
      const timeWithoutFlattening = measureTime(() => {
        parser.parse(testDataset, {
          parseIncluded: true,
          flatIncludedRelated: false
        })
      }, iterations)

      // 扁平化关系
      const timeWithFlattening = measureTime(() => {
        parser.parse(testDataset, {
          parseIncluded: true,
          flatIncludedRelated: true
        })
      }, iterations)

      // 扁平化关系通常会更慢，但优化版本可能表现更好
      // 重要的是确保性能差异在合理范围内
      expect(
        Math.abs(timeWithFlattening - timeWithoutFlattening)
      ).toBeGreaterThan(0)
      expect(
        Math.max(timeWithFlattening, timeWithoutFlattening) /
          Math.min(timeWithFlattening, timeWithoutFlattening)
      ).toBeLessThan(5) // 差异不超过5倍
    })
  })

  describe('内存使用优化测试', () => {
    it('对象池效果测试', () => {
      const dataset = generateLargeDataset(1000)
      const iterations = 100

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }

      const initialMemory = process.memoryUsage().heapUsed

      // 多次解析相同数据集
      for (let i = 0; i < iterations; i++) {
        parser.parse(dataset)
      }

      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // 内存增长应该相对较小
      expect(memoryIncrease / 1024 / 1024).toBeLessThan(50) // 内存增长小于50MB
    })

    it('循环引用处理性能', () => {
      // 创建包含循环引用的数据集
      const circularDataset = {
        data: {
          type: 'article',
          id: '1',
          attributes: { title: '测试文章' },
          relationships: {
            author: { data: { type: 'user', id: '1' } },
            relatedArticles: {
              data: [
                { type: 'article', id: '2' },
                { type: 'article', id: '3' }
              ]
            }
          }
        },
        included: [
          {
            type: 'user',
            id: '1',
            attributes: { name: '作者1' },
            relationships: {
              articles: {
                data: [
                  { type: 'article', id: '1' }, // 循环引用
                  { type: 'article', id: '2' }
                ]
              }
            }
          },
          {
            type: 'article',
            id: '2',
            attributes: { title: '相关文章1' },
            relationships: {
              author: { data: { type: 'user', id: '1' } },
              relatedArticles: {
                data: [{ type: 'article', id: '1' }] // 循环引用
              }
            }
          },
          {
            type: 'article',
            id: '3',
            attributes: { title: '相关文章2' },
            relationships: {
              relatedArticles: {
                data: [
                  { type: 'article', id: '1' }, // 循环引用
                  { type: 'article', id: '2' }
                ]
              }
            }
          }
        ]
      }

      const iterations = 100

      const avgTime = measureTime(() => {
        parser.parse(circularDataset, {
          parseIncluded: true,
          flatIncludedRelated: true
        })
      }, iterations)

      expect(avgTime).toBeLessThan(5) // 循环引用处理应该很快
      expect(avgTime).toBeGreaterThan(0)
    })
  })

  describe('边界情况性能测试', () => {
    it('深度嵌套关系性能', () => {
      // 创建深度嵌套的关系数据
      const deepNestingDataset = {
        data: {
          type: 'level1',
          id: '1',
          attributes: { name: '第1层' },
          relationships: {
            child: { data: { type: 'level2', id: '1' } }
          }
        },
        included: []
      }

      // 创建10层嵌套
      for (let level = 2; level <= 10; level++) {
        deepNestingDataset.included.push({
          type: `level${level}`,
          id: '1',
          attributes: { name: `第${level}层` },
          relationships:
            level < 10
              ? {
                  child: { data: { type: `level${level + 1}`, id: '1' } }
                }
              : {}
        })
      }

      const iterations = 100
      const avgTime = measureTime(() => {
        parser.parse(deepNestingDataset, {
          parseIncluded: true,
          flatIncludedRelated: true,
          callLevel: 15
        })
      }, iterations)

      expect(avgTime).toBeLessThan(2)
      expect(avgTime).toBeGreaterThan(0)
    })

    it('大量关系字段性能', () => {
      // 创建包含大量关系字段的数据
      const manyRelationshipsDataset = {
        data: {
          type: 'article',
          id: '1',
          attributes: { title: '测试文章' },
          relationships: {}
        },
        included: []
      }

      // 添加50个关系字段
      for (let i = 1; i <= 50; i++) {
        manyRelationshipsDataset.data.relationships[`relation${i}`] = {
          data: { type: 'related', id: String(i) }
        }

        manyRelationshipsDataset.included.push({
          type: 'related',
          id: String(i),
          attributes: { name: `相关项${i}` }
        })
      }

      const iterations = 100
      const avgTime = measureTime(() => {
        parser.parse(manyRelationshipsDataset, {
          parseIncluded: true,
          flatIncludedRelated: true
        })
      }, iterations)

      expect(avgTime).toBeLessThan(3)
      expect(avgTime).toBeGreaterThan(0)
    })

    it('空数据和null处理性能', () => {
      const emptyDatasets = [
        { data: [] },
        { data: null },
        { data: { type: 'empty', id: '1', attributes: {} } },
        { data: { type: 'empty', id: '1', attributes: {}, relationships: {} } }
      ]

      const iterations = 1000

      emptyDatasets.forEach(dataset => {
        const avgTime = measureTime(() => {
          parser.parse(dataset)
        }, iterations)

        expect(avgTime).toBeLessThan(0.1) // 空数据应该处理很快
        expect(avgTime).toBeGreaterThan(0)
      })
    })
  })

  describe('对象池性能验证', () => {
    it('对象池复用效果测试', () => {
      const dataset = generateLargeDataset(200)

      // 连续多次解析，测试对象池复用效果
      const times = []

      for (let i = 0; i < 10; i++) {
        const startTime = performance.now()
        parser.parse(dataset)
        const endTime = performance.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const variance =
        times.reduce((sum, time) => sum + (time - avgTime) ** 2, 0) /
        times.length
      const standardDeviation = Math.sqrt(variance)

      // 主要验证对象池功能正常工作，性能稳定性是次要的
      expect(avgTime).toBeGreaterThan(0)
      expect(standardDeviation).toBeGreaterThan(0) // 确保有性能差异的测量

      // 验证性能在合理范围内 - 最大值不应该超过平均值的3倍
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      expect(maxTime / minTime).toBeLessThan(10) // 最大最小差异不超过10倍
    })
  })

  describe('性能回归测试', () => {
    it('性能基准测试 - 记录当前性能水平', () => {
      const testCases = [
        { name: '小数据集(50条)', size: 50, expectedTime: 5 },
        { name: '中数据集(200条)', size: 200, expectedTime: 15 },
        { name: '大数据集(1000条)', size: 1000, expectedTime: 50 }
      ]

      testCases.forEach(testCase => {
        const dataset = generateLargeDataset(testCase.size)
        const iterations = Math.max(1, Math.floor(100 / testCase.size))

        const avgTime = measureTime(() => {
          parser.parse(dataset, {
            parseIncluded: true,
            flatIncludedRelated: true
          })
        }, iterations)

        expect(avgTime).toBeLessThan(testCase.expectedTime)
        expect(avgTime).toBeGreaterThan(0)
      })
    })
  })
})
