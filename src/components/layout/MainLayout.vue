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
  title: '李重楼前端',
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
  { path: '/', label: '首页' },
  { path: '/article', label: '文章' },
  { path: '/about', label: '关于' },
  { path: '/demo', label: '演示' },
  { path: '/editor', label: 'Editor' }
]

// 切换主题
const toggleTheme = () => {
  settingsStore.toggleTheme()
}
</script>

<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="main-layout__header">
      <div class="main-layout__header-container">
        <!-- Logo 区域 -->
        <div class="main-layout__logo">
          <router-link to="/" class="main-layout__logo-link">
            <h1 class="main-layout__logo-text">{{ title }}</h1>
          </router-link>
        </div>

        <!-- 导航菜单 -->
        <nav class="main-layout__nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
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
            <Icon :name="isDark ? 'Sunny' : 'Moon'" :size="20" />
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
      <div class="main-layout__footer-container">
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
@use '@/styles/_variables' as vars;
@use '@/styles/_mixins' as mix;

.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

/* ========== Header ========== */
.main-layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:deep(.dark) .main-layout__header {
  background: rgba(20, 20, 20, 0.9);
}

.main-layout__header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.main-layout__logo {
  flex-shrink: 0;
}

.main-layout__logo-link {
  text-decoration: none;
  color: inherit;

  &:hover .main-layout__logo-text {
    color: var(--primary-color);
  }
}

.main-layout__logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  transition: color 0.3s ease;
}

.main-layout__nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: center;
}

.main-layout__nav-item {
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: var(--primary-color);
    background: var(--bg-hover);
  }

  &--active {
    color: var(--primary-color);

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: var(--primary-color);
      border-radius: 1px;
    }
  }
}

.main-layout__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.main-layout__theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: var(--primary-color);
    background: var(--bg-hover);
  }
}

/* ========== Main Content ========== */
.main-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-layout__content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

/* ========== Footer ========== */
.main-layout__footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.main-layout__footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.main-layout__footer-info {
  color: var(--text-secondary);
  font-size: 0.9rem;

  p {
    margin: 0;
  }
}

.main-layout__footer-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);

  a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-color);
    }
  }
}

/* ========== Page Transitions ========== */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ========== Responsive Design ========== */
@media (max-width: 768px) {
  .main-layout__header-container {
    padding: 0 var(--spacing-md);
    height: 56px;
  }

  .main-layout__nav {
    display: none; // 移动端隐藏导航，可以后续添加移动菜单
  }

  .main-layout__logo-text {
    font-size: 1.25rem;
  }

  .main-layout__content {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .main-layout__footer-container {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-md);
  }

  .main-layout__footer-links {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .main-layout__footer-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
