import {defineStore} from "pinia";
import type MessageType from "~/types/message.type";

export const useChatStore = defineStore('chat', {
    state: () => ({
        replyMessages: {} as Record<string, MessageType>
    }),
    actions: {
        setReplayMessage(conversationId: string, message: MessageType | null) {
            if (message === null) {
                delete this.replyMessages[conversationId]
            } else {
                this.replyMessages[conversationId] = message
            }
        }
    },
    getters: {
        getReplyForConversation: (state) => {
            return (conversationId: string): MessageType | null => {
                return state.replyMessages[conversationId] || null
            }
        }
    }
})