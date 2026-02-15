<template>
  <NuxtLayout>
    <NuxtPwaManifest/>
    <LanguageSwitcher/>
    <NuxtLoadingIndicator/>
    <NuxtRouteAnnouncer/>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {useDark, useEventListener} from "@vueuse/core";
import {usePresenceStore} from "~/stores/presence";


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
</script>