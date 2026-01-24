<script setup lang="ts">
interface Props {
  labelKey: string
  iconName: string
  type: "button" | "submit"
  loading: boolean,
  disabled: boolean,
  variant: "primary" | "secondary" | "border"
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  loading: false,
  disabled: false,
})

const isDisabled = computed(() => props.disabled || props.loading)

const variantClasses = computed(() => {
  if (props.variant === 'primary') {
    return isDisabled.value
        ? 'bg-gray-300 text-white cursor-not-allowed'
        : 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer'
  } else if (props.variant === 'secondary') {
    return isDisabled.value
        ? 'bg-gray-300 text-white cursor-not-allowed'
        : 'bg-secondary-500 text-white hover:bg-secondary-600 cursor-pointer'
  }
  return isDisabled.value
      ? 'border border-gray-300 text-white cursor-not-allowed'
      : 'border border-gray-300 text-black cursor-pointer'
})
const {t} = useI18n()
</script>

<template>
  <button :disabled="disabled" :type="type"
          :class="variantClasses"
          class="flex items-center disabled disabled:bg-gray-300 justify-center w-full mt-4 p-2 text-center rounded gap-2 h-10">
    <span v-if="!loading">{{ t(labelKey) }}</span>
    <Icon v-if="!loading" :name="iconName" class="size-4 mt-1"/>
    <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin size-4"/>
  </button>
</template>

<style scoped></style>
