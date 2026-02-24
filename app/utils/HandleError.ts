import Toast from 'vue-toastification'

export const useHandleError = (error: any) => {
  try {
    const { useToast } = Toast
    const errors = error?.data?.errors
    if (errors && typeof errors === 'object') {
      Object.keys(errors).forEach((key: string) => {
        errors[key].forEach((value: string) => {
          toast.error(value)
        })
      })
    } else {
      toast.error('خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.')
    }
  } catch {
    toast.error('خطای ناشناخته‌ای رخ داده است.')
  }
}
