// stores/ui.ts
import {defineStore} from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        sidebarView: 'conversations',
        activeChatId: null as string | null,
    }),
    actions: {
        setView(view: 'conversations' | 'contacts') {
            this.sidebarView = view
        },
        setActiveChat(id: string | null) {
            this.activeChatId = id
        }
    },
})