import Pusher from "pusher-js";
import Echo from "laravel-echo";

export default defineNuxtPlugin(() => {
    (window as any).Pusher = Pusher
    const token = useCookie("token").value
    const echo = new Echo({
        broadcaster: 'reverb',
        key: "ytouo6o5pcdpv4gjqwfl",
        wsHost: "localhost",
        wsPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: 'http://localhost:4000/broadcasting/auth',
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