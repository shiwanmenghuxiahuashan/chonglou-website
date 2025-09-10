<template>
  <div class="chonglou-data-layer-demo">
    <div class="chonglou-data-layer-demo__header">
      <h2>数据层架构演示</h2>
      <p>展示新数据层的缓存、重试、错误处理、竞态守卫等功能</p>
    </div>

    <div class="chonglou-data-layer-demo__content">
      <!-- 基础请求演示 -->
      <el-card class="chonglou-data-layer-demo__card">
        <template #header>
          <span>基础 HTTP 请求</span>
        </template>
        
        <div class="chonglou-data-layer-demo__controls">
          <el-button type="primary" @click="testBasicRequest" :loading="loading.basic">
            发起基础请求
          </el-button>
          <el-button @click="testCachedRequest" :loading="loading.cached">
            缓存请求 (5分钟)
          </el-button>
          <el-button @click="testThrottledRequest" :loading="loading.throttled">
            节流请求 (1秒)
          </el-button>
        </div>

        <div v-if="results.basic" class="chonglou-data-layer-demo__result">
          <el-tag>基础请求结果</el-tag>
          <pre>{{ JSON.stringify(results.basic, null, 2) }}</pre>
        </div>
      </el-card>

      <!-- 错误处理演示 -->
      <el-card class="chonglou-data-layer-demo__card">
        <template #header>
          <span>错误处理 & 重试机制</span>
        </template>
        
        <div class="chonglou-data-layer-demo__controls">
          <el-button type="danger" @click="testErrorHandling" :loading="loading.error">
            触发 404 错误
          </el-button>
          <el-button type="warning" @click="testRetryMechanism" :loading="loading.retry">
            测试重试机制
          </el-button>
          <el-button @click="testNetworkError" :loading="loading.network">
            模拟网络错误
          </el-button>
        </div>

        <div v-if="errorLogs.length > 0" class="chonglou-data-layer-demo__error-logs">
          <h4>错误日志:</h4>
          <ul>
            <li v-for="(log, index) in errorLogs" :key="index" class="error-log">
              <el-tag type="danger" size="small">{{ log.timestamp }}</el-tag>
              {{ log.message }}
            </li>
          </ul>
        </div>
      </el-card>

      <!-- 竞态守卫演示 -->
      <el-card class="chonglou-data-layer-demo__card">
        <template #header>
          <span>竞态守卫 & 请求取消</span>
        </template>
        
        <div class="chonglou-data-layer-demo__controls">
          <el-button @click="testRaceCondition" :loading="loading.race">
            快速连续请求 (竞态守卫)
          </el-button>
          <el-button @click="startLongRequest" :loading="loading.longRequest">
            长时间请求
          </el-button>
          <el-button 
            type="danger" 
            @click="cancelRequest" 
            :disabled="!currentRequestId"
          >
            取消请求
          </el-button>
        </div>

        <div v-if="raceResults.length > 0" class="chonglou-data-layer-demo__race-results">
          <h4>竞态测试结果:</h4>
          <ul>
            <li v-for="(result, index) in raceResults" :key="index">
              请求 {{ index + 1 }}: {{ result.status }} - {{ result.timestamp }}
            </li>
          </ul>
        </div>
      </el-card>

      <!-- Token 管理演示 -->
      <el-card class="chonglou-data-layer-demo__card">
        <template #header>
          <span>Token 管理</span>
        </template>
        
        <div class="chonglou-data-layer-demo__controls">
          <el-button @click="setMockToken">设置模拟 Token</el-button>
          <el-button @click="clearToken">清除 Token</el-button>
          <el-button @click="testAuthenticatedRequest" :loading="loading.auth">
            认证请求
          </el-button>
          <el-button type="warning" @click="testTokenRefresh" :loading="loading.refresh">
            测试 Token 刷新
          </el-button>
        </div>

        <div class="chonglou-data-layer-demo__token-status">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Token 状态">
              <el-tag :type="hasToken ? 'success' : 'danger'">
                {{ hasToken ? '已设置' : '未设置' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Token 值">
              <code>{{ currentToken || '无' }}</code>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- 缓存管理演示 -->
      <el-card class="chonglou-data-layer-demo__card">
        <template #header>
          <span>缓存管理</span>
        </template>
        
        <div class="chonglou-data-layer-demo__controls">
          <el-button @click="getCacheStats">获取缓存统计</el-button>
          <el-button type="warning" @click="clearCache">清除所有缓存</el-button>
          <el-button @click="testCacheHit">测试缓存命中</el-button>
        </div>

        <div v-if="cacheStats" class="chonglou-data-layer-demo__cache-stats">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="缓存条目数">
              {{ cacheStats.size }}
            </el-descriptions-item>
            <el-descriptions-item label="最大条目数">
              {{ cacheStats.maxSize }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { httpClient, tokenService, requestCancelManager } from '@/lib/http'

// 响应式数据
const loading = ref({
  basic: false,
  cached: false,
  throttled: false,
  error: false,
  retry: false,
  network: false,
  race: false,
  longRequest: false,
  auth: false,
  refresh: false
})

const results = ref({
  basic: null as any,
  cached: null as any
})

const errorLogs = ref<{ timestamp: string; message: string }[]>([])
const raceResults = ref<{ status: string; timestamp: string }[]>([])
const currentRequestId = ref<string | null>(null)
const cacheStats = ref<any>(null)

// Token 状态
const hasToken = computed(() => tokenService.hasValidToken())
const currentToken = computed(() => tokenService.getToken())

// 基础请求测试
const testBasicRequest = async () => {
  loading.value.basic = true
  try {
    const response = await httpClient.get('/test/basic')
    results.value.basic = response.data
    ElMessage.success('基础请求成功')
  } catch (error: any) {
    addErrorLog(`基础请求失败: ${error.message}`)
  } finally {
    loading.value.basic = false
  }
}

// 缓存请求测试
const testCachedRequest = async () => {
  loading.value.cached = true
  try {
    const response = await httpClient.get('/test/cached', {
      cache: true,
      cacheTime: 5 * 60 * 1000
    })
    results.value.cached = response.data
    ElMessage.success('缓存请求成功')
  } catch (error: any) {
    addErrorLog(`缓存请求失败: ${error.message}`)
  } finally {
    loading.value.cached = false
  }
}

// 节流请求测试
const testThrottledRequest = async () => {
  loading.value.throttled = true
  try {
    const response = await httpClient.get('/test/throttled', {
      throttle: 1000
    })
    ElMessage.success('节流请求成功')
  } catch (error: any) {
    addErrorLog(`节流请求失败: ${error.message}`)
  } finally {
    loading.value.throttled = false
  }
}

// 错误处理测试
const testErrorHandling = async () => {
  loading.value.error = true
  try {
    await httpClient.get('/test/404')
  } catch (error: any) {
    addErrorLog(`404错误处理: ${error.message}`)
  } finally {
    loading.value.error = false
  }
}

// 重试机制测试
const testRetryMechanism = async () => {
  loading.value.retry = true
  try {
    await httpClient.get('/test/retry', {
      retries: 3,
      retryDelay: 1000
    })
  } catch (error: any) {
    addErrorLog(`重试测试: ${error.message}`)
  } finally {
    loading.value.retry = false
  }
}

// 网络错误测试
const testNetworkError = async () => {
  loading.value.network = true
  try {
    await httpClient.get('/test/network-error')
  } catch (error: any) {
    addErrorLog(`网络错误: ${error.message}`)
  } finally {
    loading.value.network = false
  }
}

// 竞态条件测试
const testRaceCondition = async () => {
  loading.value.race = true
  raceResults.value = []
  
  try {
    // 快速发起多个相同请求
    const promises = Array.from({ length: 5 }, (_, i) => 
      httpClient.get('/test/race').then(() => ({
        status: `成功 #${i + 1}`,
        timestamp: new Date().toLocaleTimeString()
      })).catch((error) => ({
        status: `失败 #${i + 1}: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }))
    )
    
    const results = await Promise.all(promises)
    raceResults.value = results
    ElMessage.success('竞态测试完成')
  } catch (error: any) {
    addErrorLog(`竞态测试失败: ${error.message}`)
  } finally {
    loading.value.race = false
  }
}

// 长时间请求
const startLongRequest = async () => {
  loading.value.longRequest = true
  const requestId = `long-request-${Date.now()}`
  currentRequestId.value = requestId
  
  try {
    await httpClient.get('/test/long-request', {
      requestId,
      timeout: 30000
    })
    ElMessage.success('长时间请求完成')
  } catch (error: any) {
    if (error.isCancel) {
      ElMessage.warning('请求已取消')
    } else {
      addErrorLog(`长时间请求失败: ${error.message}`)
    }
  } finally {
    loading.value.longRequest = false
    currentRequestId.value = null
  }
}

// 取消请求
const cancelRequest = () => {
  if (currentRequestId.value) {
    const success = requestCancelManager.cancelRequest(currentRequestId.value)
    if (success) {
      ElMessage.success('请求已取消')
      currentRequestId.value = null
    } else {
      ElMessage.error('取消请求失败')
    }
  }
}

// Token 管理
const setMockToken = () => {
  tokenService.setToken({
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expires: Date.now() + 60 * 60 * 1000 // 1小时后过期
  })
  ElMessage.success('Token 已设置')
}

const clearToken = () => {
  tokenService.removeToken()
  ElMessage.success('Token 已清除')
}

const testAuthenticatedRequest = async () => {
  loading.value.auth = true
  try {
    const response = await httpClient.get('/test/auth')
    ElMessage.success('认证请求成功')
  } catch (error: any) {
    addErrorLog(`认证请求失败: ${error.message}`)
  } finally {
    loading.value.auth = false
  }
}

const testTokenRefresh = async () => {
  loading.value.refresh = true
  try {
    // 模拟 401 错误触发 Token 刷新
    await httpClient.get('/test/401')
  } catch (error: any) {
    addErrorLog(`Token 刷新测试: ${error.message}`)
  } finally {
    loading.value.refresh = false
  }
}

// 缓存管理
const getCacheStats = () => {
  // 这里需要实际获取缓存统计信息
  cacheStats.value = {
    size: Math.floor(Math.random() * 50),
    maxSize: 100
  }
  ElMessage.success('缓存统计已更新')
}

const clearCache = () => {
  // 清除缓存的逻辑
  ElMessage.success('缓存已清除')
}

const testCacheHit = async () => {
  // 测试缓存命中
  await testCachedRequest()
  // 立即再次请求，应该命中缓存
  setTimeout(async () => {
    await testCachedRequest()
    ElMessage.info('第二次请求应该命中缓存')
  }, 100)
}

// 辅助函数
const addErrorLog = (message: string) => {
  errorLogs.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message
  })
  // 限制日志数量
  if (errorLogs.value.length > 10) {
    errorLogs.value = errorLogs.value.slice(0, 10)
  }
}

// 生命周期
onMounted(() => {
  ElMessage.info('数据层演示页面已加载')
})

onUnmounted(() => {
  // 清理未完成的请求
  requestCancelManager.cancelAllRequests()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-data-layer-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.chonglou-data-layer-demo__header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  h2 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--text-secondary);
    font-size: var(--font-size-base);
  }
}

.chonglou-data-layer-demo__content {
  display: grid;
  gap: var(--spacing-lg);
  
  @include mix.tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mix.mobile {
    grid-template-columns: 1fr;
  }
}

.chonglou-data-layer-demo__card {
  margin-bottom: var(--spacing-lg);
}

.chonglou-data-layer-demo__controls {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
}

.chonglou-data-layer-demo__result {
  margin-top: var(--spacing-md);
  
  pre {
    background-color: var(--bg-secondary);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    overflow-x: auto;
    margin-top: var(--spacing-xs);
  }
}

.chonglou-data-layer-demo__error-logs {
  margin-top: var(--spacing-md);
  
  h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  .error-log {
    padding: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    background-color: #fef0f0;
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
  }
}

.chonglou-data-layer-demo__race-results {
  margin-top: var(--spacing-md);
  
  h4 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    padding: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
  }
}

.chonglou-data-layer-demo__token-status,
.chonglou-data-layer-demo__cache-stats {
  margin-top: var(--spacing-md);
}
</style>
