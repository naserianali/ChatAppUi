<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {useChatStore} from "~/stores/chatStore";
import type MessageType from "~/types/message.type";
import {useUiStore} from "~/stores/ui";

const {setReplayMessage} = useChatStore()
const {activeChatId} = useUiStore();

const props = defineProps<{
  message?: MessageType
  isOwn: boolean
  loading?: boolean
}>()

const emit = defineEmits(['visible', 'jump-to-parent'])
const target = ref(null)

const isRead = computed(() => {
  return !!(props.message?.read_at || (props.message?.message_reads && props.message.message_reads.length > 0))
})

useIntersectionObserver(
    target,
    ([{isIntersecting}]) => {
      if (!props.loading && isIntersecting && !props.isOwn && !isRead.value && props.message) {
        emit('visible', props.message.id)
      }
    },
    {threshold: 0.2}
)

const handleReplay = (message: any) => {
  if (props.loading || !message || !activeChatId) return
  setReplayMessage(activeChatId, message)
}
</script>

<template>
  <div
      @dblclick="handleReplay(message)"
      ref="target"
      :class="[
      'max-w-[85%] md:max-w-[50%] text-start p-3 rounded-md text-sm shadow-sm flex flex-col gap-2 transition-colors duration-300',
      loading ? 'animate-pulse' : '',
      isOwn ? 'ms-auto bg-primary-600 text-white ltr:rounded-tr-none rtl:rounded-tl-none' :
       'me-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ltr:rounded-tl-none rtl:rounded-tr-none border border-gray-100 dark:border-gray-700',
       loading && isOwn ? 'bg-primary-400' : '',
       loading && !isOwn ? 'bg-gray-200 dark:bg-gray-700' : ''
    ]"
  >
    <template v-if="loading">
      <div v-if="Math.random() > 0.8" class="p-2 mb-1 rounded-lg border-s-4 bg-black/5 dark:bg-white/5 h-10 w-full"></div>
      <div class="space-y-2">
        <div class="h-3 bg-current opacity-20 rounded w-full"></div>
        <div class="h-3 bg-current opacity-20 rounded w-2/3"></div>
      </div>
      <div :class="['flex items-center gap-1 mt-1 opacity-20', isOwn ? 'justify-end' : 'justify-start']">
        <div class="h-2 w-8 bg-current rounded"></div>
        <div v-if="isOwn" class="size-3 bg-current rounded-full"></div>
      </div>
    </template>

    <template v-else-if="message">
      <div
          v-if="message.parent"
          @click="emit('jump-to-parent', message.parent.id)"
          :class="[
          'p-2 mb-1 text-xs border-s-4 flex flex-col gap-1 cursor-pointer hover:opacity-80 transition-opacity',
          isOwn ? 'bg-primary-700/50 border-primary-300 text-primary-50' : 'bg-gray-100 dark:bg-gray-900 border-gray-400 text-gray-500'
        ]"
      >
        <span class="font-bold opacity-80">Reply to:</span>
        <span class="truncate line-clamp-2 leading-relaxed">{{ message.parent.body }}</span>
      </div>

      <span class="whitespace-pre-wrap leading-relaxed">{{ message.body }}</span>

      <div :class="['text-[10px] mt-1 flex items-center gap-1 opacity-70', isOwn ? 'justify-end' : 'justify-start']">
        {{ new Date(message.created_at).toLocaleTimeString('fa-IR', {hour: '2-digit', minute: '2-digit'}) }}

        <template v-if="isOwn">
          <Icon
              :name="isRead ? 'lucide:check-check' : 'lucide:check'"
              :class="['size-3 transition-all duration-300', isRead ? 'text-blue-300' : 'text-gray-300']"
          />
        </template>
      </div>
    </template>
  </div>
</template>