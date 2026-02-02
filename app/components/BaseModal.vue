<script setup lang="ts">
interface Props {
  show: boolean
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
          v-if="show"
          class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="emit('close')"
      >
        <Transition name="scale">
          <div
              v-if="show"
              class="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
              <button
                  @click="emit('close')"
                  class="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="lucide:x" class="size-5" />
              </button>
            </div>

            <div class="p-6">
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

.scale-enter-active, .scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>