<script setup lang="ts">
import LoginForm from "~/components/auth/LoginForm.vue";
import {getBaseUrl, RouteEnum} from "~/utils/api";
import {useHandleError} from "~/utils/HandleError";
import type {UserType} from "~/types/user.type";

const {t} = useI18n()
const route = useRoute();
const googleLoading = ref(false)
definePageMeta({
  layout: false
});
const handleGoogleLogin = async () => {
  const redirect = getBaseUrl(1, RouteEnum.GoogleLogin);
  navigateTo(redirect, {
    external: true,
    open: {
      target: '_self',
    },
    redirectCode: 302
  })
}

interface IResponse {
  success: boolean
  data: UserType
}

onMounted(async () => {
  if (route.query.token) {
    try {
      googleLoading.value = true
      const token = route.query.token as string
      useCookie("token").value = token;
      const response = await $fetch<IResponse>(getBaseUrl(1, RouteEnum.Me), {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `bearer ${token}`
        }
      });
      useCookie("user").value = JSON.stringify(response.data)
    } catch (e) {
      googleLoading.value = false
      useHandleError(e)
    } finally {
      googleLoading.value = false
      navigateTo('/')
    }
  }
})
</script>

<template>
  <div
      class="min-h-screen bg-white dark:bg-neutral-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">

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
            size="md"
        />
        <CustomButton
            labelKey="Gmail"
            iconName="lucide:chrome"
            type="button"
            class="w-full"
            variant="border"
            size="md"
            :loading="googleLoading"
            @click="handleGoogleLogin"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>