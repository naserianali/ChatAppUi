<script setup lang="ts">
interface Props {
  labelKey: string
  iconName: string
  type?: string
  placeholder?: string
  modelValue?: string,
  mode?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  modelValue: '',
  mode: "text"
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const {t} = useI18n()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
const isPasswordVisible = ref(false);
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
</script>

<template>
  <div class="flex flex-col gap-y-1.5 my-1.5 ltr:text-start rtl:text-end">
    <span>{{ t(labelKey) }}</span>

    <label :for="labelKey" class="border border-neutral-300 rounded flex items-center gap-2 p-2">
      <span>
        <Icon :name="iconName" class="size-4 text-neutral-600 mt-1.5"/>
      </span>

      <input
          :id="labelKey"
          :name="labelKey"
          :type="inputType"
          :placeholder="placeholder"
          :value="modelValue"
          @input="handleInput"
          class="w-full outline-none bg-transparent"
      >
      <Icon @click="togglePassword" v-if="mode === 'password' " :name="eyeIcon"
            class="size-6 text-neutral-600 cursor-pointer"/>
    </label>
  </div>
</template>

<style scoped></style>