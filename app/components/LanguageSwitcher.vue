<template>
  <div class="relative">
    <button
        @click="isOpen = !isOpen"
        class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :class="{ 'bg-gray-100 dark:bg-gray-800': isOpen }"
    >
      <Icon name="material-symbols:language" class="w-5 h-5" />
      <span class="text-sm font-medium">{{ currentLocale.name }}</span>
      <Icon
          name="material-symbols:keyboard-arrow-down"
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
    >
      <div
          v-show="isOpen"
          class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-50"
          :class="locale === 'ar' ? 'left-0 right-auto' : 'right-0'"
      >
        <div class="py-1">
          <button
              v-for="loc in availableLocales"
              :key="loc.code"
              @click="changeLanguage(loc.code)"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
              :class="{
              'bg-gray-50 dark:bg-gray-800': locale === loc.code,
              'font-semibold': locale === loc.code
            }"
          >
            <span>{{ loc.name }}</span>
            <Icon
                v-if="locale === loc.code"
                name="material-symbols:check"
                class="w-4 h-4 text-blue-600"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const isOpen = ref(false)

const availableLocales = computed(() => locales.value)
const currentLocale = computed(() => {
  return locales.value.find(l => l.code === locale.value) || locales.value[0]
})

const changeLanguage = async (code: string) => {
  await setLocale(code)
  isOpen.value = false

  // Update HTML attributes
  const html = document.documentElement
  const selectedLocale = locales.value.find(l => l.code === code)

  if (selectedLocale) {
    html.setAttribute('lang', code)
    html.setAttribute('dir', selectedLocale.dir || 'ltr')
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      isOpen.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// Set initial dir attribute
onMounted(() => {
  const html = document.documentElement
  const currentLoc = locales.value.find(l => l.code === locale.value)
  if (currentLoc) {
    html.setAttribute('dir', currentLoc.dir || 'ltr')
  }
})
</script>