# JSON:API Parser

高性能的 JSON:API 数据解析器，支持完整的规范验证和数据扁平化。

## 核心功能

### 🚀 智能验证

- **开发环境**：完整 JSON:API 规范验证，详细错误报告
- **生产环境**：轻量级验证，性能优先
- **自动降级**：验证失败时返回原始数据，确保业务连续性

### ⚡ 性能优化

- **循环引用检测**：Map 缓存防止无限递归
- **内存安全**：避免原型污染，深度克隆隔离数据
- **惰性计算**：按需处理关系资源
- **类型安全**：100% TypeScript 支持，编译时错误检测

### 🔧 数据扁平化

- 将嵌套的 JSON:API 结构转换为易用的扁平对象
- 自动内联关系数据
- 保留原始 meta 和 links 信息
- 支持单个资源和资源数组

## 快速使用

### 基础用法

```typescript
import jsonApiParser from '@/lib/jsonApiParser'

const result = jsonApiParser.parse(jsonApiDocument)
```

### 高级配置

```typescript
import { Jsonapi } from '@/lib/jsonApiParser'

const parser = Jsonapi.create({
  parseIncluded: true, // 解析 included 资源
  flatIncludedRelated: true, // 扁平化关联资源
  maxCallLevel: 5 // 最大递归层级
})

const result = parser.parse(jsonApiDocument)
```

### 静态调用

```typescript
const result = Jsonapi.parse(jsonApiDocument, {
  parseIncluded: true
})
```

## 验证功能

### 开发环境验证

不符合 JSON:API 规范的文档会输出详细错误信息：

```typescript
// 无效文档（缺少 type 字段）
const invalidDoc = {
  data: { id: '1', attributes: { name: 'test' } }
}

parser.parse(invalidDoc)
// 输出: JSON:API document validation failed:
//       - data: Resource must have a non-empty string type
```

### 验证规则

遵循 [JSON:API v1.0 规范](https://jsonapi.org/format/)：

- **文档结构**：必须包含 `data`、`errors` 或 `meta` 之一
- **资源对象**：必须有 `type` 和 `id` 字段
- **关系对象**：必须有 `data`、`links` 或 `meta` 之一
- **互斥性**：`data` 和 `errors` 不能同时存在

## 性能特性

### 基准测试

```typescript
// 10,000 次解析平均时间 < 0.1ms
const iterations = 10000
const avgTime = benchmarkParser(iterations)
console.log(`平均解析时间: ${avgTime}ms`)
```

### 内存优化

- 循环引用自动检测和缓存
- Map 结构提升查找效率
- 最小化对象创建开销

### 配置项

| 选项                     | 默认值 | 说明                   |
| ------------------------ | ------ | ---------------------- |
| `parseIncluded`          | `true` | 是否解析 included 资源 |
| `flatIncludedRelated`    | `true` | 是否扁平化关联资源     |
| `maxCallLevel`           | `10`   | 最大递归调用层级       |
| `ignoreInvalidRelations` | `true` | 是否忽略无效关系       |

## API 参考

### 实例方法

- `parser.parse(document, config?)` - 解析文档
- `parser.setConfig(config)` - 设置配置

### 静态方法

- `Jsonapi.create(config?)` - 创建实例
- `Jsonapi.parse(document, config?)` - 静态解析

### 类型定义

```typescript
interface ParseConfig {
  parseIncluded?: boolean
  flatIncludedRelated?: boolean
  maxCallLevel?: number
  ignoreInvalidRelations?: boolean
}

interface FlattenedResource {
  id: string
  type: string
  [key: string]: any
  _meta?: Record<string, any>
}
```

## 文件结构

```
src/lib/jsonApiParser/
├── index.ts          # 主解析器
├── types.ts          # 类型定义
├── verifier.ts       # 验证器
├── config.ts         # 配置管理
└── example.ts        # 使用示例
```

## 兼容性

- ✅ 向下兼容现有 API
- ✅ TypeScript 4.0+
- ✅ Node.js 16+
- ✅ 现代浏览器
