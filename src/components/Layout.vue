<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <nav class="main-nav">
          <div class="nav-brand">
            <h3>重楼网站</h3>
          </div>
          <div class="nav-links">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/articles" class="nav-link">文章</router-link>
          </div>
        </nav>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer>
        <p>© 2025 李重楼</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.common-layout {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.main-nav {
  @include mix.flex-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-brand {
  h3 {
    color: var(--primary-color);
    font-weight: var(--font-weight-bold);
    margin: 0;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.nav-links {
  @include mix.flex-start;
  gap: var(--spacing-lg);
}

.nav-link {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: var(--bg-secondary);
    color: var(--primary-color);
    text-decoration: none;
  }
  
  &.router-link-active {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    
    &:hover {
      color: white;
      background: linear-gradient(135deg, var(--primary-dark), var(--secondary-color));
    }
  }
}

// 响应式设计
@include mix.mobile {
  .main-nav {
    padding: 0 var(--spacing-md);
  }
  
  .nav-links {
    gap: var(--spacing-sm);
  }
  
  .nav-link {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}
</style>
