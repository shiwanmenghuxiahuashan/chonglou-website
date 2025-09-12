<script setup>
import { defineEmits, defineProps } from 'vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  navItems: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close'])

const closeMenu = () => {
  emit('close')
}
</script>

<template>
  <!-- 移动端全屏菜单 -->
  <transition name="mobile-menu">
    <div
      v-if="isOpen"
      class="chonglou-global__header-mobile-menu"
      @click="closeMenu"
    >
      <div class="chonglou-global__header-mobile-menu-content">
        <!-- 移动端导航 -->
        <nav class="chonglou-global__header-mobile-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :target="item.label === 'editor' ? '_blank' : '_self'"
            class="chonglou-global__header-mobile-nav-item"
            @click="closeMenu"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
@use './style.scss';
</style>
