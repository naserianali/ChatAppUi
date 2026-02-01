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
      class="h-full bg-white shadow-lg p-4 flex flex-col transition-all duration-300
           fixed inset-0 z-30 w-full
           md:relative md:translate-x-0 md:w-4/12 lg:w-3/12"
      :class="[uiStore.activeChatId ? 'hidden md:flex' : 'flex']"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 overflow-hidden">
        <button
            v-if="uiStore.sidebarView !== 'conversations'"
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded-full shrink-0"
        >
          <Icon name="lucide:arrow-left" class="size-5" />
        </button>
        <h1 class="text-xl md:text-2xl font-bold truncate">
          {{ uiStore.sidebarView === 'conversations' ? t("Chats") : t("Contacts") }}
        </h1>
      </div>

      <CustomButton
          :labelKey="uiStore.sidebarView === 'conversations' ? 'New' : 'Add'"
          :iconName="uiStore.sidebarView === 'conversations' ? 'lucide:plus' : 'lucide:user-plus'"
          variant="primary"
          class="!w-fit !px-3 md:!px-4"
          @click="handleHeaderAction"
      />
    </div>

    <div class="mt-4">
      <BaseInput
          labelKey=""
          iconName="lucide:search"
          :placeholder="t('Search...')"
          size="sm"
      />
    </div>

    <div class="mt-4 flex-1 overflow-y-auto custom-scrollbar">
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>