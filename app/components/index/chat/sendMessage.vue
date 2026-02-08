<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useChatStore } from "~/stores/chatStore"
import { getBaseUrl, RouteEnum } from "~/utils/api"

const uiStore = useUiStore()
const chatStore = useChatStore()
const token = useCookie('token').value

const message = ref('')
const isLoading = ref(false)
const emit = defineEmits(['messageSent'])

const replyTo = computed(() => chatStore.getReplyForConversation(uiStore.activeChatId))

const clearReply = () => {
  chatStore.setReplayMessage(uiStore.activeChatId, null)
}

const handleSendMessage = async () => {
  if (!message.value.trim() || !uiStore.activeChatId || isLoading.value) return
  isLoading.value = true

  try {
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
        message: message.value,
        parent_id: replyTo.value ? replyTo.value.id : null
      }
    })

    message.value = ''
    clearReply()
    emit('messageSent')
  } catch (error) {
    console.error("Failed to send message:", error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">

    <Teleport to="#reply-teleport-target">
      <Transition name="slide-up">
        <div
            v-if="replyTo"
            class="px-4 py-2 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between"
        >
          <div class="flex flex-col border-s-4 border-primary-500 px-3 overflow-hidden">
            <span class="text-[10px] font-bold text-primary-600 uppercase">
              Replying to {{ replyTo.sender?.name }}
            </span>
            <span class="text-xs text-gray-500 truncate line-clamp-1 italic">
              {{ replyTo.body }}
            </span>
          </div>
          <button @click="clearReply" type="button" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Icon name="lucide:x" class="size-4 text-gray-400" />
          </button>
        </div>
      </Transition>
    </Teleport>

    <form @submit.prevent="handleSendMessage" class="flex items-center gap-x-2">
      <div class="flex-1">
        <BaseInput
            v-model="message"
            label-key="Type a message..."
            icon-name="lucide:message-square"
            placeholder="Write something..."
            size="sm"
            mode="no-label"
            :disabled="!uiStore.activeChatId || isLoading"
        />
      </div>
      <CustomButton
          type="submit"
          label-key="Send"
          icon-name="lucide:send"
          variant="primary"
          size="sm"
          :loading="isLoading"
          :disabled="!message.trim() || !uiStore.activeChatId"
      />
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