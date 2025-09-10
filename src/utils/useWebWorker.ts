import { ref, onUnmounted } from 'vue'

// Web Worker 状态类型
export interface WebWorkerState {
  isSupported: boolean
  isRunning: boolean
  error: Error | null
}

// Web Worker 消息类型
export interface WorkerMessage {
  id: string
  type: 'task' | 'result' | 'error'
  data: any
  timestamp: number
}

// Web Worker Hook 配置
export interface WebWorkerOptions {
  timeout?: number
  enableLogs?: boolean
}

/**
 * Web Worker 组合式函数
 * @param workerFunction 要在 Worker 中执行的函数
 * @param options 配置选项
 * @returns Web Worker 相关状态和方法
 */
export function useWebWorker<T = any, R = any>(
  workerFunction?: (data: T) => R,
  options: WebWorkerOptions = {}
) {
  const { timeout = 30000, enableLogs = false } = options

  // 状态
  const state = ref<WebWorkerState>({
    isSupported: typeof Worker !== 'undefined',
    isRunning: false,
    error: null
  })

  // Worker 实例
  let worker: Worker | null = null
  let messageId = 0
  const pendingTasks = new Map<string, {
    resolve: (value: R) => void
    reject: (reason: Error) => void
    timer: number
  }>()

  /**
   * 生成唯一消息ID
   */
  const generateMessageId = (): string => {
    return `msg_${++messageId}_${Date.now()}`
  }

  /**
   * 创建 Worker Blob URL
   */
  const createWorkerBlobUrl = (fn: Function): string => {
    const workerScript = `
      self.onmessage = function(e) {
        const { id, type, data } = e.data;
        
        if (type !== 'task') return;
        
        try {
          const userFunction = ${fn.toString()};
          const result = userFunction(data);
          
          // 处理 Promise 结果
          if (result && typeof result.then === 'function') {
            result
              .then(res => {
                self.postMessage({
                  id,
                  type: 'result',
                  data: res,
                  timestamp: Date.now()
                });
              })
              .catch(err => {
                self.postMessage({
                  id,
                  type: 'error',
                  data: err.message || 'Unknown error',
                  timestamp: Date.now()
                });
              });
          } else {
            self.postMessage({
              id,
              type: 'result',
              data: result,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          self.postMessage({
            id,
            type: 'error',
            data: error.message || 'Execution error',
            timestamp: Date.now()
          });
        }
      };
    `

    const blob = new Blob([workerScript], { type: 'application/javascript' })
    return URL.createObjectURL(blob)
  }

  /**
   * 初始化 Worker
   */
  const initWorker = (fn: Function): boolean => {
    if (!state.value.isSupported) {
      state.value.error = new Error('Web Workers are not supported in this environment')
      return false
    }

    try {
      const blobUrl = createWorkerBlobUrl(fn)
      worker = new Worker(blobUrl)

      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { id, type, data } = event.data

        if (enableLogs) {
          console.log(`[WebWorker] Received message:`, event.data)
        }

        const task = pendingTasks.get(id)
        if (!task) return

        // 清除超时定时器
        clearTimeout(task.timer)
        pendingTasks.delete(id)

        if (type === 'result') {
          task.resolve(data)
        } else if (type === 'error') {
          task.reject(new Error(data))
        }
      }

      worker.onerror = (error) => {
        state.value.error = new Error(`Worker error: ${error.message}`)
        if (enableLogs) {
          console.error('[WebWorker] Error:', error)
        }
      }

      // 清理 Blob URL
      URL.revokeObjectURL(blobUrl)
      
      state.value.error = null
      return true
    } catch (error) {
      state.value.error = error instanceof Error ? error : new Error('Failed to initialize worker')
      return false
    }
  }

  /**
   * 执行任务
   */
  const execute = (data: T, customFunction?: (data: T) => R): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (!state.value.isSupported) {
        reject(new Error('Web Workers are not supported'))
        return
      }

      const functionToExecute = customFunction || workerFunction
      if (!functionToExecute) {
        reject(new Error('No function provided for execution'))
        return
      }

      // 如果没有 worker 或者使用了新函数，重新初始化
      if (!worker || customFunction) {
        if (!initWorker(functionToExecute)) {
          reject(state.value.error)
          return
        }
      }

      const messageId = generateMessageId()
      
      // 设置超时
      const timer = window.setTimeout(() => {
        pendingTasks.delete(messageId)
        reject(new Error(`Worker task timeout after ${timeout}ms`))
      }, timeout)

      // 存储任务回调
      pendingTasks.set(messageId, { resolve, reject, timer })

      // 发送任务到 Worker
      const message: WorkerMessage = {
        id: messageId,
        type: 'task',
        data,
        timestamp: Date.now()
      }

      if (enableLogs) {
        console.log(`[WebWorker] Sending message:`, message)
      }

      state.value.isRunning = true
      worker!.postMessage(message)

      // 监听任务完成
      const originalResolve = resolve
      const originalReject = reject
      
      resolve = (value: R) => {
        state.value.isRunning = pendingTasks.size > 0
        originalResolve(value)
      }
      
      reject = (reason: Error) => {
        state.value.isRunning = pendingTasks.size > 0
        originalReject(reason)
      }
    })
  }

  /**
   * 终止 Worker
   */
  const terminate = () => {
    if (worker) {
      worker.terminate()
      worker = null
    }

    // 清理待处理的任务
    pendingTasks.forEach(({ reject, timer }) => {
      clearTimeout(timer)
      reject(new Error('Worker terminated'))
    })
    pendingTasks.clear()

    state.value.isRunning = false
    state.value.error = null
  }

  /**
   * 清除错误状态
   */
  const clearError = () => {
    state.value.error = null
  }

  // 组件卸载时清理
  onUnmounted(() => {
    terminate()
  })

  return {
    // 状态
    state: state.value,
    
    // 方法
    execute,
    terminate,
    clearError,
    
    // 只读计算属性
    get isSupported() {
      return state.value.isSupported
    },
    get isRunning() {
      return state.value.isRunning
    },
    get error() {
      return state.value.error
    }
  }
}

/**
 * 预定义的常用 Worker 函数
 */
export const WorkerFunctions = {
  /**
   * 计算密集型任务：计算斐波那契数列
   */
  fibonacci: (n: number): number => {
    if (n <= 1) return n
    return WorkerFunctions.fibonacci(n - 1) + WorkerFunctions.fibonacci(n - 2)
  },

  /**
   * 数据处理：排序大数组
   */
  sortArray: (arr: number[]): number[] => {
    return [...arr].sort((a, b) => a - b)
  },

  /**
   * 图像处理：模拟像素处理
   */
  processImageData: (imageData: { width: number; height: number; data: number[] }) => {
    const { width, height, data } = imageData
    const processed = [...data]
    
    // 简单的灰度处理
    for (let i = 0; i < processed.length; i += 4) {
      const gray = processed[i] * 0.299 + processed[i + 1] * 0.587 + processed[i + 2] * 0.114
      processed[i] = gray     // R
      processed[i + 1] = gray // G
      processed[i + 2] = gray // B
      // processed[i + 3] 保持不变 (Alpha)
    }
    
    return { width, height, data: processed }
  },

  /**
   * 文本处理：词频统计
   */
  wordFrequency: (text: string): Record<string, number> => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const frequency: Record<string, number> = {}
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
    
    return frequency
  },

  /**
   * 数学计算：矩阵乘法
   */
  matrixMultiply: (matrices: { a: number[][]; b: number[][] }): number[][] => {
    const { a, b } = matrices
    const result: number[][] = []
    
    for (let i = 0; i < a.length; i++) {
      result[i] = []
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j]
        }
        result[i][j] = sum
      }
    }
    
    return result
  }
}

// 导出类型
export type { WebWorkerState, WorkerMessage, WebWorkerOptions }
