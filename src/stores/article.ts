import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockArticles, type Article } from '@/data/mockData'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getArticles = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 模拟 API 请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      articles.value = mockArticles
    } catch (err) {
      error.value = '获取文章列表失败'
      console.error('Error fetching articles:', err)
    } finally {
      loading.value = false
    }
  }

  const getArticleById = (id: number): Article | undefined => {
    return articles.value.find(article => article.id === id)
  }

  return {
    articles,
    loading,
    error,
    getArticles,
    getArticleById
  }
})
