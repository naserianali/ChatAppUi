import {defineStore} from 'pinia'
import type {UserType} from "~/types/user.type";
import type {ConversationMetaType} from "~/types/conversation.type";

export interface IUiState {
    sidebarView: string
    activeChatId: string | null,
    user: UserType | null
    name: string | null
    chatScrollPositions: Record<string, number>
    isInfoSidebarOpen: boolean
    activeChatUser: null
    conversationMeta: ConversationMetaType | null
    messageCache: Record<string, any[]>
}

export const useUiStore = defineStore('ui', {
    state: (): IUiState => ({
        sidebarView: 'conversations',
        activeChatId: null as string | null,
        user: null as UserType | null,
        name: null as string | null,
        chatScrollPositions: {} as Record<string, number>,
        isInfoSidebarOpen: false,
        activeChatUser: null,
        conversationMeta: null as ConversationMetaType | null,
        messageCache: {} as Record<string, any[]>,
    }),
    actions: {
        setView(view: 'conversations' | 'contacts') {
            this.sidebarView = view
        },
        setActiveChat(id: string | null, user: UserType | null, conversationMeta: ConversationMetaType | null) {
            if (id === null) {
                this.activeChatId = null
                this.name = null
                this.user = null;
                this.isInfoSidebarOpen = false
                this.conversationMeta = null
                return
            }
            this.activeChatId = id;
            this.user = user;
            this.conversationMeta = conversationMeta
        },
        setScrollPosition(chatId: string, position: number) {
            this.chatScrollPositions[chatId] = position
        },
        toggleInfoSidebar() {
            this.isInfoSidebarOpen = !this.isInfoSidebarOpen
        },
        setCachedMessages(id: string, messages: any[]) {
            this.messageCache[id] = messages;
        }
    },
})