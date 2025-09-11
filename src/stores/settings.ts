import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

// 主题类型
export type Theme = 'light' | 'dark' | 'auto'

// 语言类型
export type Language = 'zh-CN' | 'en-US'

// 设置接口
export interface Settings {
  theme: Theme
  language: Language
  fontSize: number
  sidebarCollapsed: boolean
  animations: boolean
  notifications: boolean
  autoSave: boolean
}

// 默认设置
const defaultSettings: Settings = {
  theme: 'light',
  language: 'zh-CN',
  fontSize: 14,
  sidebarCollapsed: false,
  animations: true,
  notifications: true,
  autoSave: true
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const settings = ref<Settings>({ ...defaultSettings })
  const loading = ref(false)

  // 计算属性
  const isDark = computed(() => {
    if (settings.value.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return settings.value.theme === 'dark'
  })

  const currentTheme = computed(() => {
    return isDark.value ? 'dark' : 'light'
  })

  // 初始化设置
  const initSettings = () => {
    try {
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        settings.value = { ...defaultSettings, ...parsed }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      settings.value = { ...defaultSettings }
    }

    // 应用主题
    applyTheme()

    // 监听系统主题变化
    if (settings.value.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', applyTheme)
    }
  }

  // 应用主题
  const applyTheme = () => {
    const root = document.documentElement
    const theme = currentTheme.value

    root.dataset.theme = theme
    root.classList.toggle('dark', theme === 'dark')

    // 更新 meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1a1a1a' : '#409eff'
      )
    }
  }

  // 保存设置到本地存储
  const saveSettings = () => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  // 动作：切换主题
  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(settings.value.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // 动作：设置主题
  const setTheme = (theme: Theme) => {
    settings.value.theme = theme
    applyTheme()
    saveSettings()
  }

  // 动作：设置语言
  const setLanguage = (language: Language) => {
    settings.value.language = language
    document.documentElement.lang = language
    saveSettings()
  }

  // 动作：设置字体大小
  const setFontSize = (fontSize: number) => {
    settings.value.fontSize = Math.max(12, Math.min(20, fontSize))
    document.documentElement.style.setProperty(
      '--base-font-size',
      `${settings.value.fontSize}px`
    )
    saveSettings()
  }

  // 动作：切换侧边栏
  const toggleSidebar = () => {
    settings.value.sidebarCollapsed = !settings.value.sidebarCollapsed
    saveSettings()
  }

  // 动作：设置侧边栏状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    settings.value.sidebarCollapsed = collapsed
    saveSettings()
  }

  // 动作：切换动画
  const toggleAnimations = () => {
    settings.value.animations = !settings.value.animations
    document.documentElement.classList.toggle(
      'no-animations',
      !settings.value.animations
    )
    saveSettings()
  }

  // 动作：设置动画
  const setAnimations = (enabled: boolean) => {
    settings.value.animations = enabled
    document.documentElement.classList.toggle('no-animations', !enabled)
    saveSettings()
  }

  // 动作：切换通知
  const toggleNotifications = () => {
    settings.value.notifications = !settings.value.notifications
    saveSettings()
  }

  // 动作：设置通知
  const setNotifications = (enabled: boolean) => {
    settings.value.notifications = enabled
    saveSettings()
  }

  // 动作：切换自动保存
  const toggleAutoSave = () => {
    settings.value.autoSave = !settings.value.autoSave
    saveSettings()
  }

  // 动作：设置自动保存
  const setAutoSave = (enabled: boolean) => {
    settings.value.autoSave = enabled
    saveSettings()
  }

  // 动作：重置设置
  const resetSettings = () => {
    settings.value = { ...defaultSettings }
    applyTheme()
    setFontSize(defaultSettings.fontSize)
    setAnimations(defaultSettings.animations)
    saveSettings()
  }

  // 动作：更新多个设置
  const updateSettings = (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings }

    // 应用相关更改
    if ('theme' in newSettings) {
      applyTheme()
    }
    if ('fontSize' in newSettings) {
      setFontSize(newSettings.fontSize!)
    }
    if ('language' in newSettings) {
      setLanguage(newSettings.language!)
    }
    if ('animations' in newSettings) {
      setAnimations(newSettings.animations!)
    }

    saveSettings()
  }

  // 监听设置变化
  watch(settings, saveSettings, { deep: true })

  return {
    // 状态
    settings,
    loading,

    // 计算属性
    isDark,
    currentTheme,

    // 动作
    initSettings,
    toggleTheme,
    setTheme,
    setLanguage,
    setFontSize,
    toggleSidebar,
    setSidebarCollapsed,
    toggleAnimations,
    setAnimations,
    toggleNotifications,
    setNotifications,
    toggleAutoSave,
    setAutoSave,
    resetSettings,
    updateSettings
  }
})
