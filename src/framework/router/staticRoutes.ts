import WelcomeView from '@/static-views/WelcomeView.vue'
import MainLayoutView from '@/static-views/MainLayoutView.vue'

const staticRoutes = [
  {
    path: '/',
    name: 'root',
    component: MainLayoutView,
    redirect: { name: 'welcome' },
    children: [
      {
        path: 'welcome',
        name: 'welcome',
        component: WelcomeView,
        meta: {
          title: '欢迎'
        }
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
        meta: {
          title: '关于我'
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
  },
  {
    path: '/demo',
    name: 'demo',
    component: () => import('@/views/DemoView.vue'),
    meta: {
      title: '演示'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/static-views/NotFoundView.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

export { staticRoutes }
