<script setup lang="ts">

interface Props {
  labelKey: string
  iconName: string
  type?: string
  placeholder?: string
  modelValue?: string,
  mode?: string,
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  modelValue: '',
  mode: "text",
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { t } = useI18n()

const isPasswordVisible = ref(false)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const inputType = computed(() => {
  if (props.mode === 'password') {
    return isPasswordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const eyeIcon = computed(() => {
  return isPasswordVisible.value ? 'lucide:eye-off' : 'lucide:eye'
})

const sizeClasses = computed(() => ({
  'p-1 text-xs': props.size === 'sm',
  'p-2 text-sm sm:p-2.5': props.size === 'md',
  'p-3 text-base sm:p-4': props.size === 'lg',
  'p-4 text-lg sm:p-5': props.size === 'xl'
}))
</script>

<template>
  <div class="flex flex-col w-full gap-1.5 ltr:text-start rtl:text-right">
    <label
        :for="labelKey"
        v-if="mode !== 'no-label'"
        class="text-neutral-700 dark:text-neutral-300 font-medium text-sm md:text-base transition-colors"
    >
      {{ t(labelKey) }}
    </label>

    <label
        :for="labelKey"
        class="group border border-neutral-300 dark:border-neutral-700 rounded flex items-center gap-2
             bg-white dark:bg-neutral-900 transition-all duration-200
             focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500"
        :class="sizeClasses"
    >
      <span class="flex items-center justify-center">
        <Icon
            :name="iconName"
            class="size-4 md:size-5 text-neutral-500 dark:text-neutral-400 group-focus-within:text-primary-500"
        />
      </span>

      <input
          :id="labelKey"
          :name="labelKey"
          :type="inputType"
          :placeholder="t(placeholder)"
          :value="modelValue"
          @input="handleInput"
          class="w-full outline-none bg-transparent text-neutral-900 dark:text-neutral-100
               placeholder-neutral-400 dark:placeholder-neutral-500"
      >

      <Icon
          v-if="mode === 'password'"
          @click="togglePassword"
          :name="eyeIcon"
          class="size-5 md:size-6 text-neutral-500 dark:text-neutral-400 cursor-pointer
               hover:text-neutral-700 dark:hover:text-neutral-200 select-none"
      />
    </label>
  </div>
</template>