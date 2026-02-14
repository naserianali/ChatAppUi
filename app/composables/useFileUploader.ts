import {useHandleError} from "~/utils/HandleError";
import { v4 as uuidv4 } from 'uuid';

export const useFileUploader = () => {
    const isUploading = ref(false)
    const progress = ref(0)
    const error = ref<any>(null)
    const token = useCookie("token").value
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const upload = async <T>(
        file: File,
        endpoint: string,
        additionalData: Record<string, any> = {}
    ): Promise<T | null> => {
        isUploading.value = true
        error.value = null
        progress.value = 0
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
        const dzuuid = uuidv4()
        let lastResponse: T | null = null
        try {
            for (let index = 0; index < totalChunks; index++) {
                const start = index * CHUNK_SIZE
                const end = Math.min(start + CHUNK_SIZE, file.size)
                const chunk = file.slice(start, end)
                const formData = new FormData();
                formData.append("file", chunk);
                formData.append('dzuuid', dzuuid.toString());
                formData.append('dzchunkindex', index.toString());
                formData.append('dztotalchunkcount', totalChunks.toString());
                formData.append('dzfilename', file.name)
                Object.keys(additionalData).forEach((key) => {
                    formData.append(key, additionalData[key])
                })
                lastResponse = await $fetch<T>(endpoint, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                })
                progress.value = Math.floor(((index + 1) / totalChunks) * 100)
            }
            return lastResponse
        } catch (err: any) {
            error.value = err
            useHandleError(err)
            console.error('Upload Error:', err)
            return null
        } finally {
            isUploading.value = false
        }
    }

    return {
        upload,
        isUploading,
        progress,
        error
    }
}