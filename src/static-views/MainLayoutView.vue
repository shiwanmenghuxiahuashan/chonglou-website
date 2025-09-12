<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import GlobalHeader from '@/components/common/globalHeader/index.vue'
import GlobalFooter from '@/components/common/globalFooter/index.vue'
import { mockData } from '@/mock/mockData'

const router = useRouter()
const keepAliveComponents = router.getRoutes().map(route => route.name)
const headerData = shallowRef(mockData.headerData)
const footerData = shallowRef(mockData.footerData)
</script>

<template>
  <div class="main-layout">
    <GlobalHeader v-bind="headerData" />
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
    <GlobalFooter :footer-sections="footerData" />
  </div>
</template>

<style lang="scss" scoped>
/* ========== 布局基础 ========== */
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  width: 100%;
  max-width: 100vw; /* 确保不超出视口宽度 */
  overflow-x: hidden; /* 防止横向滚动 */
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
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box; /* 确保 padding 包含在宽度内 */
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
  .main-layout__content {
    padding: 16px;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .main-layout__content {
    padding: 16px;
    margin: 0;
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
  .main-layout__content {
    padding: 12px;
    margin: 0;
  }

  .main-layout__footer-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
