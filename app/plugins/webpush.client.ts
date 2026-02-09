export default defineNuxtPlugin(() => {
    const subscribePush = async () => {
        if (!("serviceWorker" in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const publicVapidKey = useRuntimeConfig().public.VAPID_PUBLIC;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            const supported = (window as any).PushManager?.supportedContentEncodings;
            const contentEncoding =
                (Array.isArray(supported) && supported[0]) || "aes128gcm";

            await $fetch(getBaseUrl(1, RouteEnum.Subscribe), {
                baseURL: useRuntimeConfig().public.apiBase,
                method: "POST",
                body: {
                    subscription: subscription.toJSON(),
                    contentEncoding,
                },
                headers: {
                    Authorization: `Bearer ${useCookie("token").value}`,
                },
            });

            console.log("Push Registered Successfully");
        } catch (error) {
            console.error("Push subscription failed:", error);
        }
    };

    return {provide: {subscribePush}};
});

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}