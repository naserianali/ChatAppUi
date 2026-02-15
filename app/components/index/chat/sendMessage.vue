<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useChatStore } from "~/stores/chatStore"
import { getBaseUrl, RouteEnum } from "~/utils/api"
import { useFileUploader } from "~/composables/useFileUploader"

const uiStore = useUiStore()
const chatStore = useChatStore()
const token = useCookie('token').value
const { upload, isUploading, progress, mediaId, currentChunkIndex } = useFileUploader()

const message = ref('')
const isLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const currentFileIndex = ref(0)
const failedIndex = ref<number | null>(null)
const showUploadModal = ref(false)
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
  if (target.files && target.files.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)]
    showUploadModal.value = true
  }
  target.value = ''
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  if (failedIndex.value === index) failedIndex.value = null
  if (selectedFiles.value.length === 0) {
    showUploadModal.value = false
  }
}

const closeModal = () => {
  if (isUploading.value) return
  showUploadModal.value = false
  selectedFiles.value = []
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
    showUploadModal.value = false
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
        <div v-if="replyTo" class="px-4 py-2 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
          <div class="flex flex-col border-s-4 border-primary-500 px-3 overflow-hidden">
            <span class="text-[10px] font-bold text-primary-600 uppercase">Replying to {{ replyTo.sender?.name }}</span>
            <span class="text-xs text-gray-500 truncate line-clamp-1 italic">{{ replyTo.body }}</span>
          </div>
          <button @click="clearReply" type="button" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Icon name="lucide:x" class="size-4 text-gray-400" />
          </button>
        </div>
      </Transition>
    </Teleport>

    <BaseModal :show="showUploadModal" title="Send Files" @close="closeModal">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
          <div v-for="(file, index) in selectedFiles" :key="index" class="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border transition-all" :class="failedIndex === index ? 'border-red-500' : 'dark:border-neutral-700'">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="size-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon :name="failedIndex === index ? 'lucide:alert-circle' : 'lucide:file-text'" class="size-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-medium truncate dark:text-gray-200">{{ file.name }}</span>
                  <span class="text-[10px] text-gray-500 uppercase">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button v-if="failedIndex === index" @click="retryUpload" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                  <Icon name="lucide:refresh-cw" class="size-4 text-red-500" />
                </button>
                <button v-if="!isUploading" @click="removeFile(index)" class="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full">
                  <Icon name="lucide:trash-2" class="size-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            <div v-if="isUploading && currentFileIndex === index" class="mt-3">
              <div class="flex justify-between text-[10px] mb-1 font-bold text-primary-500">
                <span>Uploading...</span>
                <span>{{ progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-primary-500 h-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t dark:border-neutral-800">
          <div class="mb-4">
            <BaseInput v-model="message" label-key="Add a caption..." icon-name="lucide:pencil" placeholder="Add a caption..." size="md" mode="no-label" :disabled="isLoading || isUploading" @keyup.enter="handleSendMessage" />
          </div>
          <div class="flex justify-end gap-3">
            <CustomButton label-key="Cancel" variant="secondary" size="md" :disabled="isUploading || isLoading" @click="closeModal" />
            <CustomButton label-key="Send" icon-name="lucide:send" variant="primary" size="md" :loading="isLoading" :disabled="isUploading" @click="handleSendMessage" />
          </div>
        </div>
      </div>
    </BaseModal>

    <form @submit.prevent="handleSendMessage" class="flex items-center gap-x-2">
      <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileChange" />
      <CustomButton
        label-key=""
        variant="ghost"
        size="icon"
        :disabled="isLoading || isUploading"
        @click="triggerFileSelect"
        icon-name="lucide:paperclip"
      />
      <div class="flex-1 min-w-0">
        <BaseInput v-model="message" label-key="Type a message..." icon-name="lucide:message-square" placeholder="Write something..." size="sm" mode="no-label" :disabled="!uiStore.activeChatId || isLoading || isUploading" />
      </div>
      <div class="flex-none">
        <CustomButton type="submit" label-key="Send" icon-name="lucide:send" variant="primary" size="sm" :loading="isLoading"
                      :disabled="(!message.trim() && selectedFiles.length === 0) || !uiStore.activeChatId || isUploading" />
      </div>
    </form>
  </div>
</template>