<script setup lang="ts">
import { useUiStore } from "~/stores/ui";
const { t } = useI18n()
const uiStore = useUiStore()

const isModalOpen = ref(false)

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
  <aside
      class="h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300
           fixed inset-y-0 left-0 z-30 w-full
           md:relative md:translate-x-0 md:w-[350px] lg:w-[400px] shrink-0"
      :class="[uiStore.activeChatId ? 'hidden md:flex' : 'flex']"
  >
    <div class="p-4 flex items-center justify-between gap-2 border-b border-gray-50 dark:border-gray-800">
      <div class="flex items-center gap-2 overflow-hidden">
        <button
            v-if="uiStore.sidebarView !== 'conversations'"
            @click="goBack"
            class="hover:bg-gray-100 h-fit w-fit dark:hover:bg-gray-800 rounded-full shrink-0 transition-colors flex items-center"
        >
          <Icon name="lucide:arrow-left" class="size-5 dark:text-white" />
        </button>
        <h1 class="text-xl font-bold truncate dark:text-white">
          {{ uiStore.sidebarView === 'conversations' ? t("Chats") : t("Contacts") }}
        </h1>
      </div>

      <CustomButton
          :labelKey="uiStore.sidebarView === 'conversations' ? 'New' : 'Add'"
          :iconName="uiStore.sidebarView === 'conversations' ? 'lucide:plus' : 'lucide:user-plus'"
          variant="primary"
          class="!w-fit !px-3 !py-1.5 text-sm"
          @click="handleHeaderAction"
      />
    </div>

    <div class="px-4 py-3">
      <BaseInput
          labelKey=""
          iconName="lucide:search"
          :placeholder="t('Search...')"
          size="sm"
          mode="no-label"
          class="bg-gray-50 dark:bg-gray-800"
      />
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <IndexConversationList v-if="uiStore.sidebarView === 'conversations'" />
      <IndexContactList v-else-if="uiStore.sidebarView === 'contacts'" />
    </div>

    <BaseModal
        :show="isModalOpen"
        :title="t('Add New Contact')"
        @close="isModalOpen = false"
    >
      <IndexContactCreate @success="isModalOpen = false" />
    </BaseModal>
  </aside>
</template>