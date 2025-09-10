<template>
  <div class="article-detail">
    <el-button 
      type="primary" 
      plain 
      @click="$router.go(-1)"
      style="margin-bottom: 20px"
    >
      返回
    </el-button>
    
    <div v-if="article" class="article-content">
      <h1 class="article-title">{{ article.title }}</h1>
      
      <div class="article-meta">
        <div class="meta-item">
          <span class="label">作者：</span>
          <el-tag>{{ article.author }}</el-tag>
        </div>
        <div class="meta-item">
          <span class="label">发布日期：</span>
          <span>{{ article.publishDate }}</span>
        </div>
        <div class="meta-item">
          <span class="label">标签：</span>
          <el-tag 
            v-for="tag in article.tags" 
            :key="tag" 
            type="info" 
            size="small"
            style="margin-right: 5px"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      
      <el-divider />
      
      <div class="article-body">
        <p class="article-summary">{{ article.summary }}</p>
        <div class="article-text">
          {{ article.content }}
        </div>
      </div>
    </div>
    
    <el-empty v-else description="文章不存在" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'

const route = useRoute()
const articleStore = useArticleStore()

const article = computed(() => {
  const id = Number(route.params.id)
  return articleStore.getArticleById(id)
})

onMounted(() => {
  // 确保文章数据已加载
  if (articleStore.articles.length === 0) {
    articleStore.getArticles()
  }
})
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.article-meta {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.meta-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
}

.article-body {
  text-align: left;
}

.article-summary {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  padding: 15px;
  background-color: #f0f9ff;
  border-left: 4px solid #409eff;
  margin-bottom: 20px;
}

.article-text {
  line-height: 1.8;
  font-size: 15px;
  color: #333;
  white-space: pre-wrap;
}
</style>
