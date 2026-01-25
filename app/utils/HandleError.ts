import {useToast} from "vue-toastification";

export const useHandleError = (error: any) => {
  try {
    const toast = useToast();
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
