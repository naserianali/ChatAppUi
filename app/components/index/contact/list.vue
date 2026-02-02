<script setup lang="ts">
import {getBaseUrl, RouteEnum} from "~/utils/api";
import {useUiStore} from "~/stores/ui";

const uiStore = useUiStore()
const token = useCookie('token').value
const currentUser = useCookie<{ id: string }>('user').value

const {data: response, pending, error} = await useFetch<any>(getBaseUrl(1, RouteEnum.ConversationList), {
  key: "contact-list",
  headers: {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token,
  }
})

const getContactInfo = (conversation: any) => {
  return conversation.users.find((u: any) => u.id !== currentUser?.id) || conversation.users[0]
}

const selectConversation = (id: string) => {
  uiStore.setView('conversations')
  navigateTo(`/chat/${id}`)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-if="pending" class="flex flex-col gap-4 p-4">
      <div v-for="i in 5" :key="i" class="h-12 w-full bg-gray-100 animate-pulse rounded-lg"/>
    </div>

    <div v-else-if="error" class="text-red-500 text-sm p-4 text-center">
      {{ t('Failed to load contacts') }}
    </div>

    <template v-else-if="response?.data?.length">
      <div
          v-for="item in response.data"
          :key="item.id"
          @click="selectConversation(item.id)"
          class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors group"
      >
        <div
            class="size-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
          {{ getContactInfo(item).first_name[0] }}{{ getContactInfo(item).last_name[0] }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 truncate">
              {{ getContactInfo(item).first_name }} {{ getContactInfo(item).last_name }}
            </h3>
          </div>
          <p class="text-xs text-gray-500 truncate">
            {{ getContactInfo(item).phone }}
          </p>
        </div>

        <Icon name="lucide:chevron-right" class="size-4 text-gray-300 group-hover:text-primary-500 transition-colors"/>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center py-10 text-center">
      <Icon name="lucide:users" class="size-10 text-gray-300 mb-2"/>
      <p class="text-sm text-gray-500">{{ t('No contacts found') }}</p>
    </div>
  </div>
</template>