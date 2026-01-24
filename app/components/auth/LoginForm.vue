<script setup lang="ts">
import BaseInput from "~/components/BaseInput.vue";
import CustomButton from "~/components/CustomButton.vue";
import {RouteEnum} from "~/utils/api";

const emailValue = ref<string>('');
const passwordValue = ref<string>('');
const isLoading = ref(false);
const isDisabled = computed(() => {
  return !emailValue.value || !passwordValue.value
})
const handelLogin = async (e: SubmitEvent) => {
  const formData = new FormData(e.currentTarget as HTMLFormElement);
  isLoading.value = true;
  /*const res = await $fetch(getBaseUrl(1, RouteEnum.Login), {
    headers: {
      Accept: "application/json",
    },
    method: "POST"
  })*/
}
</script>

<template>
  <form
      @submit.prevent="handelLogin"
      class="my-6 w-full rounded">
    <BaseInput
        v-model="emailValue"
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
    <CustomButton
        label-key="submit"
        icon-name="lucide:arrow-right"
        type="submit"
        :loading="isLoading"
        :disabled="isDisabled"
        variant="primary"
    />
  </form>
</template>

<style scoped></style>
