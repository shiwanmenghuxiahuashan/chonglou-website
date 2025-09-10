<template>
  <div class="articles-view">
    <h1>文章列表</h1>
    
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
      class="articles-grid"
    >
      <el-card 
        v-for="article in articleStore.articles" 
        :key="article.id" 
        class="article-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <span class="article-title">{{ article.title }}</span>
          </div>
        </template>
        
        <div class="article-content">
          <p class="article-summary">{{ article.summary }}</p>
          <div class="article-meta">
            <el-tag size="small">{{ article.author }}</el-tag>
            <span class="publish-date">{{ article.publishDate }}</span>
          </div>
          <div class="article-tags">
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

<style scoped>
.articles-view {
  padding: 20px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.article-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-title {
  font-weight: bold;
  font-size: 16px;
}

.article-content {
  text-align: left;
}

.article-summary {
  margin-bottom: 15px;
  color: #666;
  line-height: 1.5;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.publish-date {
  color: #999;
  font-size: 12px;
}

.article-tags {
  margin-bottom: 15px;
}

.article-tags .el-tag {
  margin-right: 5px;
}
</style>
