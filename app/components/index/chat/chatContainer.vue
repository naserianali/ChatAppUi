<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {storeToRefs} from 'pinia'
import {useUiStore} from "~/stores/ui";
import {RouteEnum} from "~/utils/api";

const {$echo} = useNuxtApp()
const uiStore = useUiStore()
const {activeChatId, user: selectedUser} = storeToRefs(uiStore)

const user = useCookie<any>('user').value
const token = useCookie('token').value

const messagesContainer = ref<HTMLElement | null>(null)
const topTrigger = ref<HTMLElement | null>(null)
const bottomTrigger = ref<HTMLElement | null>(null)
const messages = ref<any[]>([])

const isLoading = ref(false)
const isFetchingMore = ref(false)

const nextCursor = ref<string | null>(null)
const prevCursor = ref<string | null>(null)
const hasMoreOlder = ref(false)
const hasMoreNewer = ref(false)

const setupEcho = (id: string) => {
  $echo.private(`conversations.${id}`)
      .listen('.MessageSent', (e: any) => {
        const newMsg = e.message || e.data?.message || e.conversation?.last_message || e
        if (!newMsg || !newMsg.id) return

        if (hasMoreNewer.value) {
          if (newMsg.sender_id === user?.id) {
            handleMessageSent()
          }
          return
        }

        const exists = messages.value.some(m => m.id === newMsg.id)
        if (exists) return

        messages.value.push(newMsg)

        if (newMsg.sender_id === user?.id || !hasMoreNewer.value) {
          scrollToBottom('smooth')
        }
      })
}

const handleMessageSent = async () => {
  if (hasMoreNewer.value) {
    messages.value = []
    nextCursor.value = null
    prevCursor.value = null
    hasMoreOlder.value = false
    hasMoreNewer.value = false
    await fetchMessages(null)
  } else {
    scrollToBottom('smooth')
  }
}

const fetchMessages = async (cursor: string | null = null, direction: 'up' | 'down' = 'up') => {
  if (!activeChatId.value || isFetchingMore.value) return

  const isInitial = !cursor && messages.value.length === 0
  if (isInitial) isLoading.value = true
  isFetchingMore.value = true

  try {
    const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetConversation, {conversationId: activeChatId.value}), {
      params: {cursor, per_page: 10, direction},
      headers: {Authorization: 'Bearer ' + token}
    })

    if (res?.data) {
      const container = messagesContainer.value
      const prevH = container?.scrollHeight || 0
      const prevT = container?.scrollTop || 0

      if (isInitial) {
        messages.value = res.data.reverse()
        nextCursor.value = res.meta?.next_cursor || res.pagination?.next_cursor
        hasMoreOlder.value = !!nextCursor.value
        hasMoreNewer.value = false
        scrollToBottom('auto')
      } else if (direction === 'up') {
        const newMsgs = res.data
        messages.value = [...newMsgs.reverse(), ...messages.value]
        nextCursor.value = res.meta?.next_cursor || res.pagination?.next_cursor
        hasMoreOlder.value = !!nextCursor.value
        await nextTick()
        if (container) container.scrollTop = container.scrollHeight - prevH + prevT
      } else if (direction === 'down') {
        const newMsgs = res.data
        messages.value = [...messages.value, ...newMsgs]
        prevCursor.value = res.meta?.next_cursor || res.pagination?.next_cursor
        hasMoreNewer.value = !!prevCursor.value
        if (!hasMoreNewer.value) scrollToBottom('smooth')
      }
    }
  } finally {
    isLoading.value = false
    isFetchingMore.value = false
  }
}

const scrollToBottom = (behavior: 'auto' | 'smooth' = 'auto') => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior
      })
    }
  })
}

const markAsRead = async (messageId: string) => {
  if (!activeChatId.value) return
  try {
    await $fetch(getBaseUrl(1, RouteEnum.MarkAsRead, {
      conversationId: activeChatId.value,
      messageId: messageId
    }), {
      method: 'PATCH',
      headers: {Authorization: 'Bearer ' + token}
    })
  } catch (err) {
  }
}

const onMessageVisible = (messageId: string) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg && msg.sender_id !== user?.id && !msg.read_at) {
    markAsRead(messageId)
  }
}

const highlightMessage = (id: string) => {
  nextTick(() => {
    setTimeout(() => {
      const el = document.getElementById(`msg-${id}`)
      if (el) {
        el.scrollIntoView({behavior: 'smooth', block: 'center'})
        el.classList.add('highlight-anim')
        setTimeout(() => el.classList.remove('highlight-anim'), 3000)
      }
    }, 400)
  })
}

const handleJumpToParent = async (parentId: string) => {
  const existingElement = document.getElementById(`msg-${parentId}`)
  if (existingElement) {
    highlightMessage(parentId)
    return
  }
  try {
    isLoading.value = true
    const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetReplayPage, {
      conversationId: activeChatId.value,
      messageId: parentId
    }), {headers: {Authorization: 'Bearer ' + token}})

    if (res?.success && res.data?.data) {
      messages.value = res.data.data
      nextCursor.value = res.data.meta.next_cursor
      prevCursor.value = res.data.meta.prev_cursor
      hasMoreOlder.value = !!res.data.meta.next_cursor
      hasMoreNewer.value = !!res.data.meta.prev_cursor
      highlightMessage(parentId)
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

useIntersectionObserver(topTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && hasMoreOlder.value && !isFetchingMore.value && !isLoading.value) {
    fetchMessages(nextCursor.value, 'up')
  }
})

useIntersectionObserver(bottomTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && hasMoreNewer.value && !isFetchingMore.value && !isLoading.value) {
    fetchMessages(prevCursor.value, 'down')
  }
})

watch(activeChatId, (newId, oldId) => {
  if (oldId) $echo.leave(`conversations.${oldId}`)
  messages.value = []
  nextCursor.value = null
  prevCursor.value = null
  hasMoreOlder.value = false
  hasMoreNewer.value = false
  if (newId) {
    fetchMessages(null)
    setupEcho(newId)
  }
}, {immediate: true})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden relative">
    <IndexChatHeader :user="selectedUser" :active-chat-id="activeChatId" @back="uiStore.setActiveChat(null, null)"/>

    <main ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black/40 custom-scrollbar">
      <div v-if="isLoading && !isFetchingMore" class="flex items-center justify-center py-20">
        <Icon name="lucide:loader-2" class="animate-spin size-8 text-blue-500"/>
      </div>

      <template v-else>
        <div ref="topTrigger" class="h-4 w-full flex items-center justify-center">
          <Icon v-if="isFetchingMore && hasMoreOlder" name="lucide:loader-2" class="animate-spin size-5 text-blue-400"/>
        </div>

        <IndexChatMessageItem
            v-for="msg in messages"
            :id="`msg-${msg.id}`"
            :key="msg.id"
            :message="msg"
            :is-own="msg.sender_id === user?.id"
            @visible="onMessageVisible"
            @jump-to-parent="handleJumpToParent"
        />

        <div ref="bottomTrigger" class="h-10 w-full flex items-center justify-center">
          <Icon v-if="isFetchingMore && hasMoreNewer" name="lucide:loader-2" class="animate-spin size-5 text-blue-400"/>
        </div>
      </template>
    </main>

    <footer v-if="activeChatId" class="px-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 h-16">
      <IndexChatSendMessage @message-sent="handleMessageSent"/>
    </footer>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  overflow-anchor: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

:deep(.highlight-anim) {
  animation: highlight 3s ease-in-out forwards;
}

@keyframes highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.4);
  }
  100% {
    background-color: transparent;
  }
}
</style>f