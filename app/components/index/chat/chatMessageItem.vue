<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {useChatStore} from "~/stores/chatStore"
import type MessageType from "~/types/message.type"
import {useUiStore} from "~/stores/ui"

const {setReplayMessage} = useChatStore()
const {activeChatId} = useUiStore()

const props = defineProps<{
  message?: MessageType
  isOwn: boolean
  loading?: boolean
}>()

const emit = defineEmits(['visible', 'jump-to-parent'])
const target = ref(null)
const loadedMedia = ref<Record<string, boolean>>({})

const isRead = computed(() => {
  return !!(props.message?.read_at || (props.message?.message_reads && props.message.message_reads.length > 0))
})

const onImageLoad = (id: string) => {
  loadedMedia.value[id] = true
}

const getFileType = (mime: string) => {
  if (mime?.startsWith('image/')) return 'image'
  if (mime?.startsWith('video/')) return 'video'
  if (mime?.startsWith('audio/')) return 'audio'
  if (mime?.includes('pdf')) return 'pdf'
  return 'file'
}

const formatSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

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
      'max-w-[85%] md:max-w-[70%] lg:max-w-[50%] text-start p-3 rounded-md text-sm shadow-sm flex flex-col gap-2 transition-colors duration-300',
      loading ? 'animate-pulse' : '',
      isOwn ? 'ms-auto bg-primary-600 text-white ltr:rounded-tr-none rtl:rounded-tl-none' :
       'me-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ltr:rounded-tl-none rtl:rounded-tr-none border border-gray-100 dark:border-gray-700',
    ]"
  >
    <template v-if="loading">
      <div class="w-full space-y-3">
        <div class="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div class="space-y-2">
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
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

      <div
          v-if="message.media && message.media.length > 0"
          :class="[
          'grid gap-1 mb-1 rounded-lg overflow-hidden w-full',
          message.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        ]"
      >
        <div
            v-for="file in message.media"
            :key="file.uuid"
            class="relative group overflow-hidden bg-black/5 dark:bg-black/20 rounded-lg min-w-0"
        >
          <template v-if="getFileType(file.mime_type) === 'image'">
            <div
                v-if="!loadedMedia[file.uuid]"
                class="absolute inset-0 z-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse"
            >
              <Icon name="lucide:image" class="size-6 opacity-20"/>
            </div>
            <NuxtPicture
                format="avif,webp"
                :imgAttrs="{
                loading: 'lazy',
                class: [
                  'w-full h-full min-h-[150px] max-h-[400px] object-cover transition-opacity duration-300 group-hover:scale-105 transition-transform duration-500',
                  !loadedMedia[file.uuid] ? 'opacity-0' : 'opacity-100'
                ],
                onLoad: () => onImageLoad(file.uuid)
              }"
                :src="file.url"
                :alt="file.title"
            />
          </template>

          <template v-else-if="getFileType(file.mime_type) === 'video'">
            <video
                controls
                preload="none"
                :poster="file.thumbnail_url"
                class="w-full max-h-[300px]  aspect-video bg-black block"
            >
              <source :src="file.url" :type="file.mime_type">
            </video>
          </template>

          <template v-else-if="getFileType(file.mime_type) === 'audio'">
            <div class="p-3 w-full flex flex-col gap-2">
              <div class="flex items-center gap-2 overflow-hidden">
                <Icon name="lucide:headphones" class="size-4 shrink-0 opacity-70"/>
                <span class="text-[10px] truncate opacity-80 font-medium">{{ file.title }}</span>
              </div>
              <audio controls preload="none" class="w-full h-8 scale-95 origin-left">
                <source :src="file.url" :type="file.mime_type">
              </audio>
            </div>
          </template>

          <template v-else>
            <a
                :href="`${file.url}&download=1`"
                target="_blank"
                class="p-4 flex items-center gap-3 hover:bg-black/5 transition-colors h-full"
            >
              <div :class="['p-2 rounded', isOwn ? 'bg-white/20' : 'bg-primary-500/10']">
                <Icon
                    :name="getFileType(file.mime_type) === 'pdf' ? 'lucide:file-text' : 'lucide:file'"
                    :class="['size-8', isOwn ? 'text-white' : 'text-primary-600']"
                />
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-xs font-medium truncate">{{ file.title }}</span>
                <span class="text-[10px] opacity-60">{{ formatSize(file.size) }}</span>
              </div>
              <Icon name="lucide:download" class="size-4 opacity-40 shrink-0"/>
            </a>
          </template>
        </div>
      </div>

      <span v-if="message.body" class="whitespace-pre-wrap leading-relaxed">{{ message.body }}</span>

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