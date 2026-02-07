<script setup lang="ts">
import {useUiStore} from "~/stores/ui";

const {t} = useI18n()
const uiStore = useUiStore()

const isModalOpen = ref(false)
const isSettingsOpen = ref(false)

const handleHeaderAction = () => {
  if (uiStore.sidebarView === 'conversations') {
    uiStore.setView('contacts')
  } else {
    isModalOpen.value = true
  }
}

const goBack = () => uiStore.setView('conversations')
</script>

<template>
  <div
      class="h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300
           fixed inset-y-0 left-0 z-30 w-full
           md:relative md:translate-x-0 md:w-[350px] lg:w-[400px] shrink-0"
      :class="[uiStore.activeChatId ? 'hidden md:flex' : 'flex']"
  >
    <div class="p-4 h-16 flex items-center justify-between gap-2 border-b border-gray-50 dark:border-gray-800">
      <div class="flex items-center gap-2 overflow-hidden">
        <CustomButton
            v-if="uiStore.sidebarView !== 'conversations'"
            variant="border"
            iconName="lucide:arrow-left"
            labelKey=""
            class="!w-fit !p-2 rounded-full shrink-0"
            @click="goBack"
        />

        <h1 class="text-xl font-bold truncate dark:text-white">
          {{ uiStore.sidebarView === 'conversations' ? t("Chats") : t("Contacts") }}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <CustomButton
            variant="border"
            iconName="lucide:settings"
            labelKey=""
            class="!w-fit !p-2 rounded-full"
            @click="isSettingsOpen = true"
        />

        <CustomButton
            :labelKey="uiStore.sidebarView === 'conversations' ? 'New' : 'Add'"
            :iconName="uiStore.sidebarView === 'conversations' ? 'lucide:plus' : 'lucide:user-plus'"
            variant="primary"
            class="!w-fit !px-3 !py-1.5 text-sm"
            @click="handleHeaderAction"
        />
      </div>
    </div>

    <div class="px-4 py-3">
      <BaseInput
          labelKey=""
          iconName="lucide:search"
          placeholder="Search..."
          size="sm"
          mode="no-label"
          class="bg-gray-50 dark:bg-gray-800"
      />
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <IndexConversationList v-if="uiStore.sidebarView === 'conversations'"/>
      <IndexContactList v-else-if="uiStore.sidebarView === 'contacts'"/>
    </div>

    <BaseModal
        :show="isModalOpen"
        :title="t('Add New Contact')"
        @close="isModalOpen = false"
    >
      <IndexContactCreate @success="isModalOpen = false"/>
    </BaseModal>

    <BaseModal
        :show="isSettingsOpen"
        :title="t('Profile Settings')"
        @close="isSettingsOpen = false"
    >
      <IndexProfileViewProfile/>
    </BaseModal>
  </div>
</template>