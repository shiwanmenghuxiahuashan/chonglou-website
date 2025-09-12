import './styles/global.scss'
import { createApp } from 'vue'
import { ElementPlusLib } from './framework/ElementPlus'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './framework/router'
import { useSettingsStore } from './framework/stores/settings'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
ElementPlusLib.use(app)
// 初始化设置
const settingsStore = useSettingsStore()
settingsStore.initSettings()

app.mount('#app')
