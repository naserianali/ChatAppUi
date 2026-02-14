<script setup lang="ts">
import BaseInput from "~/components/BaseInput.vue";
import CustomButton from "~/components/CustomButton.vue";
import {RouteEnum} from "~/utils/api";
import {useHandleError} from "~/utils/HandleError";

interface ILoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
    }
  };
}

const phoneValue = ref<string>('');
const passwordValue = ref<string>('');
const isLoading = ref(false);
const isDisabled = computed(() => {
  return !phoneValue.value || !passwordValue.value
})
const handelLogin = async (e: SubmitEvent) => {
  isLoading.value = true;
  try {
    const res = await $fetch<ILoginResponse>(getBaseUrl(1, RouteEnum.Login), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: {
        phone: phoneValue.value,
        password: passwordValue.value,
      }
    });
    isLoading.value = false;
    const cookie = useCookie('token')
    cookie.value = res.data.token
    const user = useCookie("user")
    user.value = JSON.stringify(res.data.user)
    phoneValue.value = ""
    passwordValue.value = ""
    navigateTo('/')
  } catch (err) {
    useHandleError(err)
    isLoading.value = false;
  }
}
</script>

<template>
  <form
      @submit.prevent="handelLogin"
      class="p-4 sm:p-6 w-full rounded-xl bg-transparent space-y-4">

    <BaseInput
        v-model="phoneValue"
        label-key="Phone Number"
        icon-name="lucide:phone"
        type="text"
        placeholder="09120000000"
    />

    <BaseInput
        v-model="passwordValue"
        label-key="Password"
        icon-name="lucide:lock"
        type="password"
        mode="password"
        placeholder="********"
    />

    <div class="pt-2">
      <CustomButton
          label-key="submit"
          icon-name="lucide:arrow-right"
          type="submit"
          class="w-full"
          :loading="isLoading"
          :disabled="isDisabled"
          variant="primary"
          size="md"
      />
    </div>
  </form>
</template>

<style scoped></style>