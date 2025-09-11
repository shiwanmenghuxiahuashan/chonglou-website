<script setup lang="ts">
// import { onMounted } from 'vue'

const articleStore = null
// const articleStore = useArticleStore()

// onMounted(() => {
//   articleStore.fetchArticles()
// })
</script>

<template>
  <div class="chonglou-home">
    <div class="chonglou-home__hero">
      <h1 class="chonglou-home__hero-title">重楼网站</h1>
      <p class="chonglou-home__hero-subtitle">探索重楼的药用价值与种植技术</p>
      <el-button type="primary" size="large" @click="$router.push('/articles')">
        浏览文章
      </el-button>
    </div>

    <div v-if="articleStore" class="chonglou-home__articles">
      <h2 class="chonglou-home__articles-title">最新文章</h2>
      <div
        v-loading="articleStore.loading"
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        class="chonglou-home__articles-grid"
      >
        <el-card
          v-for="article in articleStore.articles.slice(0, 3)"
          :key="article.id"
          class="chonglou-home__article-card"
          shadow="hover"
        >
          <h3 class="chonglou-home__article-title">{{ article.title }}</h3>
          <p class="chonglou-home__article-summary">{{ article.summary }}</p>
          <div class="chonglou-home__article-meta">
            <el-tag size="small">{{ article.author }}</el-tag>
            <span class="chonglou-home__article-date">{{
              article.publishDate
            }}</span>
          </div>
          <el-button
            type="text"
            @click="$router.push(`/articles/${article.id}`)"
          >
            阅读更多 →
          </el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-home {
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.chonglou-home__hero {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  padding: var(--spacing-3xl) 0;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  color: white;
  border-radius: var(--border-radius-lg);
}

.chonglou-home__hero-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);

  @include mix.mobile {
    font-size: var(--font-size-4xl);
  }
}

.chonglou-home__hero-subtitle {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;

  @include mix.mobile {
    font-size: var(--font-size-lg);
  }
}

.chonglou-home__articles {
  max-width: 1200px;
  margin: 0 auto;
}

.chonglou-home__articles-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-3xl);
  color: var(--text-primary);

  @include mix.mobile {
    font-size: var(--font-size-2xl);
  }
}

.chonglou-home__articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.chonglou-home__article-card {
  cursor: pointer;
  transition: transform var(--transition-normal);

  &:hover {
    transform: translateY(-4px);
  }
}

.chonglou-home__article-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.chonglou-home__article-summary {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-md);
}

.chonglou-home__article-meta {
  @include mix.flex-between;
  margin-bottom: var(--spacing-md);
}

.chonglou-home__article-date {
  color: var(--text-placeholder);
  font-size: var(--font-size-xs);
}
</style>
