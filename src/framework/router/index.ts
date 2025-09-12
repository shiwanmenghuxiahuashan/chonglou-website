import { createRouter, createWebHistory } from 'vue-router'
import { devRoutes } from './devRoutes'
import { staticRoutes } from './staticRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes:
    import.meta.env.VITE_RENDER_TARGET === 'static' ? staticRoutes : devRoutes
})

export default router
