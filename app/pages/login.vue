<script setup lang="ts">
import LoginForm from "~/components/auth/LoginForm.vue";

const { t } = useI18n()

definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">

    <h1 class="text-3xl flex items-center justify-center gap-2 text-primary-600 font-extrabold mb-2">
      <Icon name="lucide:message-circle" class="size-9"/>
      {{ t("Logo") }}
    </h1>

    <h4 class="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
      {{ t("Welcome Back") }}
    </h4>

    <p class="text-neutral-500 dark:text-neutral-400 mt-1 mb-6 text-center">
      {{ t("Please Enter Your Detail To Sign In") }}
    </p>

    <div class="w-full max-w-md lg:max-w-lg space-y-6">

      <div class="bg-neutral-50/50 dark:bg-neutral-900/50 p-1 rounded-xl">
        <LoginForm/>
      </div>

      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-neutral-300 dark:border-neutral-800"></div>
        </div>
        <div class="relative flex justify-center text-sm uppercase">
          <span class="bg-white dark:bg-neutral-950 px-3 text-neutral-500 dark:text-neutral-400 font-medium">
            {{ t("Or Continue With") }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <CustomButton
            labelKey="Github"
            iconName="lucide:github"
            type="button"
            class="w-full"
            variant="border"
            disabled
        />
        <CustomButton
            labelKey="Gmail"
            iconName="lucide:chrome"
            type="button"
            class="w-full"
            variant="border"
            disabled
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>