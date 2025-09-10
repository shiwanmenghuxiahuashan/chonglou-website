<template>
  <div class="chonglou-worker-demo">
    <div class="chonglou-worker-demo__header">
      <h2>Web Worker 性能演示</h2>
      <p>演示 Web Worker 在处理计算密集型任务时的性能优势</p>
    </div>

    <div class="chonglou-worker-demo__controls">
      <el-card class="chonglou-worker-demo__card">
        <template #header>
          <span>斐波那契数列计算</span>
        </template>
        
        <div class="chonglou-worker-demo__control-group">
          <el-input-number 
            v-model="fibNumber" 
            :min="1" 
            :max="45" 
            label="计算第几个斐波那契数"
          />
          <div class="chonglou-worker-demo__button-group">
            <el-button 
              type="primary" 
              @click="calculateInWorker"
              :loading="workerState.isRunning"
              :disabled="!workerState.isSupported"
            >
              Worker 计算
            </el-button>
            <el-button 
              @click="calculateInMainThread"
              :loading="mainThreadLoading"
            >
              主线程计算
            </el-button>
          </div>
        </div>

        <div class="chonglou-worker-demo__results" v-if="hasResults">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Worker 结果">
              {{ workerResult || '未计算' }}
            </el-descriptions-item>
            <el-descriptions-item label="Worker 耗时">
              {{ workerTime ? `${workerTime}ms` : '未计算' }}
            </el-descriptions-item>
            <el-descriptions-item label="主线程结果">
              {{ mainThreadResult || '未计算' }}
            </el-descriptions-item>
            <el-descriptions-item label="主线程耗时">
              {{ mainThreadTime ? `${mainThreadTime}ms` : '未计算' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-alert 
          v-if="workerState.error" 
          type="error" 
          :title="workerState.error.message"
          show-icon
          closable
          @close="clearWorkerError"
        />
      </el-card>

      <el-card class="chonglou-worker-demo__card">
        <template #header>
          <span>大数组排序</span>
        </template>
        
        <div class="chonglou-worker-demo__control-group">
          <el-input-number 
            v-model="arraySize" 
            :min="1000" 
            :max="100000" 
            :step="1000"
            label="数组大小"
          />
          <div class="chonglou-worker-demo__button-group">
            <el-button 
              type="primary" 
              @click="sortArrayInWorker"
              :loading="sortWorkerLoading"
            >
              Worker 排序
            </el-button>
            <el-button 
              @click="sortArrayInMainThread"
              :loading="sortMainThreadLoading"
            >
              主线程排序
            </el-button>
          </div>
        </div>

        <div class="chonglou-worker-demo__results" v-if="hasSortResults">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Worker 耗时">
              {{ sortWorkerTime ? `${sortWorkerTime}ms` : '未计算' }}
            </el-descriptions-item>
            <el-descriptions-item label="主线程耗时">
              {{ sortMainThreadTime ? `${sortMainThreadTime}ms` : '未计算' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>

    <div class="chonglou-worker-demo__info">
      <el-card>
        <template #header>
          <span>Web Worker 支持状态</span>
        </template>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="浏览器支持">
            <el-tag :type="workerState.isSupported ? 'success' : 'danger'">
              {{ workerState.isSupported ? '支持' : '不支持' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Worker 状态">
            <el-tag :type="workerState.isRunning ? 'warning' : 'info'">
              {{ workerState.isRunning ? '运行中' : '空闲' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWebWorker, WorkerFunctions } from '@/utils/useWebWorker'
import { ElMessage } from 'element-plus'

// 斐波那契计算相关
const fibNumber = ref(35)
const workerResult = ref<number | null>(null)
const workerTime = ref<number | null>(null)
const mainThreadResult = ref<number | null>(null)
const mainThreadTime = ref<number | null>(null)
const mainThreadLoading = ref(false)

// 数组排序相关
const arraySize = ref(10000)
const sortWorkerTime = ref<number | null>(null)
const sortMainThreadTime = ref<number | null>(null)
const sortWorkerLoading = ref(false)
const sortMainThreadLoading = ref(false)

// Web Worker 实例
const fibWorker = useWebWorker(WorkerFunctions.fibonacci, { 
  timeout: 30000, 
  enableLogs: true 
})
const sortWorker = useWebWorker(WorkerFunctions.sortArray)

// 计算属性
const workerState = computed(() => fibWorker.state)
const hasResults = computed(() => 
  workerResult.value !== null || mainThreadResult.value !== null
)
const hasSortResults = computed(() => 
  sortWorkerTime.value !== null || sortMainThreadTime.value !== null
)

// 在 Worker 中计算斐波那契
const calculateInWorker = async () => {
  try {
    const startTime = performance.now()
    const result = await fibWorker.execute(fibNumber.value)
    const endTime = performance.now()
    
    workerResult.value = result
    workerTime.value = Math.round(endTime - startTime)
    
    ElMessage.success(`Worker 计算完成: ${result}`)
  } catch (error) {
    ElMessage.error(`Worker 计算失败: ${error.message}`)
  }
}

// 在主线程中计算斐波那契
const calculateInMainThread = async () => {
  mainThreadLoading.value = true
  
  try {
    const startTime = performance.now()
    
    // 模拟异步以防止阻塞 UI
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const result = fibonacci(fibNumber.value)
    const endTime = performance.now()
    
    mainThreadResult.value = result
    mainThreadTime.value = Math.round(endTime - startTime)
    
    ElMessage.success(`主线程计算完成: ${result}`)
  } catch (error) {
    ElMessage.error(`主线程计算失败: ${error.message}`)
  } finally {
    mainThreadLoading.value = false
  }
}

// 主线程斐波那契函数
const fibonacci = (n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

// 在 Worker 中排序数组
const sortArrayInWorker = async () => {
  sortWorkerLoading.value = true
  
  try {
    const array = generateRandomArray(arraySize.value)
    const startTime = performance.now()
    
    await sortWorker.execute(array)
    
    const endTime = performance.now()
    sortWorkerTime.value = Math.round(endTime - startTime)
    
    ElMessage.success(`Worker 排序完成`)
  } catch (error) {
    ElMessage.error(`Worker 排序失败: ${error.message}`)
  } finally {
    sortWorkerLoading.value = false
  }
}

// 在主线程中排序数组
const sortArrayInMainThread = async () => {
  sortMainThreadLoading.value = true
  
  try {
    const array = generateRandomArray(arraySize.value)
    
    // 模拟异步以防止阻塞 UI
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const startTime = performance.now()
    array.sort((a, b) => a - b)
    const endTime = performance.now()
    
    sortMainThreadTime.value = Math.round(endTime - startTime)
    
    ElMessage.success(`主线程排序完成`)
  } catch (error) {
    ElMessage.error(`主线程排序失败: ${error.message}`)
  } finally {
    sortMainThreadLoading.value = false
  }
}

// 生成随机数组
const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 1000))
}

// 清除 Worker 错误
const clearWorkerError = () => {
  fibWorker.clearError()
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-worker-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.chonglou-worker-demo__header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  
  h2 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
}

.chonglou-worker-demo__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.chonglou-worker-demo__card {
  .chonglou-worker-demo__control-group {
    @include mix.flex-column;
    gap: var(--spacing-lg);
    
    .chonglou-worker-demo__button-group {
      @include mix.flex-center;
      gap: var(--spacing-md);
    }
  }
  
  .chonglou-worker-demo__results {
    margin-top: var(--spacing-lg);
  }
}

.chonglou-worker-demo__info {
  margin-top: var(--spacing-xl);
}

// 响应式适配
@include mix.mobile {
  .chonglou-worker-demo__controls {
    grid-template-columns: 1fr;
  }
  
  .chonglou-worker-demo__card .chonglou-worker-demo__control-group .chonglou-worker-demo__button-group {
    flex-direction: column;
    width: 100%;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
