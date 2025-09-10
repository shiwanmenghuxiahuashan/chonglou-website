<template>
  <div class="main-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <slot name="header">
        <div class="header-content">
          <div class="header-left">
            <button 
              class="sidebar-toggle"
              @click="toggleSidebar"
              v-if="showSidebar"
            >
              <Icon name="Menu" :size="20" />
            </button>
            <div class="logo">
              <slot name="logo">
                <h1>{{ title }}</h1>
              </slot>
            </div>
          </div>
          
          <div class="header-center">
            <slot name="nav">
              <nav class="main-nav">
                <router-link to="/" class="nav-item">首页</router-link>
                <router-link to="/articles" class="nav-item">文章</router-link>
                <router-link to="/about" class="nav-item">关于</router-link>
              </nav>
            </slot>
          </div>
          
          <div class="header-right">
            <slot name="actions">
              <div class="header-actions">
                <button class="theme-toggle" @click="toggleTheme">
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
      class="layout-sidebar" 
      v-if="showSidebar"
      :class="{ 'collapsed': sidebarCollapsed }"
    >
      <slot name="sidebar">
        <div class="sidebar-content">
          <nav class="sidebar-nav">
            <div class="nav-group">
              <h3 class="nav-group-title">导航</h3>
              <router-link to="/" class="sidebar-nav-item">
                <Icon name="House" />
                <span>首页</span>
              </router-link>
              <router-link to="/articles" class="sidebar-nav-item">
                <Icon name="Document" />
                <span>文章列表</span>
              </router-link>
            </div>
          </nav>
        </div>
      </slot>
    </aside>

    <!-- 主要内容区域 -->
    <main class="layout-main">
      <div class="main-content">
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
    <footer class="layout-footer">
      <slot name="footer">
        <div class="footer-content">
          <div class="footer-info">
            <p>&copy; {{ currentYear }} {{ title }}. 基于 Vue 3 + TypeScript 构建</p>
          </div>
          <div class="footer-links">
            <a href="https://github.com" target="_blank">GitHub</a>
            <a href="/privacy" target="_blank">隐私政策</a>
          </div>
        </div>
      </slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import Icon from '@/components/common/Icon.vue'

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

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.main-layout {
  min-height: 100vh;
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--header-height) 1fr auto;
  transition: grid-template-columns var(--transition-normal);
  
  &.sidebar-collapsed {
    grid-template-columns: var(--sidebar-collapsed-width) 1fr;
  }
}

// 头部样式
.layout-header {
  grid-area: header;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  backdrop-filter: blur(8px);
}

.header-content {
  @include mix.flex-between;
  height: var(--header-height);
  padding: 0 var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  @include mix.flex-center;
  gap: var(--spacing-md);
}

.sidebar-toggle {
  @include mix.button-ghost;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  
  &:hover {
    background: var(--bg-hover);
  }
}

.logo h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
}

.header-center {
  flex: 1;
  @include mix.flex-center;
}

.main-nav {
  @include mix.flex-center;
  gap: var(--spacing-lg);
}

.nav-item {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  
  &:hover,
  &.router-link-active {
    color: var(--color-primary);
    background: var(--bg-hover);
  }
}

.header-right {
  @include mix.flex-center;
  gap: var(--spacing-md);
}

.theme-toggle {
  @include mix.button-ghost;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  
  &:hover {
    background: var(--bg-hover);
  }
}

// 侧边栏样式
.layout-sidebar {
  grid-area: sidebar;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
  width: var(--sidebar-width);
  transition: width var(--transition-normal);
  overflow: hidden;
  
  &.collapsed {
    width: var(--sidebar-collapsed-width);
  }
}

.sidebar-content {
  padding: var(--spacing-lg);
}

.nav-group {
  margin-bottom: var(--spacing-xl);
}

.nav-group-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-placeholder);
  margin-bottom: var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-nav-item {
  @include mix.flex-center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-fast);
  
  &:hover,
  &.router-link-active {
    color: var(--color-primary);
    background: var(--bg-hover);
  }
  
  span {
    .layout.sidebar-collapsed & {
      display: none;
    }
  }
}

// 主内容区域
.layout-main {
  grid-area: main;
  overflow: hidden;
}

.main-content {
  height: 100%;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

// 底部样式
.layout-footer {
  grid-area: footer;
  background: var(--bg-footer);
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-lg);
}

.footer-content {
  @include mix.flex-between;
  max-width: 1400px;
  margin: 0 auto;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.footer-links {
  @include mix.flex-center;
  gap: var(--spacing-lg);
  
  a {
    color: var(--text-secondary);
    text-decoration: none;
    
    &:hover {
      color: var(--color-primary);
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
  .main-layout {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
    
    &.sidebar-collapsed {
      grid-template-columns: 1fr;
    }
  }
  
  .layout-sidebar {
    position: fixed;
    top: var(--header-height);
    left: 0;
    height: calc(100vh - var(--header-height));
    z-index: var(--z-sidebar);
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    
    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
  
  .header-center {
    display: none;
  }
  
  .footer-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}
</style>
