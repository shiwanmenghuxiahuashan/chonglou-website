import { createRouter, createWebHistory } from 'vue-router'
import ArticleView from '@/views/ArticleView.vue'
import MainLayoutView from '@/views/MainLayoutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: MainLayoutView,
      redirect: { name: 'article' },
      children: [
        {
          path: 'article',
          name: 'article',
          component: ArticleView,
          meta: {
            title: '文章列表'
          }
        },
        {
          path: 'article/:id',
          name: 'article-detail',
          component: () => import('@/views/ArticleDetailView.vue'),
          meta: {
            title: '文章详情'
          }
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
          meta: {
            title: '关于我们'
          }
        }
      ]
    },

    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
      meta: {
        title: '编辑器'
      }
    }
  ]
})

export default router
