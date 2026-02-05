<script setup lang="ts">
import {getBaseUrl, RouteEnum} from "~/utils/api";
import {useUiStore} from "~/stores/ui";

const { t } = useI18n()
const uiStore = useUiStore()
const token = useCookie('token').value

const {data: response, pending, error} = await useFetch<any>(getBaseUrl(1, RouteEnum.ContactList), {
  key: "contact-list",
  headers: {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token,
  }
})

const getInitials = (name: string) => {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
}

const selectConversation = (id: string) => {
  uiStore.setView('conversations')
  navigateTo(`/chat/${id}`)
}
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <div v-if="pending" class="flex flex-col gap-2 p-2">
      <div v-for="i in 6" :key="i"
           class="h-16 w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl"/>
    </div>

    <div v-else-if="error" class="text-red-500 dark:text-red-400 text-sm p-6 text-center">
      <Icon name="lucide:alert-circle" class="size-6 mx-auto mb-2 opacity-50"/>
      {{ t('Failed to load contacts') }}
    </div>

    <template v-else-if="response?.data?.length">
      <div
          v-for="item in response.data"
          :key="item.id"
          @click="selectConversation(item.id)"
          class="flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer
                 transition-all duration-200 group
                 hover:bg-neutral-100 dark:hover:bg-neutral-800/50
                 active:scale-[0.98] active:bg-neutral-200 dark:active:bg-neutral-800"
      >
        <div
            class="size-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400
                   flex items-center justify-center font-bold shrink-0 border border-primary-200 dark:border-primary-800/50">
          {{ getInitials(item.name) }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="text-sm md:text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {{ item.name }}
            </h3>
          </div>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {{ item.id }}
          </p>
        </div>

        <Icon
            name="lucide:chevron-right"
            class="size-5 text-neutral-300 dark:text-neutral-700 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors shrink-0"
        />
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="p-4 rounded-full bg-neutral-50 dark:bg-neutral-900 mb-4">
        <Icon name="lucide:users" class="size-10 text-neutral-300 dark:text-neutral-700"/>
      </div>
      <p class="text-base font-medium text-neutral-900 dark:text-neutral-100">{{ t('No contacts found') }}</p>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ t('Add a contact to start chatting') }}</p>
    </div>
  </div>
</template>