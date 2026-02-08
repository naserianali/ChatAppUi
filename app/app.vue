<template>
  <NuxtLayout>
    <LanguageSwitcher/>
    <NuxtLoadingIndicator/>
    <NuxtRouteAnnouncer/>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup>
import { usePresenceStore } from "~/stores/presence.ts";
import { useEventListener } from "@vueuse/core";

const { $echo } = useNuxtApp()
const presenceStore = usePresenceStore()
const token = useCookie("token")

const joinChannel = () => {
  if (!$echo || !token.value) return

  $echo.join('online')
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
      joinChannel();
    }
  });
})

onBeforeUnmount(() => {
  $echo.leave('online')
})
</script>
