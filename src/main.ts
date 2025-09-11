import 'element-plus/dist/index.css'

import './styles/element-override.scss'
import './styles/global.scss'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './framework/router'
import { useSettingsStore } from './framework/stores/settings'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化设置
const settingsStore = useSettingsStore()
settingsStore.initSettings()

app.mount('#app')
