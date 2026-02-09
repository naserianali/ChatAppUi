<script setup lang="ts">
import {useDark, useToggle, onClickOutside} from '@vueuse/core'
import {getBaseUrl, RouteEnum} from "~/utils/api"
import {useFileUploader} from "~/composables/useFileUploader"
import {handleError} from "vue"

const {$subscribePush} = useNuxtApp();
const isSubscribed = ref(false);
const notificationPermission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'default');

const toggleNotifications = async () => {
  if (isSubscribed.value) {
    isSubscribed.value = false;
    const registration = await navigator.serviceWorker?.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
    return;
  }

  const permission = await Notification.requestPermission();
  notificationPermission.value = permission;

  if (permission === 'granted') {
    await $subscribePush();
    isSubscribed.value = true;
  }
};

onMounted(() => {
  if (notificationPermission.value === 'granted') {
    isSubscribed.value = true;
    $subscribePush();
  }
});

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'vueuse-color-scheme',
})
const toggleTheme = useToggle(isDark)

const {locale, locales, setLocale, t} = useI18n()
const isOpen = ref(false)
const target = ref(null)

onClickOutside(target, () => (isOpen.value = false))

const availableLocales = computed(() => {
  return (locales.value as any[]).map(l => ({
    code: l.code,
    name: l.name,
    dir: l.dir || 'ltr'
  }))
})

const changeLang = async (code: "fa" | "en") => {
  if (locale.value === code) {
    isOpen.value = false
    return
  }
  await setLocale(code)
  isOpen.value = false
}

const {upload, isUploading} = useFileUploader()
const fileInput = ref<HTMLInputElement | null>(null)
const user = useCookie("user").value as any;
const token = useCookie("token").value

interface ProfileForm {
  avatar_url: string | null;
  avatar: File | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
}

const initialData = {
  avatar_url: (user && user.profile && user.profile.avatar) ? user.profile?.avatar?.url : null,
  avatar: null,
  username: (user && user.profile) ? user.profile.username : null,
  first_name: user ? user.first_name : null,
  last_name: user ? user.last_name : null,
  bio: user ? user.profile.bio : null
}

const form = ref<ProfileForm>({...initialData})
const hasChanges = computed(() => JSON.stringify(form.value) !== JSON.stringify(initialData))

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const [file] = target.files
    if (!file)
      return
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
    if (key === "avatar" && form.value[key]) {
      try {
        const file = await upload(form.value[key], getBaseUrl(1, RouteEnum.UploadMedia))
        formData.append(key + "_id", file.data.id);
      } catch (error) {
        isSubmitting.value = false
      }
    }
    if (form.value[key] !== initialData[key] && !avatarKeys.includes(key)) {
      formData.append(key, form.value[key])
    }
  }

  try {
    const response = await $fetch(getBaseUrl(1, RouteEnum.UpdateProfile), {
      method: "post",
      headers: {Authorization: `bearer ${token}`, Accept: "application/json"},
      body: formData
    });
    useCookie("user").value = response.data
    isSubmitting.value = false
  } catch (error) {
    handleError(error)
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 p-2 relative">
    <div class="absolute end-0 top-0 z-50 flex items-center gap-2">
      <CustomButton
          labelKey=""
          :iconName="isSubscribed ? 'lucide:bell' : 'lucide:bell-off'"
          type="button"
          variant="ghost"
          size="icon"
          @click="toggleNotifications"
          :class="[
            isSubscribed
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-neutral-400 hover:text-neutral-600'
          ]"
      />

      <CustomButton
          labelKey=""
          :iconName="isDark ? 'lucide:moon' : 'lucide:sun'"
          type="button"
          variant="ghost"
          size="icon"
          @click="toggleTheme()"
      />

      <div ref="target" class="relative">
        <CustomButton
            @click="isOpen = !isOpen"
            :label-key="locale"
            icon-name="material-symbols:language"
            variant="ghost"
            size="icon"
            class="uppercase tracking-wide"
        />
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-1 scale-95"
        >
          <div
              v-if="isOpen"
              class="absolute end-0 top-full mt-2 z-[100] min-w-[150px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl shadow-black/10 backdrop-blur-md overflow-hidden"
          >
            <div class="flex flex-col p-1">
              <button
                  v-for="loc in availableLocales"
                  :key="loc.code"
                  @click="changeLang(loc.code as 'fa' | 'en')"
                  class="group w-full text-start px-3 py-2.5 text-sm rounded-lg flex items-center justify-between gap-4 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  :class="[
                    locale === loc.code
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-700 dark:text-neutral-300'
                  ]"
              >
                <span class="font-medium">{{ loc.name }}</span>
                <Icon v-if="locale === loc.code" name="material-symbols:check-circle-rounded" class="w-4 h-4 shrink-0"/>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="flex flex-col items-center gap-4 mt-8">
      <div
          @click="triggerFileInput"
          class="relative size-24 md:size-32 rounded-full cursor-pointer group"
      >
        <div
            class="w-full h-full rounded-full overflow-hidden border-4 border-primary-500/20 shadow-xl bg-neutral-100 dark:bg-neutral-800">
          <NuxtPicture :imgAttrs="{ class:'w-full h-full object-cover' }" format="webp,avif" :src="form.avatar_url"
                       alt="Profile"/>
        </div>
        <div
            class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Icon name="lucide:camera" class="size-8 text-white"/>
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange"/>
      </div>
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ t('Click photo to change') }}
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput v-model="form.first_name" :labelKey="t('First Name')" iconName="lucide:user"/>
        <BaseInput v-model="form.last_name" :labelKey="t('Last Name')" iconName="lucide:user"/>
      </div>
      <BaseInput v-model="form.username" :labelKey="t('Username')" iconName="lucide:at-sign"/>
      <BaseInput v-model="form.bio" :labelKey="t('Bio')" iconName="lucide:quote"/>
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