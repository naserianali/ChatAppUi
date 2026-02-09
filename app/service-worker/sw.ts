import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
self.addEventListener('push', (event) => {
    if (!event.data) return

    const data = event.data.json()

    const options = {
        body: data.body,
        icon: data.icon || '/icon.png',
        badge: '/badge.png',
        data: {
            url: data.action_url || '/'
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        self.clients.openWindow(event.notification.data.url)
    )
})