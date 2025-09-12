/**
 * 通用对象池实现
 * 用于复用对象，减少内存分配和垃圾回收开销
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize: number = 50
  ) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  /**
   * 归还对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj)
      }
      this.pool.push(obj)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool.length = 0
  }

  /**
   * 获取池大小
   */
  get size(): number {
    return this.pool.length
  }
}

/**
 * 专门用于 Map 的对象池
 */
export class MapPool extends ObjectPool<Map<string, any>> {
  constructor(maxSize: number = 50) {
    super(
      () => new Map<string, any>(),
      map => map.clear(),
      maxSize
    )
  }
}

/**
 * 专门用于 Set 的对象池
 */
export class SetPool extends ObjectPool<Set<string>> {
  constructor(maxSize: number = 50) {
    super(
      () => new Set<string>(),
      set => set.clear(),
      maxSize
    )
  }
}

/**
 * 专门用于普通对象的对象池
 */
export class PlainObjectPool extends ObjectPool<Record<string, any>> {
  constructor(maxSize: number = 100) {
    super(
      () => Object.create(null),
      obj => {
        // 清空对象的所有属性
        for (const key in obj) {
          delete obj[key]
        }
      },
      maxSize
    )
  }
}
