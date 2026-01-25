<template>
  <div class="relative" ref="dropdown">
    <button
        @click="isOpen = !isOpen"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Icon name="material-symbols:language" class="w-4 h-4" />
      <span class="text-sm">{{ locale.toUpperCase() }}</span>
      <Icon name="material-symbols:keyboard-arrow-down" class="w-3 h-3" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
        enter-active-class="transition duration-100"
        enter-from-class="opacity-0 scale-95"
        leave-active-class="transition duration-75"
        leave-to-class="opacity-0 scale-95"
    >
      <div
          v-show="isOpen"
          class="absolute end-0 mt-1 w-32 rounded shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black/5 z-50"
      >
        <button
            v-for="loc in locales"
            :key="loc.code"
            @click="changeLang(loc.code)"
            class="w-full text-start px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
            :class="{ 'font-semibold': locale === loc.code }"
        >
          {{ loc.name }}
          <Icon v-if="locale === loc.code" name="material-symbols:check" class="w-3 h-3" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const { locale, locales, setLocale } = useI18n()
const isOpen = ref(false)
const dropdown = ref(null)

const changeLang = async (code) => {
  await setLocale(code)
  isOpen.value = false
  const loc = locales.value.find(l => l.code === code)
  if (loc && loc.dir) {
    document.documentElement.setAttribute('dir', loc.dir)
  }
}

// Close on click outside
const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  const loc = locales.value.find(l => l.code === locale.value)
  if (loc && loc.dir) {
    document.documentElement.setAttribute('dir', loc.dir)
  }

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>