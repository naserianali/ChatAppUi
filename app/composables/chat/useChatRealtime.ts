export const useChatRealtime = (
    state: {
        messages: Ref<any[]>,
        hasMoreNewer: Ref<boolean>,
        activeChatId: Ref<string | null>,
        user: any
    },
    actions: {
        handleMessageSent: () => void,
        scrollToBottom: (b: 'auto'|'smooth') => void
    }
) => {
    const { $echo } = useNuxtApp()

    const setupEcho = (id: string) => {
        $echo.private(`conversations.${id}`)
            .listen('.MessageSent', (e: any) => {
                const newMsg = e.message || e.data?.message || e.conversation?.last_message || e
                if (!newMsg || !newMsg.id) return

                if (state.hasMoreNewer.value) {
                    if (newMsg.sender_id === state.user?.id) {
                        actions.handleMessageSent()
                    }
                    return
                }

                const exists = state.messages.value.some(m => m.id === newMsg.id)
                if (exists) return

                state.messages.value.push(newMsg)

                if (newMsg.sender_id === state.user?.id || !state.hasMoreNewer.value) {
                    actions.scrollToBottom('smooth')
                }
            })
            .listen('.MessageReadEvent', (e: any) => {
                if (String(e.user_id) !== String(state.user?.id)) {
                    const readMsg = state.messages.value.find(m => m.id === e.message_id)
                    const readTime = readMsg ? new Date(readMsg.created_at).getTime() : 0

                    state.messages.value.forEach(msg => {
                        if (msg.sender_id === state.user?.id && !msg.read_at) {
                            const msgTime = new Date(msg.created_at).getTime()
                            if (msg.id === e.message_id || (readTime > 0 && msgTime <= readTime)) {
                                msg.read_at = e.read_at
                            }
                        }
                    })
                }
            })
    }

    const cleanupEcho = (id: string) => {
        if (id) $echo.leave(`conversations.${id}`)
    }

    return { setupEcho, cleanupEcho }
}