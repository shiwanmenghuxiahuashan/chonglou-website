import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { projectConfig, resourceConfig } from './src/config'
// 开发服务器配置
const getServerConfig = projectConfig => {
  return {
    port: projectConfig.serverPort,
    proxy: projectConfig.api,
    strictPort: false,
    open: false,
    cors: true,
    hmr: { overlay: false },
    watch: { ignored: ['**/node_modules/**', '**/.git/**'] },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, Content-Type, Authorization'
    }
  }
}
// 插件配置函数
const getPlugins = projectConfig =>
  [
    vue(),
    createHtmlPlugin({
      minify: true,
      /**
       * 在这里写entry后，你将不需要在`index.html`内添加 script 标签，原有标签需要删除
       * @default src/main.js
       */
      entry: 'src/main.ts',

      /**
       * 需要注入 index.html ejs 模版的数据
       */
      inject: {
        data: {
          title: projectConfig.title,
          injectScript: `<script src="./inject.js"></script>`
        }
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['image/icon/favicon.webp'],
      devOptions: {
        enabled: false // 开发环境禁用 PWA
      },
      manifest: {
        name: projectConfig.title,
        short_name: '重楼技术',
        description: '专注于现代前端技术分享与交流的个人网站',
        theme_color: '#409eff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'image/icon/favicon.webp',
            sizes: '128x128',
            type: 'image/webp'
          },
          {
            src: 'image/icon/favicon.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'image/icon/favicon.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          },
          {
            urlPattern: /\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1天
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ].filter(Boolean)

// https://vitejs.dev/config/
export default defineConfig({
  // 服务器配置
  server: getServerConfig(projectConfig),
  plugins: getPlugins(projectConfig),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 构建优化
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus']
        }
      }
    }
  },
  // 在这里，我们将配置对象转换为 JSON 字符串，并注入到全局变量
  define: {
    __PROJECT_CONFIG__: {
      api: projectConfig.api
    },
    __RESOURCE_CONFIG__: {
      ...resourceConfig
    }
  }
})
