import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('../views/ArticlesView.vue')
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('../views/ArticleDetailView.vue')
    },
    {
      path: '/demo/webworker',
      name: 'webworker-demo',
      component: () => import('../views/WebWorkerDemo.vue'),
      meta: {
        title: 'Web Worker 演示'
      }
    },
    {
      path: '/demo/data-layer',
      name: 'data-layer-demo',
      component: () => import('../views/DataLayerDemo.vue'),
      meta: {
        title: '数据层架构演示'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '关于我们'
      }
    }
  ]
})

export default router
