<template>
  <div class="chonglou-articles">
    <h1 class="chonglou-articles__title">文章列表</h1>
    
    <el-alert 
      v-if="articleStore.error" 
      :title="articleStore.error" 
      type="error" 
      show-icon 
    />
    
    <div 
      v-loading="articleStore.loading"
      element-loading-text="加载中..."
      element-loading-spinner="el-icon-loading"
      class="chonglou-articles__grid"
    >
      <el-card 
        v-for="article in articleStore.articles" 
        :key="article.id" 
        class="chonglou-articles__card"
        shadow="hover"
      >
        <template #header>
          <div class="chonglou-articles__card-header">
            <span class="chonglou-articles__card-title">{{ article.title }}</span>
          </div>
        </template>
        
        <div class="chonglou-articles__card-content">
          <p class="chonglou-articles__card-summary">{{ article.summary }}</p>
          <div class="chonglou-articles__card-meta">
            <el-tag size="small">{{ article.author }}</el-tag>
            <span class="chonglou-articles__card-date">{{ article.publishDate }}</span>
          </div>
          <div class="chonglou-articles__card-tags">
            <el-tag 
              v-for="tag in article.tags" 
              :key="tag" 
              size="small" 
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
          <el-button 
            type="primary" 
            size="small" 
            @click="$router.push(`/articles/${article.id}`)"
          >
            阅读全文
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'

const articleStore = useArticleStore()

onMounted(() => {
  articleStore.fetchArticles()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-articles {
  padding: var(--spacing-lg);
}

.chonglou-articles__title {
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.chonglou-articles__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.chonglou-articles__card {
  cursor: pointer;
  transition: transform var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
  }
}

.chonglou-articles__card-header {
  @include mix.flex-between;
}

.chonglou-articles__card-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.chonglou-articles__card-content {
  text-align: left;
}

.chonglou-articles__card-summary {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.chonglou-articles__card-meta {
  @include mix.flex-between;
  margin-bottom: var(--spacing-sm);
}

.chonglou-articles__card-date {
  color: var(--text-placeholder);
  font-size: var(--font-size-xs);
}

.chonglou-articles__card-tags {
  margin-bottom: var(--spacing-md);
  
  .el-tag {
    margin-right: var(--spacing-xs);
  }
}
</style>
