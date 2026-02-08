<script setup lang="ts">
interface Props {
  labelKey?: string
  iconName?: string
  type?: "button" | "submit"
  loading?: boolean
  disabled?: boolean
  skeleton?: boolean
  variant: "primary" | "secondary" | "border" | "ghost" | "danger" | "success" | "link"
  size: "sm" | "md" | "lg" | "icon"
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  loading: false,
  disabled: false,
  skeleton: false,
  size: "md"
})

const emit = defineEmits(['click'])
const {t} = useI18n()

const isDisabled = computed(() => props.disabled || props.loading || props.skeleton)

const variantClasses = computed(() => {
  if (props.skeleton) {
    return 'bg-neutral-200 dark:bg-neutral-800 animate-pulse pointer-events-none border-none'
  }

  const baseVariants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-sm shadow-primary-500/20',
    secondary: 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100',
    border: 'border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800',
    ghost: 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 bg-transparent',
    danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-sm shadow-red-500/10',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-sm shadow-emerald-500/10',
    link: 'text-primary-600 dark:text-primary-400 hover:underline bg-transparent !px-0 !h-auto !w-auto'
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 !w-10 !px-0 shrink-0'
  }

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none grayscale-[0.5] bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-600 border-none'

  return [
    isDisabled.value && !props.skeleton ? disabledStyles : baseVariants[props.variant],
    sizes[props.size]
  ].join(' ')
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
      'group relative flex items-center justify-center gap-2 rounded-xl transition-all duration-200 active:scale-[0.96] select-none',
      'font-bold overflow-hidden whitespace-nowrap',
      'ltr:flex-row rtl:flex-row-reverse',
      size !== 'icon' ? 'w-full sm:w-auto' : ''
    ]"
  >
    <div v-if="skeleton" class="flex items-center gap-2 opacity-0">
      <div class="size-4 bg-white/20 rounded-full"></div>
      <div class="w-12 h-2 bg-white/20 rounded"></div>
    </div>

    <template v-else-if="loading">
      <Icon name="lucide:loader-2" class="animate-spin size-4 md:size-5 shrink-0"/>
      <span v-if="size !== 'icon'" class="truncate">{{ t('loading') }}</span>
    </template>

    <template v-else>
      <Icon
          v-if="iconName"
          :name="iconName"
          :class="[
            'size-4 md:size-5 transition-transform group-hover:scale-110 shrink-0',
            iconName.includes('chevron') || iconName.includes('arrow') ? 'rtl:rotate-180' : ''
          ]"
      />
      <span v-if="labelKey && size !== 'icon'" class="truncate">
        {{ t(labelKey) }}
      </span>
    </template>

    <div v-if="skeleton" class="absolute inset-0 skeleton-shimmer"></div>
  </button>
</template>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

:dark .skeleton-shimmer {
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.02) 50%,
      transparent 100%
  );
}
</style>