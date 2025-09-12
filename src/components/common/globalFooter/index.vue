<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'

defineProps({
  footerSections: {
    type: Object,
    required: true
  }
})

const currentYear = computed(() => new Date().getFullYear())

// 移动端折叠状态
const expandedSections = ref(new Set())

const toggleSection = sectionTitle => {
  if (expandedSections.value.has(sectionTitle)) {
    expandedSections.value.delete(sectionTitle)
  } else {
    expandedSections.value.add(sectionTitle)
  }
}
</script>

<template>
  <footer class="chonglou-global__footer">
    <!-- 视频背景 -->
    <video
      class="chonglou-global__footer-video"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      src="/public/video/footer-wave.mp4"
    />

    <div class="chonglou-global__footer-content">
      <!-- 主要内容区域 -->
      <div class="chonglou-global__footer-main">
        <!-- 桌面端网格布局 -->
        <div
          class="chonglou-global__footer-sections chonglou-global__footer-sections--desktop"
        >
          <div
            v-for="section in footerSections"
            :key="section.title"
            class="chonglou-global__footer-section"
          >
            <h3 class="chonglou-global__footer-section-title">
              {{ section.title }}
            </h3>
            <ul class="chonglou-global__footer-links">
              <li
                v-for="link in section.links"
                :key="link.label"
                class="chonglou-global__footer-link-item"
              >
                <a
                  :href="link.href"
                  :target="link.external ? '_blank' : '_self'"
                  :rel="link.external ? 'noopener noreferrer' : undefined"
                  class="chonglou-global__footer-link"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- 移动端折叠列表 -->
        <div class="chonglou-global__footer-mobile-menu">
          <div class="chonglou-global__footer-mobile-menu-content">
            <div
              v-for="section in footerSections"
              :key="section.title"
              class="chonglou-global__footer-mobile-section"
            >
              <button
                class="chonglou-global__footer-mobile-section-header"
                @click="toggleSection(section.title)"
              >
                <h4 class="chonglou-global__footer-mobile-section-title">
                  {{ section.title }}
                </h4>
                <span class="chonglou-global__footer-mobile-section-icon">
                  {{ expandedSections.has(section.title) ? '▲' : '▼' }}
                </span>
              </button>
              <transition name="footer-section">
                <ul
                  v-if="expandedSections.has(section.title)"
                  class="chonglou-global__footer-mobile-links"
                >
                  <li
                    v-for="link in section.links"
                    :key="link.label"
                    class="chonglou-global__footer-mobile-link-item"
                  >
                    <a
                      :href="link.href"
                      :target="link.external ? '_blank' : '_self'"
                      :rel="link.external ? 'noopener noreferrer' : undefined"
                      class="chonglou-global__footer-mobile-link"
                    >
                      {{ link.label }}
                    </a>
                  </li>
                </ul>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部信息区域 -->
      <div class="chonglou-global__footer-bottom">
        <div class="chonglou-global__footer-copyright">
          <p class="chonglou-global__footer-copyright-text">
            © {{ currentYear }} LiChonglou Website.
          </p>
        </div>

        <div class="chonglou-global__footer-legal">
          <a href="/privacy" class="chonglou-global__footer-legal-link">
            隐私政策
          </a>
          <a href="/terms" class="chonglou-global__footer-legal-link">
            使用条款
          </a>
          <a href="/sitemap" class="chonglou-global__footer-legal-link">
            网站地图
          </a>
        </div>

        <!-- 备案信息 -->
        <div class="chonglou-global__footer-icp">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            class="chonglou-global__footer-icp-link"
          >
            冀ICP备17010044号-2
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss">
@use './globalFooter.scss';
</style>
