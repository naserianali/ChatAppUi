<script setup lang="ts">
import {getBaseUrl, RouteEnum} from "~/utils/api";
import {useFileUploader} from "~/composables/useFileUploader";
import {handleError} from "vue";

const {t} = useI18n()
const {upload, isUploading} = useFileUploader()
const fileInput = ref<HTMLInputElement | null>(null)
const user = useCookie("user").value;
const token = useCookie("token").value
console.log(user)
const initialData = {
  avatar_url: (user && user.profile && user.profile.avatar) ? user.profile?.avatar?.url : null,
  avatar: null,
  username: (user && user.profile) ? user.profile.username : null,
  first_name: user ? user.first_name : null,
  last_name: user ? user.last_name : null,
  bio: user ? user.profile.bio : null
}
console.log(initialData)
const form = ref({...initialData})

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(initialData)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const [file] = target.files
    form.value.avatar_url = URL.createObjectURL(file)
    form.value.avatar = file
  }
}

const isSubmitting = ref(false)
const handleSave = async () => {
  isSubmitting.value = true
  const formData = new FormData();
  const avatarKeys = ["avatar", "avatar_url"]
  for (const key of Object.keys(form.value)) {
    if (key === "avatar") {
      try {
        const file = await upload(form.value[key], getBaseUrl(1, RouteEnum.UploadMedia))
        formData.append(key + "_id", file.data.id);
      } catch (error) {
        isSubmitting.value = false
      }
    }
    if (form.value[key] !== initialData[key] && !avatarKeys.includes(key))
      formData.append(key, form.value[key])
  }
  try {
    const response = await $fetch(getBaseUrl(1, RouteEnum.UpdateProfile), {
      method: "post",
      headers: {
        Authorization: `bearer ${token}`,
        Accept: "application/json"
      },
      body: formData
    });
    console.log(response.data);
    useCookie("user").value = JSON.stringify(response.data)
    isSubmitting.value = false
  } catch (error) {
    handleError(error)
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 p-2">
    <div class="flex flex-col items-center gap-4">
      <div
          @click="triggerFileInput"
          class="relative size-24 md:size-32 rounded-full cursor-pointer group"
      >
        <div
            class="w-full h-full rounded-full overflow-hidden border-4 border-primary-500/20 shadow-xl bg-neutral-100 dark:bg-neutral-800">
          <img :src="form.avatar_url" alt="Profile" class="w-full h-full object-cover"/>
        </div>

        <div
            class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Icon name="lucide:camera" class="size-8 text-white"/>
        </div>

        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
        />
      </div>

      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ t('Click photo to change') }}
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput v-model="form.first_name" labelKey="First Name" iconName="lucide:user"/>
        <BaseInput v-model="form.last_name" labelKey="Last Name" iconName="lucide:user"/>
      </div>
      <BaseInput v-model="form.username" labelKey="Username" iconName="lucide:at-sign"/>
      <BaseInput v-model="form.bio" labelKey="Bio" iconName="lucide:quote"/>
    </div>

    <div class="pt-4">
      <CustomButton
          labelKey="Save Changes"
          iconName="lucide:save"
          variant="primary"
          :disabled="!hasChanges"
          :loading="isSubmitting"
          @click="handleSave"
      />
    </div>
  </div>
</template>