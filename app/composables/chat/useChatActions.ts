import {RouteEnum} from "~/utils/api"

interface ChatState {
    messages: Ref<any[]>
    activeChatId: Ref<string | null>
    token: string | null | undefined
    nextCursor: Ref<string | null>
    prevCursor: Ref<string | null>
    hasMoreOlder: Ref<boolean>
    hasMoreNewer: Ref<boolean>
    isLoading: Ref<boolean>
    isFetchingMore: Ref<boolean>
}

export const useChatActions = (
    state: ChatState,
    scroll: { scrollToBottom: (b: 'auto' | 'smooth') => void, highlightMessage: (id: string) => void },
    containerRef: Ref<HTMLElement | null>
) => {

    const fetchMessages = async (cursor: string | null = null, direction: 'up' | 'down' = 'up') => {
        if (!state.activeChatId.value || state.isFetchingMore.value) return

        const isInitial = !cursor && state.messages.value.length === 0
        if (isInitial) state.isLoading.value = true
        state.isFetchingMore.value = true

        try {
            const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetConversation, {conversationId: state.activeChatId.value}), {
                params: {cursor, per_page: 10, direction},
                headers: {Authorization: 'Bearer ' + state.token}
            })

            if (res?.data) {
                const container = containerRef.value
                const prevH = container?.scrollHeight || 0
                const prevT = container?.scrollTop || 0

                if (isInitial) {
                    state.messages.value = res.data.reverse()
                    state.nextCursor.value = res.meta?.next_cursor || res.pagination?.next_cursor
                    state.hasMoreOlder.value = !!state.nextCursor.value
                    state.hasMoreNewer.value = false
                    scroll.scrollToBottom('auto')
                } else if (direction === 'up') {
                    const newMsgs = res.data
                    state.messages.value = [...newMsgs.reverse(), ...state.messages.value]
                    state.nextCursor.value = res.meta?.next_cursor || res.pagination?.next_cursor
                    state.hasMoreOlder.value = !!state.nextCursor.value
                    await nextTick()
                    if (container) container.scrollTop = container.scrollHeight - prevH + prevT
                } else if (direction === 'down') {
                    const newMsgs = res.data
                    state.messages.value = [...state.messages.value, ...newMsgs]
                    state.prevCursor.value = res.meta?.next_cursor || res.pagination?.next_cursor
                    state.hasMoreNewer.value = !!state.prevCursor.value
                    if (!state.hasMoreNewer.value) scroll.scrollToBottom('smooth')
                }
            }
        } finally {
            state.isLoading.value = false
            state.isFetchingMore.value = false
        }
    }

    const markAsRead = async (messageId: string) => {
        if (!state.activeChatId.value) return
        try {
            await $fetch(getBaseUrl(1, RouteEnum.MarkAsRead, {
                conversationId: state.activeChatId.value,
                messageId: messageId
            }), {
                method: 'PATCH',
                headers: {Authorization: 'Bearer ' + state.token}
            })
            const msg = state.messages.value.find(m => m.id === messageId)
            if (msg) msg.read_at = new Date().toISOString()
        } catch (err) {
        }
    }

    const handleJumpToParent = async (parentId: string) => {
        const existingElement = document.getElementById(`msg-${parentId}`)
        if (existingElement) {
            scroll.highlightMessage(parentId)
            return
        }
        try {
            state.isLoading.value = true
            const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetReplayPage, {
                conversationId: state.activeChatId.value,
                messageId: parentId
            }), {headers: {Authorization: 'Bearer ' + state.token}})

            if (res?.success && res.data?.data) {
                state.messages.value = res.data.data
                state.nextCursor.value = res.data.meta.next_cursor
                state.prevCursor.value = res.data.meta.prev_cursor
                state.hasMoreOlder.value = !!res.data.meta.next_cursor
                state.hasMoreNewer.value = !!res.data.meta.prev_cursor
                scroll.highlightMessage(parentId)
            }
        } catch (e) {
            console.error(e)
        } finally {
            state.isLoading.value = false
        }
    }

    return {
        fetchMessages,
        markAsRead,
        handleJumpToParent
    }
}