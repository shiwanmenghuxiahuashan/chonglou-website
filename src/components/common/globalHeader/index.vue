<script setup>
import { ref } from 'vue'
import MobileMenu from './src/MobileMenu/index.vue'
import { useSettingsStore } from '@/framework/stores/settings'

defineProps({
  title: {
    type: String,
    required: true
  },
  navItems: {
    type: Array,
    required: true
  }
})

// 使用设置存储
const settingsStore = useSettingsStore()
const { isDark, toggleTheme } = settingsStore

// 移动端菜单状态
const isMobileMenuOpen = ref(false)

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <!-- 顶部导航栏 -->
  <header class="chonglou-global__header">
    <!-- 桌面端导航 -->
    <div class="chonglou-global__header-content">
      <!-- Logo 区域 - 左侧 -->
      <div class="chonglou-global__header-logo">
        <router-link to="/" class="chonglou-global__header-logo-link">
          <span class="chonglou-global__header-logo-text">{{ title }}</span>
        </router-link>
      </div>

      <!-- 导航菜单 - 中间 -->
      <nav class="chonglou-global__header-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :target="item.label === 'editor' ? '_blank' : '_self'"
          class="chonglou-global__header-nav-item"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <!-- 操作按钮区域 - 右侧 -->
      <div class="chonglou-global__header-actions">
        <!-- 主题切换按钮 -->
        <el-tooltip
          :content="`切换到${isDark ? '浅色' : '深色'}主题`"
          placement="bottom"
        >
          <el-button
            :icon="isDark ? 'Sunny' : 'Moon'"
            circle
            size="small"
            class="chonglou-global__header-actions-theme-toggle"
            @click="toggleTheme"
          />
        </el-tooltip>

        <!-- 移动端菜单按钮 -->
        <el-button
          class="chonglou-global__header-actions-mobile-menu"
          @click="toggleMobileMenu"
        >
          <el-icon>
            <component :is="isMobileMenuOpen ? 'Close' : 'Menu'" />
          </el-icon>
        </el-button>
      </div>
    </div>

    <!-- 移动端全屏菜单 -->
    <MobileMenu
      :is-open="isMobileMenuOpen"
      :nav-items="navItems"
      @close="closeMobileMenu"
    />
  </header>
</template>

<style lang="scss">
@use './globalHeader.scss';
</style>
