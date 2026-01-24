// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    css: [
        "./app/assets/css/main.css",
    ],
    future: {
        compatibilityVersion: 4
    },
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},

    runtimeConfig: {
        public: {
            apiBase: "http://localhost:8000/api",
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
        ]
    }
})
