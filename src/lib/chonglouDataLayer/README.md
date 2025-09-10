# 重楼数据层 - 组合架构重构

## 概述

按照"组合大于继承"的理念，将原有的单体 `HttpClient` 类重构为基于组合模式的模块化架构。

## 架构设计

### 核心组件 (`/core`)

#### 1. CoreClient - 核心请求客户端

- **职责**: 纯粹的 HTTP 请求功能
- **功能**: 基础的 GET/POST/PUT/DELETE/PATCH 请求
- **特点**: 无任何额外功能，专注于请求执行

#### 2. PluginManager - 插件管理器

- **职责**: 管理和执行插件
- **功能**: 添加/移除插件，执行插件的拦截器
- **特点**: 独立的插件生命周期管理

#### 3. AuthManager - 认证管理器

- **职责**: Token 管理和认证逻辑
- **功能**: Token 自动添加、刷新、过期处理
- **特点**: 与请求逻辑解耦的认证管理

#### 4. RequestEnhancer - 请求增强器

- **职责**: 请求的高级功能
- **功能**: 竞态守卫、节流防抖、请求取消、ID 生成
- **特点**: 专注于请求性能优化

#### 5. InterceptorManager - 拦截器管理器

- **职责**: 统一管理所有拦截器逻辑
- **功能**: 协调各组件的拦截器执行
- **特点**: 拦截器的编排和执行流程控制

### 主要类

#### DataLayer - 数据层主类

- **设计**: 组合模式，聚合所有核心组件
- **特点**: 提供统一的 API 接口
- **优势**: 各功能模块独立，易于测试和维护

#### HttpClient - 兼容性包装

- **设计**: 继承自 DataLayer
- **目的**: 保持向后兼容性
- **使用**: 适用于现有代码迁移

## 组合架构的优势

### 1. 单一职责原则

- 每个组件只负责一个特定功能
- 代码更易理解和维护

### 2. 开放封闭原则

- 易于扩展新功能
- 不需要修改现有代码

### 3. 依赖倒置原则

- 高层模块不依赖低层模块
- 都依赖于抽象接口

### 4. 可测试性

- 每个组件可以独立测试
- 易于 Mock 和单元测试

### 5. 灵活性

- 可以选择性使用某些功能
- 易于替换特定组件的实现

## 使用示例

### 基础使用（推荐）

```typescript
import { chonglouDataLayer } from './index'

// 直接使用默认实例
const response = await chonglouDataLayer.get('/api/users')
```

### 自定义配置

```typescript
import { createDataLayer } from './index'

const dataLayer = createDataLayer({
  baseURL: 'https://api.example.com',
  timeout: 5000
})

const response = await dataLayer.post('/users', userData)
```

### 向后兼容（旧代码）

```typescript
import { createHttpClient } from './index'

const httpClient = createHttpClient({
  baseURL: 'https://api.example.com'
})

const response = await httpClient.get('/users')
```

### 高级使用（访问内部组件）

```typescript
import { chonglouDataLayer } from './index'

// 获取认证管理器
const authManager = chonglouDataLayer.getAuthManager()
const isAuth = authManager.isAuthenticated()

// 获取插件管理器
const pluginManager = chonglouDataLayer.getPluginManager()
pluginManager.use(myCustomPlugin)

// 获取请求增强器
const enhancer = chonglouDataLayer.getRequestEnhancer()
enhancer.cancelAllRequests()
```

## 迁移指南

### 现有代码迁移

1. 将 `HttpClient` 替换为 `DataLayer` 或继续使用 `HttpClient`（兼容性包装）
2. API 接口保持不变，无需修改调用代码
3. 如需访问内部组件，使用 `get*()` 方法

### 新功能开发

1. 优先使用 `DataLayer` 类
2. 根据需要访问特定的核心组件
3. 充分利用组合架构的灵活性

## 目录结构

```
chonglouDataLayer/
├── core/                    # 核心组件
│   ├── CoreClient.ts       # 核心请求客户端
│   ├── PluginManager.ts    # 插件管理器
│   ├── AuthManager.ts      # 认证管理器
│   ├── RequestEnhancer.ts  # 请求增强器
│   ├── InterceptorManager.ts # 拦截器管理器
│   └── index.ts           # 核心组件导出
├── plugins/               # 插件实现
├── utils/                # 工具函数
├── DataLayer.ts          # 主数据层类
├── httpClient.ts         # 兼容性包装
├── types.ts              # 类型定义
└── index.ts              # 主入口文件
```

这种架构使得代码更加模块化、可维护，同时保持了良好的向后兼容性。
