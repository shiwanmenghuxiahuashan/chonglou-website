<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import { useSettingsStore } from '@/stores/settings'

interface Props {
  title?: string
  showSidebar?: boolean
  keepAliveComponents?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '重楼前端技术分享',
  showSidebar: true,
  keepAliveComponents: () => ['ArticleList', 'Home']
})

const route = useRoute()
const settingsStore = useSettingsStore()
const { isDark } = storeToRefs(settingsStore)

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 切换主题
const toggleTheme = () => {
  settingsStore.toggleTheme()
}

// 响应式处理
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebarCollapsed.value = true
    }
  }

  window.addEventListener('resize', handleResize)
  handleResize()

  return () => {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<template>
  <div
    class="chonglou-main-layout"
    :class="{ 'chonglou-main-layout--sidebar-collapsed': sidebarCollapsed }"
  >
    <!-- 顶部导航栏 -->
    <header class="chonglou-main-layout__header">
      <slot name="header">
        <div class="chonglou-main-layout__header-content">
          <div class="chonglou-main-layout__header-left">
            <button
              v-if="showSidebar"
              class="chonglou-main-layout__sidebar-toggle"
              @click="toggleSidebar"
            >
              <Icon name="Menu" :size="20" />
            </button>
            <div class="chonglou-main-layout__logo">
              <slot name="logo">
                <h1>{{ title }}</h1>
              </slot>
            </div>
          </div>

          <div class="chonglou-main-layout__header-center">
            <slot name="nav">
              <nav class="chonglou-main-layout__nav">
                <router-link to="/" class="chonglou-main-layout__nav-item"
                  >首页</router-link
                >
                <router-link
                  to="/articles"
                  class="chonglou-main-layout__nav-item"
                  >文章</router-link
                >
                <router-link to="/about" class="chonglou-main-layout__nav-item"
                  >关于</router-link
                >
              </nav>
            </slot>
          </div>

          <div class="chonglou-main-layout__header-right">
            <slot name="actions">
              <div class="chonglou-main-layout__actions">
                <button
                  class="chonglou-main-layout__theme-toggle"
                  @click="toggleTheme"
                >
                  <Icon :name="isDark ? 'Sunny' : 'Moon'" :size="18" />
                </button>
              </div>
            </slot>
          </div>
        </div>
      </slot>
    </header>

    <!-- 侧边栏 -->
    <aside
      v-if="showSidebar"
      class="chonglou-main-layout__sidebar"
      :class="{ 'chonglou-main-layout__sidebar--collapsed': sidebarCollapsed }"
    >
      <slot name="sidebar">
        <div class="chonglou-main-layout__sidebar-content">
          <nav class="chonglou-main-layout__sidebar-nav">
            <div class="chonglou-main-layout__nav-group">
              <h3 class="chonglou-main-layout__nav-group-title">导航</h3>
              <router-link
                to="/"
                class="chonglou-main-layout__sidebar-nav-item"
              >
                <Icon name="House" />
                <span>首页</span>
              </router-link>
              <router-link
                to="/articles"
                class="chonglou-main-layout__sidebar-nav-item"
              >
                <Icon name="Document" />
                <span>文章列表</span>
              </router-link>
            </div>
          </nav>
        </div>
      </slot>
    </aside>

    <!-- 主要内容区域 -->
    <main class="chonglou-main-layout__main">
      <div class="chonglou-main-layout__content">
        <slot name="content">
          <router-view v-slot="{ Component, route }">
            <transition name="page" mode="out-in">
              <keep-alive :include="keepAliveComponents">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </slot>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="chonglou-main-layout__footer">
      <slot name="footer">
        <div class="chonglou-main-layout__footer-content">
          <div class="chonglou-main-layout__footer-info">
            <p>
              &copy; {{ currentYear }} {{ title }}. 基于 Vue 3 + TypeScript 构建
            </p>
          </div>
          <div class="chonglou-main-layout__footer-links">
            <a href="https://github.com" target="_blank">GitHub</a>
            <a href="/privacy" target="_blank">隐私政策</a>
          </div>
        </div>
      </slot>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-main-layout {
  min-height: 100vh;
  display: grid;
  grid-template-areas:
    'header header'
    'sidebar main'
    'footer footer';
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--header-height) 1fr auto;
  transition: grid-template-columns var(--transition-normal);

  &.chonglou-main-layout--sidebar-collapsed {
    grid-template-columns: var(--sidebar-collapsed-width) 1fr;
  }
}

// 头部样式
.chonglou-main-layout__header {
  grid-area: header;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  backdrop-filter: blur(8px);
}

.chonglou-main-layout__header-content {
  @include mix.flex-between;
  height: var(--header-height);
  padding: 0 var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.chonglou-main-layout__header-left {
  @include mix.flex-center;
  gap: var(--spacing-md);
}

.chonglou-main-layout__sidebar-toggle {
  @include mix.button-ghost;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);

  &:hover {
    background: var(--bg-hover);
  }
}

.chonglou-main-layout__logo h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin: 0;
}

.chonglou-main-layout__header-center {
  flex: 1;
  @include mix.flex-center;
}

.chonglou-main-layout__nav {
  @include mix.flex-center;
  gap: var(--spacing-lg);
}

.chonglou-main-layout__nav-item {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);

  &:hover,
  &.router-link-active {
    color: var(--primary-color);
    background: var(--bg-hover);
  }
}

.chonglou-main-layout__header-right {
  @include mix.flex-center;
  gap: var(--spacing-md);
}

.chonglou-main-layout__theme-toggle {
  @include mix.button-ghost;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);

  &:hover {
    background: var(--bg-hover);
  }
}

// 侧边栏样式
.chonglou-main-layout__sidebar {
  grid-area: sidebar;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
  width: var(--sidebar-width);
  transition: width var(--transition-normal);
  overflow: hidden;

  &.chonglou-main-layout__sidebar--collapsed {
    width: var(--sidebar-collapsed-width);
  }
}

.chonglou-main-layout__sidebar-content {
  padding: var(--spacing-lg);
}

.chonglou-main-layout__nav-group {
  margin-bottom: var(--spacing-xl);
}

.chonglou-main-layout__nav-group-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-placeholder);
  margin-bottom: var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chonglou-main-layout__sidebar-nav-item {
  @include mix.flex-center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-fast);

  &:hover,
  &.router-link-active {
    color: var(--primary-color);
    background: var(--bg-hover);
  }

  span {
    .chonglou-main-layout.chonglou-main-layout--sidebar-collapsed & {
      display: none;
    }
  }
}

// 主内容区域
.chonglou-main-layout__main {
  grid-area: main;
  overflow: hidden;
}

.chonglou-main-layout__content {
  height: 100%;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

// 底部样式
.chonglou-main-layout__footer {
  grid-area: footer;
  background: var(--bg-footer);
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-lg);
}

.chonglou-main-layout__footer-content {
  @include mix.flex-between;
  max-width: 1400px;
  margin: 0 auto;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.chonglou-main-layout__footer-links {
  @include mix.flex-center;
  gap: var(--spacing-lg);

  a {
    color: var(--text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--primary-color);
    }
  }
}

// 页面切换动画
.page-enter-active,
.page-leave-active {
  transition: all var(--transition-normal);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 响应式适配
@include mix.mobile {
  .chonglou-main-layout {
    grid-template-areas:
      'header'
      'main'
      'footer';
    grid-template-columns: 1fr;

    &.chonglou-main-layout--sidebar-collapsed {
      grid-template-columns: 1fr;
    }
  }

  .chonglou-main-layout__sidebar {
    position: fixed;
    top: var(--header-height);
    left: 0;
    height: calc(100vh - var(--header-height));
    z-index: var(--z-sidebar);
    transform: translateX(-100%);
    transition: transform var(--transition-normal);

    &:not(.chonglou-main-layout__sidebar--collapsed) {
      transform: translateX(0);
    }
  }

  .chonglou-main-layout__header-center {
    display: none;
  }

  .chonglou-main-layout__footer-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}
</style>
