<script setup lang="ts">
import LoginForm from "~/components/auth/LoginForm.vue";

const {t} = useI18n()
</script>

<template>
  <div class="container flex flex-col justify-center items-center h-screen">
    <h1 class="text-2xl flex items-center justify-center gap-2 text-primary-600 font-bold mb-3">
      <Icon name="lucide:message-circle" class="size-8"/>
      {{ t("Logo") }}
    </h1>
    <h4 class="text-xl mx-auto my-2 font-semibold">
      {{ t("Welcome Back") }}
    </h4>
    <p class="mx-auto text-neutral-600">{{ t("Please Enter Your Detail To Sign In") }}</p>
    <div class="lg:w-2/5 w-1/2 overflow-hidden p-4">
      <LoginForm/>
      <p class="mx-auto text-sm relative text-center">
        <span class="block absolute start-0 top-1/2 w-full h-0.5 bg-neutral-300 -z-1"></span>
        <span class="block w-fit bg-white z-20 mx-auto px-2">
        {{ t("Or Continue With") }}
      </span>
        <span class="block absolute end-0 top-1/2 w-full h-0.5 bg-neutral-300 -z-1"></span>
      </p>
      <div class="flex gap-3">
        <CustomButton
            labelKey="Github"
            iconName="lucide:github"
            type="button"
            :loading="false"
            :disabled="true"
            variant="border"
        />
        <CustomButton
            labelKey="Gmail"
            iconName="lucide:chrome"
            type="button"
            :loading="false"
            :disabled="true"
            variant="border"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>