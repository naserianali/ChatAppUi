<script setup lang="ts">
import {RouteEnum} from "~/utils/api";
import {useHandleError} from "~/utils/HandleError";

const {t} = useI18n()
const emit = defineEmits(['success'])

const phoneNumber = ref('')
const loading = ref(false)

const handleAddContact = async () => {
  if (!phoneNumber.value) return

  loading.value = true
  try {
    const token = useCookie("token").value
    const response = await $fetch(getBaseUrl(1, RouteEnum.CreateContact), {
      method: "post",
      headers: {
        Authorization: `bearer ${token}`,
        Accept: "application/json"
      },
      body: {
        phone: phoneNumber.value
      }
    })
    await refreshNuxtData("contact-list")
    await new Promise(resolve => setTimeout(resolve, 1000))
    phoneNumber.value = ''
    emit('success')
  } catch (error) {
    useHandleError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-500">
      {{ t('Enter the phone number to start a conversation.') }}
    </p>

    <BaseInput
        v-model="phoneNumber"
        labelKey="Phone Number"
        type="tel"
        placeholder="09100229171"
        iconName="lucide:phone"
    />

    <div class="flex gap-2 pt-2">
      <CustomButton
          iconName=""
          labelKey="Cancel"
          variant="border"
          class="flex-1"
          @click="$emit('success')"
      />
      <CustomButton
          iconName=""
          labelKey="Add"
          variant="primary"
          class="flex-1"
          :loading="loading"
          @click="handleAddContact"
      />
    </div>
  </div>
</template>