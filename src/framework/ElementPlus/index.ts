import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/element-override.scss'
import '@/styles/element-dark-override.scss'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const ElementPlusLib = {
  use: app => {
    app.use(ElementPlus, { size: 'small', zIndex: 3000 })
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
}

export { ElementPlusLib }
