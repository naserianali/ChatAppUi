<script setup>
import {usePresenceStore} from "~/stores/presence.ts";

const {$echo} = useNuxtApp()
const presenceStore = usePresenceStore()
const token = useCookie("token")
const router = useRouter()

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
<template>
  <div id="layout" class="rtl:font-vazir h-dvh overflow-hidden">
    <slot />
  </div>
</template>

<style scoped></style>
