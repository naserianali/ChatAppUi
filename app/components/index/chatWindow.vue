<script setup lang="ts">
import {nextTick, ref, watch, onMounted, onUnmounted} from 'vue'
import {useUiStore} from '~/stores/ui'
import {storeToRefs} from 'pinia'
import {getBaseUrl, RouteEnum} from "~/utils/api"

const {$echo} = useNuxtApp()
const uiStore = useUiStore()
const {activeChatId, name} = storeToRefs(uiStore)
const user = useCookie<any>('user').value
const token = useCookie('token').value
const messagesContainer = ref<HTMLElement | null>(null)
const {t} = useI18n();
const {data: conversationData, pending, refresh} = useFetch(() => {
  if (!activeChatId.value) return null
  return getBaseUrl(1, RouteEnum.GetConversation, {
    conversationId: activeChatId.value,
  })
}, {
  key: `chat-data-${activeChatId.value}`,
  headers: {
    Authorization: 'Bearer ' + token,
    Accept: 'application/json'
  },
  watch: [activeChatId]
})

const setupEchoListeners = (id: string) => {
  $echo.private(`conversations.${id}`)
      .listen('MessageSent', (e: any) => {
        console.log('New message detected, refetching...')
        refresh()
      })
      .listen('MessageReadEvent', (e: any) => {
        console.log('Messages read, refetching...')
        refresh()
      })
}

const leaveEchoChannel = (id: string) => {
  $echo.leave(`conversations.${id}`)
}

watch(activeChatId, (newId, oldId) => {
  if (oldId) leaveEchoChannel(oldId)
  if (newId) setupEchoListeners(newId)
})

onMounted(() => {
  if (activeChatId.value) setupEchoListeners(activeChatId.value)
})

onUnmounted(() => {
  if (activeChatId.value) leaveEchoChannel(activeChatId.value)
})

watch(() => conversationData.value, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, {deep: true})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900">
    <header class="p-4 border-b flex items-center justify-between dark:border-gray-800">
      <div v-if="activeChatId" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {{ activeChatId.toString().substring(0, 1).toUpperCase() }}
        </div>
        <h2 class="font-semibold text-lg dark:text-white">{{ name }}</h2>
      </div>
      <div v-else class="text-gray-500 italic">{{ t("No conversation selected") }}</div>
    </header>

    <main ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
      <div v-if="!activeChatId" class="h-full flex items-center justify-center text-gray-400">
        Select a conversation to start chatting
      </div>

      <div v-else-if="pending && !conversationData" class="flex justify-center mt-10">
        <Icon name="lucide:loader-2" class="animate-spin size-8 text-blue-500"/>
      </div>

      <template v-else>
        <div
            v-for="msg in conversationData?.data"
            :key="msg.id"
            :class="[
      'max-w-[75%] p-3 rounded-2xl text-sm shadow-sm transition-all mb-2',
      msg.sender_id === user?.id
        ? 'ms-auto bg-blue-600 text-white rounded-tr-none'
        : 'me-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
    ]"
        >
          {{ msg.body || msg.content }}

          <div
              :class="['text-[10px] mt-1 flex justify-end gap-1', msg.user_id === user?.id ? 'text-blue-100' : 'text-gray-400']">
            {{
              msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }) : ''
            }}
            <Icon v-if="msg.user_id === user?.id" :name="msg.read_at ? 'lucide:check-check' : 'lucide:check'"
                  class="size-3"/>
          </div>
        </div>
      </template>
    </main>

    <footer v-if="activeChatId" class="p-4 border-t dark:border-gray-800">
      <IndexChatSendMessage/>
    </footer>
  </div>
</template>