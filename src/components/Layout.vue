<script setup lang="ts"></script>

<template>
  <div class="chonglou-layout">
    <el-container>
      <el-header>
        <nav class="chonglou-layout__nav">
          <div class="chonglou-layout__brand">
            <h3>重楼网站</h3>
          </div>
          <div class="chonglou-layout__links">
            <router-link to="/" class="chonglou-layout__link">首页</router-link>
            <router-link to="/articles" class="chonglou-layout__link"
              >文章</router-link
            >
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

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-layout {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.chonglou-layout__nav {
  @include mix.flex-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.chonglou-layout__brand {
  h3 {
    color: var(--primary-color);
    font-weight: var(--font-weight-bold);
    margin: 0;
    background: linear-gradient(
      135deg,
      var(--primary-color),
      var(--secondary-color)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.chonglou-layout__links {
  @include mix.flex-start;
  gap: var(--spacing-lg);
}

.chonglou-layout__link {
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
    background: linear-gradient(
      135deg,
      var(--primary-color),
      var(--secondary-color)
    );
    color: white;

    &:hover {
      color: white;
      background: linear-gradient(
        135deg,
        var(--primary-dark),
        var(--secondary-color)
      );
    }
  }
}

// 响应式设计
@include mix.mobile {
  .chonglou-layout__nav {
    padding: 0 var(--spacing-md);
  }

  .chonglou-layout__links {
    gap: var(--spacing-sm);
  }

  .chonglou-layout__link {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}
</style>
