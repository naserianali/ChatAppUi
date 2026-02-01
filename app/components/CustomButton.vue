<script setup lang="ts">
interface Props {
  labelKey: string
  iconName: string
  type?: "button" | "submit"
  loading?: boolean
  disabled?: boolean
  variant: "primary" | "secondary" | "border"
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  loading: false,
  disabled: false,
})
const emit = defineEmits(['click'])
const { t } = useI18n()
const isDisabled = computed(() => props.disabled || props.loading)
const variantClasses = computed(() => {
  const base = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    border: 'border border-gray-300 text-black hover:bg-gray-50'
  }

  const disabledStyles = 'bg-gray-300 text-gray-500 cursor-not-allowed border-none'

  return isDisabled.value ? disabledStyles : base[props.variant]
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
      :class="[
      variantClasses,
      'flex items-center justify-center px-4 rounded gap-2 h-9 transition-colors duration-200 text-sm font-medium'
    ]"
      @click="handleClick"
  >
    <template v-if="loading">
      <Icon name="lucide:loader-2" class="animate-spin size-4" />
      <span>{{ t('Loading...') }}</span>
    </template>

    <template v-else>
      <Icon :name="iconName" class="size-4" />
      <span>{{ t(labelKey) }}</span>
    </template>
  </button>
</template>