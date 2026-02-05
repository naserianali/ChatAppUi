<script setup lang="ts">
import {nextTick, ref, watch, onMounted, onUnmounted} from 'vue'
import {useUiStore} from '~/stores/ui'
import {storeToRefs} from 'pinia'
import {getBaseUrl, RouteEnum} from "~/utils/api"

const {$echo} = useNuxtApp()
const uiStore = useUiStore()
const {activeChatId, name} = storeToRefs(uiStore)
const {t} = useI18n()

const user = useCookie<any>('user').value
const token = useCookie('token').value
const messagesContainer = ref<HTMLElement | null>(null)

const {data: conversationData, pending, refresh} = useFetch(() => {
  if (!activeChatId.value) return null
  return getBaseUrl(1, RouteEnum.GetConversation, {
    conversationId: activeChatId.value,
  })
}, {
  key: activeChatId.value ? `chat-data-${activeChatId.value}` : 'chat-idle',
  headers: {
    Authorization: 'Bearer ' + token,
    Accept: 'application/json'
  },
  watch: [activeChatId],
  immediate: !!activeChatId
})

const setupEchoListeners = (id: string) => {
  $echo.private(`conversations.${id}`)
      .listen('MessageSent', () => refresh())
      .listen('MessageReadEvent', () => refresh())
}

const leaveEchoChannel = (id: string) => {
  $echo.leave(`conversations.${id}`)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(activeChatId, (newId, oldId) => {
  if (oldId) leaveEchoChannel(oldId)
  if (newId) setupEchoListeners(newId)
})

watch(() => conversationData.value, () => {
  scrollToBottom()
}, {deep: true})

onMounted(() => {
  if (activeChatId.value) setupEchoListeners(activeChatId.value)
  scrollToBottom()
})

onUnmounted(() => {
  if (activeChatId.value) leaveEchoChannel(activeChatId.value)
})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden">
    <header
        class="h-16 flex items-center justify-between px-4 border-b dark:border-gray-800 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
      <div v-if="activeChatId" class="flex items-center gap-3 min-w-0">
        <button
            @click="uiStore.setActiveChat(null, null)"
            class="md:hidden p-2 -ms-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0"
        >
          <Icon name="lucide:arrow-left" class="size-6 dark:text-white"/>
        </button>

        <div
            class="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
          {{ name ? name.substring(0, 1).toUpperCase() : '?' }}
        </div>

        <div class="min-w-0">
          <h2 class="font-bold text-base md:text-lg dark:text-white truncate leading-tight">
            {{ name }}
          </h2>
          <span class="text-[10px] text-green-500 font-medium">Online</span>
        </div>
      </div>

      <div v-else class="text-gray-400 text-sm font-medium italic">
        {{ t("No conversation selected") }}
      </div>
    </header>

    <main
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black/40 scroll-smooth custom-scrollbar"
    >
      <div v-if="!activeChatId" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
        <div class="p-6 rounded-full bg-gray-100 dark:bg-gray-800">
          <Icon name="lucide:messages-square" class="size-12 opacity-20"/>
        </div>
        <p class="text-sm font-medium">Select a conversation to start chatting</p>
      </div>

      <div v-else-if="pending && !conversationData" class="flex justify-center py-10">
        <Icon name="lucide:loader-2" class="animate-spin size-8 text-blue-500"/>
      </div>

      <template v-else>
        <div
            v-for="msg in conversationData?.data"
            :key="msg.id"
            :class="[
            'max-w-[85%] md:max-w-[50%] p-3 rounded-2xl text-sm shadow-sm transition-all flex flex-col',
            msg.sender_id === user?.id
              ? 'ms-auto bg-blue-600 text-white rounded-tr-none'
              : 'me-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
          ]"
        >
          <span class="leading-relaxed break-words">{{ msg.body || msg.content }}</span>

          <div
              :class="[
              'text-[10px] mt-1 flex items-center gap-1 opacity-80',
              msg.sender_id === user?.id ? 'justify-end text-blue-50' : 'justify-start text-gray-400'
            ]"
          >
            {{
              msg.created_at ? new Date(msg.created_at).toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit'
              }) : ''
            }}

            <Icon
                v-if="msg.sender_id === user?.id"
                :name="msg.read_at ? 'lucide:check-check' : 'lucide:check'"
                class="size-3"
            />
          </div>
        </div>
      </template>
    </main>

    <footer v-if="activeChatId" class="p-3 md:p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      <IndexChatSendMessage/>
    </footer>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.2);
  border-radius: 10px;
}
</style>