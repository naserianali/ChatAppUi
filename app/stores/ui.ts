export const useUiStore = defineStore('ui', {
    state: () => ({
        sidebarView: 'conversations',
        activeChatId: null as string | null, // Track if a chat is open
    }),
    actions: {
        setView(view: 'conversations' | 'contacts') {
            this.sidebarView = view
        },
        setActiveChat(id: string | null) {
            this.activeChatId = id
        }
    }
})