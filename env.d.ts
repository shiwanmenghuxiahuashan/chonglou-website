/// <reference types="vite/client" />
/// <reference types="node" />

// 为 web-memcache 模块添加类型声明
declare module 'web-memcache' {
  export interface MemcacheOptions {
    maxAge?: number;
    maxSize?: number;
  }

  export class Memcache {
    constructor(options?: MemcacheOptions);
    get<T = any>(key: string): T | undefined;
    set<T = any>(key: string, value: T, maxAge?: number): void;
    delete(key: string): boolean;
    clear(): void;
    has(key: string): boolean;
    size(): number;
  }

  export default Memcache;
}
