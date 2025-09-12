<script setup lang="ts">
import { computed, defineProps } from 'vue'

defineProps({
  footerSections: {
    type: Object,
    required: true
  }
})

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="chonglou-global__footer">
    <div class="chonglou-global__footer-content">
      <!-- 主要内容区域 -->
      <div class="chonglou-global__footer-main">
        <div class="chonglou-global__footer-sections">
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
