import { useHandleError } from "~/utils/HandleError";
import { v4 as uuidv4 } from 'uuid';

export const useFileUploader = () => {
    const isUploading = ref(false)
    const progress = ref(0)
    const error = ref<any>(null)
    const mediaId = ref<string | null>(null)
    const currentChunkIndex = ref(0) // Track current progress for resuming
    const token = useCookie("token").value
    const CHUNK_SIZE = 3 * 1024 * 1024;

    const upload = async <T>(
        file: File,
        endpoint: string,
        additionalData: Record<string, any> = {},
        resumeFromIndex = 0
    ): Promise<T | null> => {
        isUploading.value = true
        error.value = null
        mediaId.value = null
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
        const dzuuid = uuidv4()
        let lastResponse: any = null

        try {
            for (let index = resumeFromIndex; index < totalChunks; index++) {
                currentChunkIndex.value = index
                const start = index * CHUNK_SIZE
                const end = Math.min(start + CHUNK_SIZE, file.size)
                const chunk = file.slice(start, end)
                const formData = new FormData();
                formData.append("file", chunk);
                formData.append('dzuuid', dzuuid);
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
                    body: formData,
                })

                progress.value = Math.floor(((index + 1) / totalChunks) * 100)
            }
            if (lastResponse?.data) {
                mediaId.value = lastResponse.data.id
            }
            currentChunkIndex.value = 0
            return lastResponse
        } catch (err: any) {
            error.value = err
            return null
        } finally {
            isUploading.value = false
        }
    }

    return {
        upload,
        isUploading,
        progress,
        error,
        mediaId,
        currentChunkIndex
    }
}