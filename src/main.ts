import './styles/global.scss'
import './styles/element-override.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { useSettingsStore } from './stores/settings'
import httpPlugin from './lib/vue/httpPlugin'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(httpPlugin)

// 初始化设置
const settingsStore = useSettingsStore()
settingsStore.initSettings()

app.mount('#app')
