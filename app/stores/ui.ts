import {defineStore} from 'pinia'
import type {UserType} from "~/types/user.type";

export const useUiStore = defineStore('ui', {
    state: () => ({
        sidebarView: 'conversations',
        activeChatId: null as string | null,
        user: {} as UserType,
        name: null as string | null,
        chatScrollPositions: {} as Record<string, number>,
        isInfoSidebarOpen: false,
        activeChatUser: null,
        messageCache: {} as Record<string, any[]>,
    }),
    actions: {
        setView(view: 'conversations' | 'contacts') {
            this.sidebarView = view
        },
        setActiveChat(id: string | null, user: UserType | null) {
            if (id === null) {
                this.activeChatId = null
                this.name = null
                this.user = {};
                this.isInfoSidebarOpen = false
                return
            }
            this.activeChatId = id;
            this.user = user;
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