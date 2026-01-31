<script setup lang="ts">
import {getBaseUrl, RouteEnum} from "~/utils/api";

interface IUser {
  id: string,
  name: string,
}

const {$echo} = useNuxtApp()
const token = useCookie('token').value
const user = useCookie<IUser | undefined>('user').value
if (!token) {
  navigateTo('/login');
}
const {data: response, pending} = useFetch(getBaseUrl(1, RouteEnum.ConversationList), {
  headers: {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token,
  }
})
onMounted(() => {
  if (user && user.id) {
    $echo.private(`users.${user.id}`)
        .listen("NewConversationCreated", (event: Event) => {
          console.log(event.conversations)
          if (response.value?.data) {
            response.value.data.unshift(e.conversation);
          }
        })
  }
})
onUnmounted(() => {
  if (user.id) {
    $echo.leave(`users.${user.id}`)
  }
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Messages</h1>

    <div v-if="pending">Loading conversations...</div>

    <ul v-else class="space-y-2">
      <li
          v-for="conv in response?.data"
          :key="conv.id"
          class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between"
      >
        <div>
          <p class="font-semibold">
            {{ conv.users?.filter(u => u.id !== user.id)[0]?.name || 'Private Chat' }}
          </p>
          <p class="text-sm text-gray-500">
            {{ conv.messages?.[0]?.content || 'No messages yet...' }}
          </p>
        </div>
        <span class="text-xs text-gray-400">
          {{ new Date(conv.updated_at).toLocaleTimeString() }}
        </span>
      </li>
    </ul>

    <div v-if="response?.data?.length === 0" class="text-center py-10">
      No conversations found.
    </div>
  </div>
</template>

<style scoped></style>
