import Pusher from "pusher-js";
import Echo from "laravel-echo";

export default defineNuxtPlugin(() => {
    (window as any).Pusher = Pusher;
    const baseUrl = useRuntimeConfig().public.broadCastUrl;

    const echo = new Echo({
        broadcaster: 'reverb',
        key: "ytouo6o5pcdpv4gjqwfl",
        wsHost: "192.168.1.144",
        wsPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel: any) => {
            return {
                authorize: async (socketId: string, callback: Function) => {
                    const token = useCookie("token").value;
                    try {
                        const response = await $fetch<any>(`${baseUrl}/broadcasting/auth`, {
                            method: 'POST',
                            headers: {
                                Accept: "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: {
                                socket_id: socketId,
                                channel_name: channel.name
                            }
                        });
                        callback(null, response);
                    } catch (error) {
                        callback(error as Error, null);
                    }
                }
            };
        },
    });

    return {
        provide: { echo },
    };
});