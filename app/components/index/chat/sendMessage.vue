<script setup lang="ts">
import {useUiStore} from '~/stores/ui'
import {getBaseUrl, RouteEnum} from "~/utils/api"

const uiStore = useUiStore()
const token = useCookie('token').value
const message = ref('')
const isLoading = ref(false)

const emit = defineEmits(['messageSent'])

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
      body: {message: message.value}
    })
    message.value = ''
    emit('messageSent');
    await refreshNuxtData(`chat-data-${uiStore.activeChatId}`);
  } catch (error) {
    console.error("Failed to send message:", error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <footer class="p-4 border-t bg-white dark:bg-gray-900 dark:border-gray-800">
    <form @submit.prevent="handleSendMessage" class="flex items-end gap-x-2">

      <div class="flex-1">
        <BaseInput
            v-model="message"
            label-key="Type a message..."
            icon-name="lucide:message-square"
            placeholder="Write something..."
            size="sm"
            :disabled="!uiStore.activeChatId || isLoading"
        />
      </div>
      <div class="mt-2">
        <CustomButton
            type="submit"
            label-key="Send"
            icon-name="lucide:send"
            variant="primary"
            :loading="isLoading"
            :disabled="!message.trim() || !uiStore.activeChatId"
        />
      </div>
    </form>
  </footer>
</template>