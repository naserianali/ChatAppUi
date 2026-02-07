<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'

const props = defineProps<{
  message: any
  isOwn: boolean
}>()

const emit = defineEmits(['visible'])
const target = ref(null)
const isRead = computed(() => {
  if (!props.message.message_reads) return false
  return props.message.message_reads.length > 0
})
if (!props.isOwn && !isRead.value) {
  const { stop } = useIntersectionObserver(
      target,
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          emit('visible', props.message.id)
          stop()
        }
      },
      { threshold: 0.5 }
  )
}
const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('fa-IR', {hour: '2-digit', minute: '2-digit'})
}
</script>

<template>
  <div
      ref="target"
      :class="[
      'max-w-[85%] md:max-w-[50%] p-3 rounded-2xl text-sm shadow-sm flex flex-col',
      isOwn ? 'ms-auto bg-blue-600 text-white rounded-tr-none' : 'me-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
    ]"
  >
    <span>{{ message.body }}</span>

    <div :class="['text-[10px] mt-1 flex items-center gap-1 opacity-80', isOwn ? 'justify-end' : 'justify-start']">
      {{ new Date(message.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) }}

      <template v-if="isOwn">
        <Icon
            :name="isRead ? 'lucide:check-check' : 'lucide:check'"
            :class="['size-3', isRead ? 'text-blue-200' : 'text-gray-300']"
        />
      </template>
    </div>
  </div>
</template>