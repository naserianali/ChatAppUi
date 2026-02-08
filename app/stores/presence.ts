import { defineStore } from 'pinia'

export const usePresenceStore = defineStore('presence', () => {
    const onlineUserIds = ref<Set<string>>(new Set())
    const localLastSeenUpdates = ref<Record<string, string>>({})

    function updateLastSeenLocal(userId: string, timestamp: string) {
        localLastSeenUpdates.value[userId] = timestamp
    }

    function isOnline(userId: string | number | undefined) {
        if (!userId) return false
        return onlineUserIds.value.has(String(userId))
    }

    function setOnlineUsers(users: any[]) {
        onlineUserIds.value = new Set(users.map(u => String(u.id)))
    }

    function addOnlineUser(user: any) {
        const newSet = new Set(onlineUserIds.value)
        newSet.add(String(user.id))
        onlineUserIds.value = newSet
    }

    function removeOnlineUser(user: any) {
        const newSet = new Set(onlineUserIds.value)
        newSet.delete(String(user.id))
        onlineUserIds.value = newSet
    }

    return {
        onlineUserIds,
        localLastSeenUpdates,
        updateLastSeenLocal,
        isOnline,
        setOnlineUsers,
        addOnlineUser,
        removeOnlineUser
    }
})