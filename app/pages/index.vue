<template>
  <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-black" :dir="$i18n.locale === 'fa' ? 'rtl' : 'ltr'">

    <aside
        :class="[
        'border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0',
        uiStore.activeChatId ? 'hidden md:flex md:w-[350px] lg:w-[400px]' : 'flex w-full md:w-[350px] lg:w-[400px]'
      ]"
    >
      <IndexSidebar/>
    </aside>

    <main class="relative flex-1 min-w-0 bg-white dark:bg-gray-900 overflow-hidden">
      <div
          :class="[
          'h-full mx-auto transition-all duration-500 ease-in-out',
          uiStore.isInfoSidebarOpen ? 'max-w-full' : 'max-w-[800px] lg:max-w-[1000px]'
        ]"
      >
        <IndexChatContainer/>
      </div>
    </main>

    <div
        :class="[
        'transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 overflow-hidden shrink-0',
        uiStore.isInfoSidebarOpen ? 'w-[100px] lg:w-[380px]' : 'w-0'
      ]"
    >
      <div class="w-[380px]"> <IndexChatInfoSidebar/>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {useUiStore} from "~/stores/ui";
import {usePresenceStore} from "~/stores/presence.ts";

const {$echo} = useNuxtApp()
const presenceStore = usePresenceStore()
const token = useCookie("token")
const router = useRouter()
const uiStore = useUiStore()

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
definePageMeta({
  layout: "default"
})
</script>