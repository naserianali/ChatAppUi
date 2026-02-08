<script setup lang="ts">
interface Props {
  labelKey: string
  iconName: string
  type?: "button" | "submit"
  loading?: boolean
  disabled?: boolean
  variant: "primary" | "secondary" | "border",
  size: "sm" | "md" | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  loading: false,
  disabled: false,
  size: "md"
})
const emit = defineEmits(['click'])
const {t} = useI18n()
const isDisabled = computed(() => props.disabled || props.loading)
const variantClasses = computed(() => {
  const base = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 shadow-sm',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700 shadow-sm',
    border: 'border border-neutral-300 text-neutral-900 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800'
  }
  const size = {
    sm: 'md:h-7.5 h-8.5',
    md: 'md:h-10 h-9'
  }
  const disabledStyles = 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-none dark:bg-neutral-800 dark:text-neutral-600'
  return isDisabled.value ? disabledStyles + " " + size[props.size] : base[props.variant] + " " + size[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
      :disabled="isDisabled"
      :type="type"
      @click="handleClick"
      :class="[
      variantClasses,
      'group relative flex items-center justify-center gap-2 rounded transition-all duration-200 active:scale-[0.98]',
      'px-4 py-2 text-sm font-medium w-full sm:w-auto',
    ]"
  >
    <template v-if="loading">
      <Icon name="lucide:loader-2" class="animate-spin size-4 md:size-5"/>
      <span class="truncate">{{ t('Loading...') }}</span>
    </template>

    <template v-else>
      <Icon
          :name="iconName"
          class="size-4 md:size-5 transition-transform"
      />
      <span v-if="labelKey" class="truncate">{{ t(labelKey) }}</span>
    </template>
  </button>
</template>