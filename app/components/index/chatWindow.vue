<script setup lang="ts">
import { ref } from 'vue'

const newMessage = ref('')
const messages = ref([
  { id: 1, text: "Hey! How's the new app coming along?", sender: 'other' },
  { id: 2, text: "Going great, just working on the chat UI now.", sender: 'me' },
])

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  messages.value.push({
    id: Date.now(),
    text: newMessage.value,
    sender: 'me'
  })
  newMessage.value = ''
}
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900">
    <header class="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
        <h2 class="font-semibold text-lg text-gray-800 dark:text-white">Design Team</h2>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['max-w-[80%] p-3 rounded-2xl text-sm transition-all',
          msg.sender === 'me'
            ? 'ml-auto bg-blue-600 text-white rounded-tr-none'
            : 'mr-auto bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none']"
      >
        {{ msg.text }}
      </div>
    </main>

    <footer class="p-4 border-t bg-gray-50 dark:bg-gray-900">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
            v-model="newMessage"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition-colors"
        >
          Send
        </button>
      </form>
    </footer>
  </div>
</template>