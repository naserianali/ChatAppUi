<script setup lang="ts">
import {useUiStore} from '~/stores/ui'
import {useChatStore} from "~/stores/chatStore"
import {getBaseUrl, RouteEnum} from "~/utils/api"
import {useFileUploader} from "~/composables/useFileUploader"

const uiStore = useUiStore()
const chatStore = useChatStore()
const token = useCookie('token').value
const {upload, isUploading, progress, mediaId, currentChunkIndex} = useFileUploader()

const message = ref('')
const isLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const currentFileIndex = ref(0)
const failedIndex = ref<number | null>(null)
const emit = defineEmits(['messageSent'])

const replyTo = computed(() => chatStore.getReplyForConversation(uiStore.activeChatId))

const clearReply = () => {
  chatStore.setReplayMessage(uiStore.activeChatId, null)
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value.push(...Array.from(target.files))
  }
  target.value = ''
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  if (failedIndex.value === index) failedIndex.value = null
}

const handleSendMessage = async () => {
  if ((!message.value.trim() && selectedFiles.value.length === 0) || !uiStore.activeChatId || isLoading.value) return
  isLoading.value = true
  failedIndex.value = null

  try {
    let uploadedMediaIds: string[] = []
    const uploadUrl = getBaseUrl(1, RouteEnum.UploadMedia)

    for (let i = 0; i < selectedFiles.value.length; i++) {
      currentFileIndex.value = i
      const result = await upload(selectedFiles.value[i], uploadUrl, {}, 0)

      if (result && mediaId.value) {
        uploadedMediaIds.push(mediaId.value)
      } else {
        failedIndex.value = i
        throw new Error("Upload failed")
      }
    }

    const url = getBaseUrl(1, RouteEnum.SendMessage, {
      conversationId: uiStore.activeChatId
    })

    await $fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json'
      },
      body: {
        message: message.value.trim() || undefined,
        parent_id: replyTo.value?.id,
        media_ids: uploadedMediaIds
      }
    })

    message.value = ''
    selectedFiles.value = []
    clearReply()
    emit('messageSent')
  } catch (error) {
    console.error("Failed to send message:", error)
  } finally {
    isLoading.value = false
  }
}

const retryUpload = async () => {
  if (failedIndex.value === null) return
  isLoading.value = true
  const uploadUrl = getBaseUrl(1, RouteEnum.UploadMedia)

  const result = await upload(
      selectedFiles.value[failedIndex.value],
      uploadUrl,
      {},
      currentChunkIndex.value
  )

  if (result) {
    failedIndex.value = null
    handleSendMessage()
  } else {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">

    <Teleport to="#reply-teleport-target">
      <Transition name="slide-up">
        <div v-if="replyTo"
             class="px-4 py-2 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
          <div class="flex flex-col border-s-4 border-primary-500 px-3 overflow-hidden">
            <span class="text-[10px] font-bold text-primary-600 uppercase">Replying to {{ replyTo.sender?.name }}</span>
            <span class="text-xs text-gray-500 truncate line-clamp-1 italic">{{ replyTo.body }}</span>
          </div>
          <button @click="clearReply" type="button" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Icon name="lucide:x" class="size-4 text-gray-400"/>
          </button>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="#reply-teleport-target">
      <div v-if="selectedFiles.length > 0" class="mb-2 space-y-2">
        <div v-for="(file, index) in selectedFiles" :key="index"
             class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border"
             :class="failedIndex === index ? 'border-red-500' : 'dark:border-gray-700'">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 overflow-hidden">
              <Icon
                  :name="failedIndex === index ? 'lucide:refresh-cw' : (isUploading && currentFileIndex === index ? 'lucide:loader-2' : 'lucide:file-check')"
                  class="size-4"
                  :class="[
                      failedIndex === index ? 'text-red-500 cursor-pointer' : 'text-primary-500',
                      (isUploading && currentFileIndex === index) ? 'animate-spin' : ''
                  ]"
                  @click="failedIndex === index ? retryUpload() : null"
              />
              <span class="text-xs truncate dark:text-gray-300 max-w-[200px]">{{ file.name }}</span>
              <span v-if="failedIndex === index" class="text-[10px] text-red-500 font-bold">Failed ({{
                  progress
                }}%)</span>
              <span v-else-if="isUploading && currentFileIndex === index"
                    class="text-[10px] font-bold text-primary-500">{{ progress }}%</span>
              <span v-else-if="index < currentFileIndex || (index === currentFileIndex && !isUploading)"
                    class="text-[10px] text-green-500 font-bold">Done</span>
            </div>
            <button v-if="!isUploading" @click="removeFile(index)"
                    class="text-gray-400 hover:text-red-500 transition-colors">
              <Icon name="lucide:x-circle" class="size-4"/>
            </button>
          </div>
          <div v-if="isUploading && currentFileIndex === index"
               class="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-2 overflow-hidden">
            <div class="bg-primary-500 h-full w-0 transition-all duration-300" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
      </div>
    </Teleport>

    <form @submit.prevent="handleSendMessage" class="flex items-center gap-x-2">
      <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileChange"/>
      <button type="button" @click="triggerFileSelect" :disabled="isLoading || isUploading"
              class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0">
        <Icon name="lucide:paperclip" class="size-5"/>
      </button>
      <div class="flex-1 min-w-0">
        <BaseInput v-model="message" label-key="Type a message..." icon-name="lucide:message-square"
                   placeholder="Write something..." size="sm" mode="no-label"
                   :disabled="!uiStore.activeChatId || isLoading || isUploading"/>
      </div>
      <div class="flex-none">
        <CustomButton type="submit" label-key="Send" icon-name="lucide:send" variant="primary" size="sm"
                      :loading="isLoading"
                      :disabled="(!message.trim() && selectedFiles.length === 0) || !uiStore.activeChatId || isUploading"/>
      </div>
    </form>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.2s ease-out;
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>