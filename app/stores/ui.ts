import {defineStore} from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        sidebarView: 'conversations',
        activeChatId: null as string | null,
        name: null as string | null,
        chatScrollPositions: {} as Record<string, number>,
        isInfoSidebarOpen: false,
        activeChatUser: null,
    }),
    actions: {
        setView(view: 'conversations' | 'contacts') {
            this.sidebarView = view
        },
        setActiveChat(id: string | null, name: string | null) {
            if (id === null) {
                this.activeChatId = null
                this.name = null
                this.isInfoSidebarOpen = false
                return
            }
            this.activeChatId = id;
            this.name = name;
        },
        setScrollPosition(chatId: string, position: number) {
            this.chatScrollPositions[chatId] = position
        },
        toggleInfoSidebar() {
            this.isInfoSidebarOpen = !this.isInfoSidebarOpen
        },
    },
})