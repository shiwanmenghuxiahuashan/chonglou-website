<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Icon from '@/components/common/Icon.vue'
import { useSettingsStore } from '@/framework/stores/settings'

interface Props {
  title?: string
  keepAliveComponents?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '李重楼',
  keepAliveComponents: () => ['ArticleList', 'Home']
})

// 使用 props
const { title, keepAliveComponents } = props

const settingsStore = useSettingsStore()
const { isDark } = storeToRefs(settingsStore)

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 导航菜单项
const navItems = [
  { path: 'article', label: '文章' },
  { path: 'about', label: '关于' },
  { path: '/editor', label: '编辑器' }
]

// 切换主题
const toggleTheme = () => {
  settingsStore.toggleTheme()
}
</script>

<template>
  <div class="main-layout">
    <!-- 顶部导航栏 - 固定在顶部，撑满屏幕 -->
    <header class="main-layout__header">
      <div class="main-layout__header-content">
        <!-- Logo 区域 -->
        <div class="main-layout__logo">
          <router-link to="/" class="main-layout__logo-link">
            <span class="main-layout__logo-text">{{ title }}</span>
          </router-link>
        </div>

        <!-- 导航菜单 -->
        <nav class="main-layout__nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :target="item.label === 'editor' ? '_blank' : '_self'"
            class="main-layout__nav-item"
            active-class="main-layout__nav-item--active"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- 操作按钮区域 -->
        <div class="main-layout__actions">
          <button
            :title="`切换到${isDark ? '浅色' : '深色'}主题`"
            class="main-layout__theme-toggle"
            @click="toggleTheme"
          >
            <Icon :name="isDark ? 'Sunny' : 'Moon'" :size="18" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-layout__main">
      <div class="main-layout__content">
        <!-- 路由组件渲染区域 -->
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <keep-alive :include="keepAliveComponents">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 底部 Footer -->
    <footer class="main-layout__footer">
      <div class="main-layout__footer-content">
        <div class="main-layout__footer-info">
          <p>© {{ currentYear }} {{ title }} 基于 Vue 3 + TypeScript 构建</p>
        </div>

        <div class="main-layout__footer-links">
          <a
            href="https://github.com/shiwanmenghuxiahuashan/chonglou-website"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="/privacy" target="_blank">隐私政策</a>
          <a href="/terms" target="_blank">使用条款</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
/* ========== 布局基础 ========== */
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

/* ========== Header - 横向撑满，顶部固定，高度50px ========== */
.main-layout__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 50px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:deep(.dark) .main-layout__header {
  background: rgba(18, 18, 18, 0.95);
}

.main-layout__header-content {
  max-width: 1280px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* ========== Logo 区域 ========== */
.main-layout__logo {
  flex-shrink: 0;
}

.main-layout__logo-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  height: 50px;

  &:hover .main-layout__logo-text {
    color: var(--primary-color);
  }
}

.main-layout__logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  transition: color 0.3s ease;
}

/* ========== 导航菜单 ========== */
.main-layout__nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.main-layout__nav-item {
  padding: 6px 12px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  height: 32px;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--primary-color);
    background: var(--bg-hover);
  }

  &--active {
    color: var(--primary-color);
    background: var(--bg-hover);
  }
}

/* ========== 操作按钮区域 ========== */
.main-layout__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.main-layout__theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: var(--primary-color);
    background: var(--bg-hover);
  }
}

/* ========== 主内容区域 - 预留header空间 ========== */
.main-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 50px; /* 为固定header预留空间 */
}

.main-layout__content {
  flex: 1;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 24px;
}

/* ========== Footer ========== */
.main-layout__footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.main-layout__footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.main-layout__footer-info {
  color: var(--text-secondary);
  font-size: 14px;

  p {
    margin: 0;
  }
}

.main-layout__footer-links {
  display: flex;
  align-items: center;
  gap: 24px;

  a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-color);
    }
  }
}

/* ========== 页面切换动画 ========== */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========== 响应式设计 ========== */
@media (max-width: 1280px) {
  .main-layout__header-content,
  .main-layout__content,
  .main-layout__footer-content {
    margin: 0 16px;
  }
}

@media (max-width: 768px) {
  .main-layout__header-content {
    padding: 0 16px;
    gap: 16px;
  }

  .main-layout__nav {
    display: none; /* 移动端隐藏导航菜单 */
  }

  .main-layout__logo-text {
    font-size: 16px;
  }

  .main-layout__content {
    padding: 16px;
  }

  .main-layout__footer-content {
    flex-direction: column;
    text-align: center;
    padding: 16px;
    gap: 12px;
  }

  .main-layout__footer-links {
    justify-content: center;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .main-layout__header-content {
    padding: 0 12px;
  }

  .main-layout__content {
    padding: 12px;
  }

  .main-layout__footer-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
