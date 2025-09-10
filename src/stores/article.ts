import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Article, 
  ArticleDetail, 
  ArticleQueryParams, 
  PaginatedResponse,
  Category,
  Tag 
} from '@/types/article'
import { 
  getArticles, 
  getArticleDetail, 
  getPopularArticles, 
  getFeaturedArticles,
  searchArticles 
} from '@/services/article.service'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref<Article[]>([])
  const currentArticle = ref<ArticleDetail | null>(null)
  const popularArticles = ref<Article[]>([])
  const featuredArticles = ref<Article[]>([])
  const searchResults = ref<Article[]>([])
  
  // 分页信息
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  
  // 查询参数
  const queryParams = ref<ArticleQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  })
  
  // 加载状态
  const loading = ref(false)
  const detailLoading = ref(false)
  const popularLoading = ref(false)
  const featuredLoading = ref(false)
  const searchLoading = ref(false)
  
  // 错误状态
  const error = ref<string | null>(null)
  const detailError = ref<string | null>(null)

  // 计算属性
  const hasArticles = computed(() => articles.value.length > 0)
  const hasMore = computed(() => pagination.value.page < pagination.value.totalPages)
  const categories = computed(() => {
    const categoryMap = new Map<string, number>()
    articles.value.forEach(article => {
      const count = categoryMap.get(article.category) || 0
      categoryMap.set(article.category, count + 1)
    })
    
    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name,
      name,
      count
    })) as Category[]
  })
  
  const tags = computed(() => {
    const tagMap = new Map<string, number>()
    articles.value.forEach(article => {
      article.tags.forEach(tag => {
        const count = tagMap.get(tag) || 0
        tagMap.set(tag, count + 1)
      })
    })
    
    return Array.from(tagMap.entries()).map(([name, count]) => ({
      name,
      count
    })) as Tag[]
  })

  // 动作
  const fetchArticles = async (params?: Partial<ArticleQueryParams>, append = false) => {
    loading.value = true
    error.value = null
    
    try {
      const finalParams = { ...queryParams.value, ...params }
      const response: PaginatedResponse<Article> = await getArticles(finalParams)
      
      if (append) {
        articles.value.push(...response.data)
      } else {
        articles.value = response.data
      }
      
      pagination.value = response.pagination
      queryParams.value = finalParams
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文章列表失败'
      console.error('Error fetching articles:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchArticleById = async (id: number) => {
    detailLoading.value = true
    detailError.value = null
    
    try {
      const article = await getArticleDetail(id)
      currentArticle.value = article
    } catch (err) {
      detailError.value = err instanceof Error ? err.message : '获取文章详情失败'
      console.error('Error fetching article:', err)
    } finally {
      detailLoading.value = false
    }
  }

  const fetchPopularArticles = async (limit = 5) => {
    popularLoading.value = true
    
    try {
      popularArticles.value = await getPopularArticles(limit)
    } catch (err) {
      console.error('Error fetching popular articles:', err)
    } finally {
      popularLoading.value = false
    }
  }

  const fetchFeaturedArticles = async (limit = 3) => {
    featuredLoading.value = true
    
    try {
      featuredArticles.value = await getFeaturedArticles(limit)
    } catch (err) {
      console.error('Error fetching featured articles:', err)
    } finally {
      featuredLoading.value = false
    }
  }

  const searchArticlesAction = async (keyword: string, params?: Partial<ArticleQueryParams>) => {
    searchLoading.value = true
    
    try {
      const response = await searchArticles(keyword, params)
      searchResults.value = response.data
      return response
    } catch (err) {
      console.error('Error searching articles:', err)
      throw err
    } finally {
      searchLoading.value = false
    }
  }

  const loadMoreArticles = async () => {
    if (!hasMore.value || loading.value) return
    
    const nextPage = pagination.value.page + 1
    await fetchArticles({ ...queryParams.value, page: nextPage }, true)
  }

  const refreshArticles = async () => {
    await fetchArticles({ ...queryParams.value, page: 1 })
  }

  const updateQueryParams = (params: Partial<ArticleQueryParams>) => {
    queryParams.value = { ...queryParams.value, ...params }
  }

  const clearCurrentArticle = () => {
    currentArticle.value = null
    detailError.value = null
  }

  const clearSearch = () => {
    searchResults.value = []
  }

  const clearError = () => {
    error.value = null
    detailError.value = null
  }

  return {
    // 状态
    articles,
    currentArticle,
    popularArticles,
    featuredArticles,
    searchResults,
    pagination,
    queryParams,
    
    // 加载状态
    loading,
    detailLoading,
    popularLoading,
    featuredLoading,
    searchLoading,
    
    // 错误状态
    error,
    detailError,
    
    // 计算属性
    hasArticles,
    hasMore,
    categories,
    tags,
    
    // 动作
    fetchArticles,
    fetchArticleById,
    fetchPopularArticles,
    fetchFeaturedArticles,
    searchArticlesAction,
    loadMoreArticles,
    refreshArticles,
    updateQueryParams,
    clearCurrentArticle,
    clearSearch,
    clearError
  }
})
