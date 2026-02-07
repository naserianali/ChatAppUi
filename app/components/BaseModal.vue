<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

// Handle ESC key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    emit('close')
  }
}

// Prevent body scroll when modal is open
watch(() => props.show, (newVal) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = newVal ? 'hidden' : ''
  }
}, { immediate: true })

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // Clean up scroll lock when component is destroyed
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
          v-if="show"
          class="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          @click.self="emit('close')"
      >
        <Transition name="slide-up">
          <div
              v-if="show"
              class="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 class="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                {{ title }}
              </h3>
              <button
                  @click="emit('close')"
                  class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <Icon name="lucide:x" class="size-5" />
              </button>
            </div>

            <div class="p-6 max-h-[80vh] overflow-y-auto text-neutral-600 dark:text-neutral-300">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .slide-up-enter-from, .slide-up-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}
</style>