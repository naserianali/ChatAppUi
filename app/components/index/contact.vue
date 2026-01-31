<script setup lang="ts">
const {t} = useI18n()

</script>

<template>
  <aside class="h-full w-3/12 bg-white shadow p-4">
    <div class="flex items-center justify-between">
      <h1 class="block w-fit text-2xl font-bold">{{ t("Chats") }}</h1>
      <div>
        <custom-button
            labelKey="New Chat"
            iconName="lucide:plus"
            type="button"
            :loading="false"
            :disabled="false"
            variant="primary"
        />
      </div>
    </div>
    <div class="mt-6">
      <BaseInput
          labelKey="search"
          iconName="lucide:search"
          type="text"
          placeholder="search..."
          mode="text"
          size="sm"
      />
    </div>
    <div class="mt-6">
      <IndexConversationList/>
    </div>
  </aside>
</template>

<style scoped></style>
