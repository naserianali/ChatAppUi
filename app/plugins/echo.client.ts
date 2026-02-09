import Pusher from "pusher-js";
import Echo from "laravel-echo";
import {usePresenceStore} from "~/stores/presence";

export default defineNuxtPlugin(() => {
    (window as any).Pusher = Pusher
    const baseUrl = useRuntimeConfig().public.broadCastUrl
    const token = useCookie("token").value
    const echo = new Echo({
        broadcaster: 'reverb',
        key: "ytouo6o5pcdpv4gjqwfl",
        wsHost: "192.168.1.144",
        wsPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${baseUrl}/broadcasting/auth`,
        withCredentials: true,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        },
    })
    return {
        provide: {echo},
    }
})