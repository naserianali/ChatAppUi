<template>
  <div ref="target" class="relative inline-block">
    <button
        @click="isOpen = !isOpen"
        type="button"
        class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all
             hover:bg-gray-100 dark:hover:bg-gray-800
             active:scale-95 bg-transparent"
        :aria-expanded="isOpen"
    >
      <Icon name="material-symbols:language" class="w-5 h-5 text-gray-500" />
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
          class="absolute left-0 top-full mt-2 z-[100] min-w-[140px]
               bg-white dark:bg-gray-900
               border border-gray-200 dark:border-gray-800
               rounded-xl shadow-2xl shadow-black/10
               backdrop-blur-sm overflow-hidden"
      >
        <div class="flex flex-col p-1">
          <button
              v-for="loc in availableLocales"
              :key="loc.code"
              @click="changeLang(loc.code)"
              class="group w-full text-start px-3 py-2.5 text-sm rounded-lg flex items-center justify-between gap-4
                   transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-50 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400': locale === loc.code }"
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
  </div>
</template>

<script setup lang="ts">
/**
 * Requirements:
 * 1. npm install @vueuse/nuxt
 * 2. Add '@vueuse/nuxt' to modules in nuxt.config.ts
 */

const { locale, locales, setLocale } = useI18n()
const isOpen = ref(false)
const target = ref(null)

// Auto-imported by @vueuse/nuxt
onClickOutside(target, () => (isOpen.value = false))

const availableLocales = computed(() => {
  return (locales.value as any[]).map(l => ({
    code: l.code,
    name: l.name,
    dir: l.dir || 'ltr'
  }))
})

const changeLang = async (code: string) => {
  if (locale.value === code) return (isOpen.value = false)

  await setLocale(code)
  isOpen.value = false

  // Sync HTML direction (LTR/RTL)
  const selected = availableLocales.value.find(l => l.code === code)
  if (selected) {
    useHead({
      htmlAttrs: {
        dir: selected.dir,
        lang: selected.code
      }
    })
  }
}
</script>