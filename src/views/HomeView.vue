<script setup lang="ts">
import { onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'

const articleStore = useArticleStore()

onMounted(() => {
  articleStore.getArticles()
})
</script>

<template>
  <div class="home">
    <div class="hero-section">
      <h1 class="hero-title">重楼网站</h1>
      <p class="hero-subtitle">探索重楼的药用价值与种植技术</p>
      <el-button type="primary" size="large" @click="$router.push('/articles')">
        浏览文章
      </el-button>
    </div>
    
    <div class="latest-articles">
      <h2>最新文章</h2>
      <div 
        v-loading="articleStore.loading" 
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
        class="articles-preview"
      >
        <el-card 
          v-for="article in articleStore.articles.slice(0, 3)" 
          :key="article.id"
          class="article-preview-card"
          shadow="hover"
        >
          <h3>{{ article.title }}</h3>
          <p class="preview-summary">{{ article.summary }}</p>
          <div class="preview-meta">
            <el-tag size="small">{{ article.author }}</el-tag>
            <span class="preview-date">{{ article.publishDate }}</span>
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

<style scoped>
.home {
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 60px;
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.latest-articles {
  max-width: 1200px;
  margin: 0 auto;
}

.latest-articles h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
  color: #333;
}

.articles-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.article-preview-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.article-preview-card:hover {
  transform: translateY(-4px);
}

.article-preview-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.preview-summary {
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.preview-date {
  color: #999;
  font-size: 12px;
}
</style>
