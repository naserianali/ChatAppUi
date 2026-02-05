import {defineStore} from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        sidebarView: 'conversations',
        activeChatId: null as string | null,
        name: null as string | null
    }),
    actions: {
        setView(view: 'conversations' | 'contacts') {
            this.sidebarView = view
        },
        setActiveChat(id: string | null, name: string | null) {
            if (id === null){
                this.activeChatId = null
                this.name = null
                return
            }
            this.activeChatId = id;
            this.name = name;
        }
    },
})