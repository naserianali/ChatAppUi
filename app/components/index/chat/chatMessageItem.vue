<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const props = defineProps<{
  message: any
  isOwn: boolean
}>()

const emit = defineEmits(['visible', 'jump-to-parent'])
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
</script>

<template>
  <div
      ref="target"
      :class="[
      'max-w-[85%] md:max-w-[50%] p-3 rounded-2xl text-sm shadow-sm flex flex-col gap-2',
      isOwn ? 'ms-auto bg-primary-600 text-white ltr:rounded-tr-none rtl:rounded-tl-none' :
       'me-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ltr:rounded-tl-none rtl:rounded-tr-none border border-gray-100 dark:border-gray-700'
    ]"
  >
    <div
        v-if="message.parent"
        @click="emit('jump-to-parent', message.parent.id)"
        :class="[
        'p-2 mb-1 rounded-lg text-xs border-s-4 flex flex-col gap-1 cursor-pointer hover:opacity-80 transition-opacity',
        isOwn
          ? 'bg-primary-700/50 border-primary-300 text-primary-50'
          : 'bg-gray-100 dark:bg-gray-900 border-gray-400 text-gray-500'
      ]"
    >
      <span class="font-bold opacity-80">Reply to:</span>
      <span class="truncate line-clamp-2 leading-relaxed">
        {{ message.parent.body }}
      </span>
    </div>

    <span class="whitespace-pre-wrap leading-relaxed">{{ message.body }}</span>

    <div :class="['text-[10px] mt-1 flex items-center gap-1 opacity-70', isOwn ? 'justify-end' : 'justify-start']">
      {{ new Date(message.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) }}

      <template v-if="isOwn">
        <Icon
            :name="isRead ? 'lucide:check-check' : 'lucide:check'"
            :class="['size-3', isRead ? 'text-blue-300' : 'text-gray-300']"
        />
      </template>
    </div>
  </div>
</template>