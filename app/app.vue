<template>
  <NuxtLayout>
    <LanguageSwitcher/>
    <NuxtLoadingIndicator/>
    <NuxtRouteAnnouncer/>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {usePresenceStore} from "~/stores/presence.ts";
import {useDark, useEventListener} from "@vueuse/core";

const {$echo} = useNuxtApp()
const presenceStore = usePresenceStore()
const token = useCookie("token")
const router = useRouter()
const colorMode = useColorMode();

useHead({
  bodyAttrs: {
    class: computed(() => colorMode.value === 'dark' ? 'dark' : '')
  }
})
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
  initialValue: "auto",
  storageKey: 'vueuse-color-scheme',
})
useDark(isDark)
const logoutAndRedirect = () => {
  token.value = null
  router.push('/login')
}

const joinChannel = () => {
  if (!$echo || !token.value) return
  const channel = $echo.join('online')
      .error((error) => {
        if (error.status === 401 || error.status === 403) {
          console.warn("Presence Channel Auth Failed: Redirecting to login...")
          logoutAndRedirect()
        }
      })
      .here((users) => presenceStore.setOnlineUsers(users))
      .joining((user) => presenceStore.addOnlineUser(user))
      .leaving((user) => {
        presenceStore.removeOnlineUser(user);
        presenceStore.updateLastSeenLocal(user.id, new Date().toISOString());
      });
}

onMounted(() => {
  joinChannel();
  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      $echo.leave('online');
    } else {
      if (!token.value) {
        router.push('/login')
      } else {
        joinChannel();
      }
    }
  });

})

onBeforeUnmount(() => {
  $echo.leave('online')
})
</script>