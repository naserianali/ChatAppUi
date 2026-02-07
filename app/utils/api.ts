export enum RouteEnum {
    Login = 'login',
    ConversationList = "conversationList",
    ContactList = "contactList",
    CreateContact = "createContact",
    GetConversation = "getConversation",
    SendMessage = "sendMessage",
    UpdateProfile = "updateProfile",
    UploadMedia = "uploadMedia",
    MarkAsRead = "markAsRead",
}

function getBaseRoute() {
    return useRuntimeConfig().public.apiBase;
}

export function getBaseUrl(version: number = 1, route: RouteEnum, params?: Record<string, string | number>) {
    const url = getBaseRoute() + `/v${version}/`
    let path = routes[route] ?? ''
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            path = path.replace(`{${key}}`, String(value))
        })
    }

    return url + path
}

export const routes = {
    [RouteEnum.Login]: "auth/login",
    [RouteEnum.ContactList]: "application/contacts",
    [RouteEnum.CreateContact]: "application/contacts",
    [RouteEnum.ConversationList]: "application/conversations",
    [RouteEnum.GetConversation]: "application/conversations/{conversationId}/messages",
    [RouteEnum.SendMessage]: "application/conversations/{conversationId}/messages",
    [RouteEnum.MarkAsRead]: "application/conversations/{conversationId}/messages/{messageId}/read",
    [RouteEnum.UpdateProfile]: "application/profile",
    [RouteEnum.UploadMedia]: "application/media",
}