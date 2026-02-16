<script setup lang="ts">
import {getBaseUrl, RouteEnum} from "~/utils/api";
import {useUiStore} from "~/stores/ui";

const {t} = useI18n()
const uiStore = useUiStore()
const token = useCookie('token').value

const isModalOpen = ref(false)
const selectedContact = ref<any>(null)
const uiCookie = useCookie("ui")
const {data: response, pending, error} = await useFetch<any>(getBaseUrl(1, RouteEnum.ContactList), {
  key: "contact-list",
  headers: {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token,
  }
})

onMounted(() => {
  if (uiCookie.value){
    uiCookie.value = null
  }
})
const getInitials = (name: string) => {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
}

const openContactProfile = (contact: any) => {
  selectedContact.value = contact
  isModalOpen.value = true
}

const startChat = () => {
  if (!selectedContact.value) return
  uiStore.setView('conversations')
  isModalOpen.value = false
  uiStore.setActiveChat(selectedContact.value.private_chat_id, selectedContact.value.contact)
}

const startVoiceCall = (id: string) => {
  console.log('Voice Call', id)
}

const blockContact = (id: string) => {
  console.log('Block', id)
}

const removeContact = (id: string) => {
  console.log('Remove', id)
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
          @click="openContactProfile(item)"
          class="flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer
                 transition-all duration-200 group
                 hover:bg-neutral-100 dark:hover:bg-neutral-800/50
                 active:scale-[0.98] active:bg-neutral-200 dark:active:bg-neutral-800"
      >
        <div class="size-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400
                   flex items-center justify-center font-bold shrink-0 border border-primary-200 dark:border-primary-800/50">
          {{ getInitials(item.name) }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="text-sm md:text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {{ item.name }}
            </h3>
          </div>
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

    <BaseModal
        :show="isModalOpen"
        :title="t('Contact Profile')"
        @close="isModalOpen = false"
    >
      <div v-if="selectedContact" class="flex flex-col items-center">
        <div class="size-24 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400
                   flex items-center justify-center text-3xl font-bold mb-4 border-2 border-primary-200 dark:border-primary-800">
          {{ getInitials(selectedContact.name) }}
        </div>

        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {{ selectedContact.name }}
        </h2>

        <div class="flex flex-col gap-3 w-full">
          <CustomButton
              variant="primary"
              size="lg"
              icon-name="lucide:message-square"
              label-key="Start Chat"
              class="!w-full"
              @click="startChat"
          />

          <CustomButton
              variant="success"
              size="lg"
              icon-name="lucide:phone"
              label-key="Voice Call"
              class="!w-full"
              @click="startVoiceCall(selectedContact.id)"
          />

          <div class="grid grid-cols-2 gap-3 w-full mt-2">
            <CustomButton
                variant="border"
                size="md"
                icon-name="lucide:ban"
                label-key="Block"
                class="!w-full !text-orange-600 dark:!text-orange-400"
                @click="blockContact(selectedContact.id)"
            />
            <CustomButton
                variant="danger"
                size="md"
                icon-name="lucide:trash-2"
                label-key="Remove"
                class="!w-full"
                @click="removeContact(selectedContact.id)"
            />
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>