import {handleError} from "vue";

export const useFileUploader = () => {
    const isUploading = ref(false)
    const error = ref<any>(null)
    const token = useCookie("token").value
    /**
     * @param file The binary File object
     * @param endpoint The API route (RouteEnum)
     * @param additionalData Optional text fields to include
     */
    const upload = async <T>(
        file: File | null,
        endpoint: string,
        additionalData: Record<string, any> = {}
    ): Promise<T | null> => {
        isUploading.value = true
        error.value = null

        try {
            const formData = new FormData()
            if (file) {
                formData.append('file', file)
            }
            Object.keys(additionalData).forEach((key) => {
                formData.append(key, additionalData[key])
            })
            return await $fetch<T>(endpoint, {
                method: 'POST',
                headers: {
                    Accept: "application/json",
                    Authorization: `bearer ${token}`
                },
                body: formData,
            })
        } catch (err: any) {
            error.value = err
            handleError(err)
            console.error('Upload Error:', err)
            return null
        } finally {
            isUploading.value = false
        }
    }

    return {
        upload,
        isUploading,
        error
    }
}