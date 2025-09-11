<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'

const route = useRoute()
const articleStore = useArticleStore()

const article = computed(() => {
  const id = Number(route.params.id)
  return articleStore.articles.find(article => article.id === id)
})

onMounted(() => {
  // 确保文章数据已加载
  if (articleStore.articles.length === 0) {
    articleStore.fetchArticles()
  }
})
</script>

<template>
  <div class="chonglou-article">
    <el-button
      type="primary"
      plain
      class="chonglou-article__back-btn"
      @click="$router.go(-1)"
    >
      返回
    </el-button>

    <div v-if="article" class="chonglou-article__content">
      <h1 class="chonglou-article__title">{{ article.title }}</h1>

      <div class="chonglou-article__meta">
        <div class="chonglou-article__meta-item">
          <span class="chonglou-article__meta-label">作者：</span>
          <el-tag>{{ article.author }}</el-tag>
        </div>
        <div class="chonglou-article__meta-item">
          <span class="chonglou-article__meta-label">发布日期：</span>
          <span>{{ article.publishDate }}</span>
        </div>
        <div class="chonglou-article__meta-item">
          <span class="chonglou-article__meta-label">标签：</span>
          <el-tag
            v-for="tag in article.tags"
            :key="tag"
            type="info"
            size="small"
            class="chonglou-article__tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <div class="chonglou-article__body">
        <p class="chonglou-article__summary">{{ article.summary }}</p>
        <div class="chonglou-article__text">
          {{ article.content }}
        </div>
      </div>
    </div>

    <el-empty v-else description="文章不存在" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-article {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.chonglou-article__back-btn {
  margin-bottom: var(--spacing-lg);
}

.chonglou-article__title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);

  @include mix.mobile {
    font-size: var(--font-size-3xl);
  }
}

.chonglou-article__meta {
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
}

.chonglou-article__meta-item {
  margin-bottom: var(--spacing-sm);
  @include mix.flex-start;

  &:last-child {
    margin-bottom: 0;
  }
}

.chonglou-article__meta-label {
  font-weight: var(--font-weight-bold);
  margin-right: var(--spacing-sm);
  min-width: 80px;
  color: var(--text-primary);
}

.chonglou-article__tag {
  margin-right: var(--spacing-xs);
}

.chonglou-article__body {
  text-align: left;
}

.chonglou-article__summary {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  padding: var(--spacing-md);
  background-color: #f0f9ff;
  border-left: 4px solid var(--primary-color);
  margin-bottom: var(--spacing-lg);
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
}

.chonglou-article__text {
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  white-space: pre-wrap;
}
</style>
