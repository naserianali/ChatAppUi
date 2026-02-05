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
        'pinia-plugin-persistedstate/nuxt'
    ],
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
            apiBase: "http://localhost:4000/api",
            maxFileSize: 5 * 1024 * 1024,
        }
    },
    app: {
        head: {
            title: "Chat App",
            meta: [
                {charset: 'utf-8'},
                {name: "viewport", content: "width=device-width, initial-scale=1"},
                {name: "description", content: "Real Time Chat App"}
            ]
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
                dir: "ltr"
            },
            {
                code: 'fa',
                iso: 'fa-IR',
                name: 'فارسی',
                file: "fa.json",
                dir: "rtl"
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
