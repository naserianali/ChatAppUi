<script setup lang="ts">
import {getBaseUrl, RouteEnum} from "~/utils/api";
import {useUiStore} from "~/stores/ui";
import type {UserType} from "~/types/user.type";
import type {ConversationType} from "~/types/conversation.type";
import type {PaginationResponseType} from "~/types/response.type";


const {t} = useI18n();
const uiStore = useUiStore();
const {$echo} = useNuxtApp()

const token = useCookie('token').value
const user = useCookie<UserType | undefined>('user').value

if (!token) {
  navigateTo('/login');
}


const {
  data: response,
  pending,
  refresh
} = useFetch<PaginationResponseType<ConversationType[]>>(getBaseUrl(1, RouteEnum.ConversationList), {
  key: "conversations",
  headers: {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token,
  },
})
onMounted(() => {
  if (user && user.id) {
    $echo.private(`users.${user.id}`)
        .subscribed(() => {
          console.log("Successfully subscribed to private channel!");
        })
        .listen(".new.conversation", async (event: any) => {
          await refresh();
        })
  }
})

onUnmounted(() => {
  if (user && user.id) {
    $echo.leave(`users.${user.id}`)
  }
})

const openConversation = (conv: ConversationType, user: UserType | null) => {
  uiStore.setActiveChat(conv.id, user, conv.meta);
  useCookie("activeChatId").value = conv.id

}
const getOtherUser = (conversation: ConversationType) => {
  if (!user)
    return null;
  const otherUser = conversation.users?.find((u: UserType) => u.id !== user?.id);
  return otherUser || null;
}
</script>

<template>
  <div class="p-4 bg-transparent">
    <h1 class="text-xl md:text-2xl font-bold mb-5 text-neutral-900 dark:text-neutral-100">
      {{ t("Messages") }}
    </h1>

    <div v-if="pending" class="flex flex-col gap-3">
      <div v-for="i in 5" :key="i"
           class="h-20 w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl"/>
    </div>

    <ul v-else class="space-y-3">
      <li
          v-for="conv in response?.data"
          :key="conv.id"
          @click="openConversation(conv , getOtherUser(conv))"
          :class="[
             'p-4 border rounded-xl cursor-pointer flex justify-between gap-3 transition-all duration-200 active:scale-[0.99]',
             uiStore.activeChatId === conv.id
                ? 'bg-primary-50 dark:bg-gray-700 border-primary-500 dark:bg-primary-900/20 dark:border-primary-500 shadow-sm'
                : 'bg-white dark:bg-gray-900 border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          ]"
      >
        <div class="flex-1 min-w-0">
          <p class="font-bold text-neutral-900 dark:text-neutral-100 truncate">
            {{ conv.users?.filter((u: any) => u.id !== user?.id)[0]?.name || t("Private Chat") }}
          </p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate mt-0.5 max-w-[220px] sm:max-w-full">
            {{ conv.message?.body || t("No messages yet...") }}
          </p>
        </div>

        <div class="flex flex-col items-end justify-between shrink-0">
          <span class="text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
            {{ new Date(conv.updated_at).toLocaleString('fa-IR').replace(",", " |") }}
          </span>
        </div>
      </li>
    </ul>

    <div v-if="response?.data?.length === 0 && !pending" class="text-center py-20 flex flex-col items-center">
      <Icon name="lucide:message-square-dashed" class="size-12 text-neutral-300 dark:text-neutral-700 mb-3"/>
      <p class="text-neutral-500 dark:text-neutral-400 font-medium">
        {{ t("No conversations found.") }}
      </p>
    </div>
  </div>
</template>