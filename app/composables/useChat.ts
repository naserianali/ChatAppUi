import {useChatScroll} from '~/composables/chat/useChatScroll'
import {useChatRealtime} from '~/composables/chat/useChatRealtime'
import {useChatActions} from "~/composables/chat/useChatActions";

export const useChat = (
    activeChatId: Ref<string | null>,
    messagesContainer: Ref<HTMLElement | null>
) => {
    const user = useCookie<any>('user').value
    const token = useCookie('token').value

    const messages = ref<any[]>([])
    const isLoading = ref(false)
    const isFetchingMore = ref(false)
    const nextCursor = ref<string | null>(null)
    const prevCursor = ref<string | null>(null)
    const hasMoreOlder = ref(false)
    const hasMoreNewer = ref(false)

    let readTimeout: any = null
    const pendingReadId = ref<string | null>(null)
    const {scrollToBottom, highlightMessage} = useChatScroll(messagesContainer)

    const {fetchMessages, markAsRead, handleJumpToParent} = useChatActions(
        {
            messages, activeChatId, token, nextCursor, prevCursor,
            hasMoreOlder, hasMoreNewer, isLoading, isFetchingMore
        },
        {scrollToBottom, highlightMessage},
        messagesContainer
    )

    const handleMessageSent = async () => {
        if (hasMoreNewer.value) {
            messages.value = []
            nextCursor.value = null
            prevCursor.value = null
            hasMoreOlder.value = false
            hasMoreNewer.value = false
            await fetchMessages(null)
        } else {
            scrollToBottom('smooth')
        }
    }

    const onMessageVisible = (messageId: string) => {
        const msg = messages.value.find(m => m.id === messageId)
        if (msg && msg.sender_id !== user?.id && !msg.read_at) {
            pendingReadId.value = messageId
            clearTimeout(readTimeout)
            readTimeout = setTimeout(() => {
                if (pendingReadId.value) {
                    markAsRead(pendingReadId.value)
                    pendingReadId.value = null
                }
            }, 500)
        }
    }

    const {setupEcho, cleanupEcho} = useChatRealtime(
        {messages, hasMoreNewer, activeChatId, user},
        {handleMessageSent, scrollToBottom}
    )

    watch(activeChatId, async (newId, oldId) => {
        if (oldId) cleanupEcho(oldId)

        messages.value = []
        nextCursor.value = null
        prevCursor.value = null
        hasMoreOlder.value = false
        hasMoreNewer.value = false

        if (newId) {
            isLoading.value = true
            try {
                await fetchMessages(null)
            } catch (error) {
                console.error("Error loading chat:", error)
            } finally {
                isLoading.value = false
            }
            setupEcho(newId)
        }
    }, {immediate: true})

    return {
        messages,
        isLoading,
        isFetchingMore,
        hasMoreOlder,
        hasMoreNewer,
        nextCursor,
        prevCursor,
        user,
        fetchMessages,
        handleMessageSent,
        onMessageVisible,
        handleJumpToParent
    }
}