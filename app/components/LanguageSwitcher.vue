<template>
<!--  <div ref="target" class="absolute inline-block z-50 end-0 top-3">
    <button
        @click="isOpen = !isOpen"
        type="button"
        class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all
             hover:bg-neutral-100 dark:hover:bg-neutral-800
             active:scale-95 bg-transparent text-neutral-900 dark:text-neutral-100"
        :aria-expanded="isOpen"
    >
      <Icon name="material-symbols:language" class="w-5 h-5 text-neutral-500 dark:text-neutral-400"/>
      <span class="text-sm font-bold uppercase tracking-wide">{{ locale }}</span>
      <Icon
          name="material-symbols:keyboard-arrow-down"
          class="w-4 h-4 opacity-40 transition-transform duration-300"
          :class="{ 'rotate-180': isOpen }"
      />
    </button>

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
          class="absolute end-0 top-full mt-2 z-[100] min-w-[150px]
               bg-white dark:bg-neutral-900
               border border-neutral-200 dark:border-neutral-800
               rounded-xl shadow-2xl shadow-black/10
               backdrop-blur-md overflow-hidden"
      >
        <div class="flex flex-col p-1">
          <button
              v-for="loc in availableLocales"
              :key="loc.code"
              @click="changeLang(loc.code as 'fa' | 'en')"
              class="group w-full text-start px-3 py-2.5 text-sm rounded-lg flex items-center justify-between gap-4
                   transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              :class="[
                locale === loc.code
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-neutral-700 dark:text-neutral-300'
              ]"
          >
            <span class="font-medium">{{ loc.name }}</span>
            <Icon
                v-if="locale === loc.code"
                name="material-symbols:check-circle-rounded"
                class="w-4 h-4 shrink-0"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>-->
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
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

const currentLocaleData = computed(() =>
    availableLocales.value.find(l => l.code === locale.value)
)

watch(locale, () => {
  if (currentLocaleData.value) {
    useHead({
      htmlAttrs: {
        dir: currentLocaleData.value.dir,
        lang: currentLocaleData.value.code
      }
    })
  }
}, { immediate: true })

const changeLang = async (code: "fa" | "en") => {
  if (locale.value === code) {
    isOpen.value = false
    return
  }
  await setLocale(code)
  isOpen.value = false
}
</script>