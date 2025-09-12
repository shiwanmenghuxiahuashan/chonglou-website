<script setup>
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
</script>

<template>
  <!-- 顶部导航栏 - 固定在顶部，撑满屏幕 -->
  <header class="chonglou-global__header">
    <div class="chonglou-global__header-content">
      <!-- Logo 区域 -->
      <div class="chonglou-global__header-logo">
        <router-link to="/" class="chonglou-global__header-logo-link">
          <span class="chonglou-global__header-logo-text">{{ title }}</span>
        </router-link>
      </div>

      <!-- 导航菜单 -->
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

      <!-- 操作按钮区域 -->
      <div class="chonglou-global__header-actions">
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
      </div>
    </div>
  </header>
</template>

<style lang="scss">
@use './globalHeader.scss';
</style>
