// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    css: [
        "./app/assets/css/main.css",
    ],
    future: {
        compatibilityVersion: 4
    },
    modules: [
        '@nuxtjs/i18n',
        '@vueuse/nuxt',
        '@nuxt/icon',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
        '@nuxt/image',
        "@vite-pwa/nuxt",
    ],
    pwa: {
        strategies: 'injectManifest',
        srcDir: 'service-worker',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        manifest: {
            name: 'My Chat App',
            short_name: 'ChatApp',
            theme_color: '#ffffff',
            icons: [
                {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png'},
                {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png'}
            ]
        },
        injectManifest: {
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        },
        devOptions: {
            enabled: true,
            type: "module"
        },
        client: {
            installPrompt: true,
        }
    },
    pinia: {
        storesDirs: ['./app/stores/**'],
    },
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    vueuse: {
        autoImports: true,
    },
    runtimeConfig: {
        public: {
            apiBase: "http://192.168.0.189:8000/api",
            broadCastUrl: "http://192.168.0.189:8000",
            maxFileSize: 5 * 1024 * 1024,
            VAPID_PUBLIC: "BCn-FvfzQeiiaUunVS_vk-ZG2m-Oaf-WramJMJCr8B0c4gCup1KbX-HCswsR9yYJ5YN6r-1d82abvzdUU6LE1N0",
        },
    },
    app: {
        head: {
            title: "Chat App",
            meta: [
                {charset: 'utf-8'},
                {name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover"},
                {name: "description", content: "Real Time Chat App"}
            ],
        }
    },
    vite: {
        plugins: [
            tailwindcss()
        ],
        optimizeDeps: {
            include: ['vue-toastification'],
        },
    },
    i18n: {
        langDir: "locales",
        defaultLocale: "fa",
        defaultDirection: "rtl",
        strategy: 'no_prefix',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: "i18n_locale",
            redirectOn: "root",
            alwaysRedirect: false,
            fallbackLocale: "en",
        },
        locales: [
            {
                code: 'en',
                iso: 'en-US',
                name: "English",
                file: "en.json",
                dir: "ltr",
            },
            {
                code: 'fa',
                iso: 'fa-IR',
                name: 'فارسی',
                file: "fa.json",
                dir: "rtl",
            }
        ],

    },
    icon: {
        mode: "css",
        cssLayer: "base",
        serverBundle: {
            collections: [
                "lucide"
            ],
        }
    }
})