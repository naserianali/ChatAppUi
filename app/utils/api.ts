export enum RouteEnum {
    Login = 'login',
    Me = 'me',
    GoogleLogin = 'googleLogin',
    ConversationList = "conversationList",
    ContactList = "contactList",
    CreateContact = "createContact",
    GetConversation = "getConversation",
    SendMessage = "sendMessage",
    UpdateProfile = "updateProfile",
    UploadMedia = "uploadMedia",
    MarkAsRead = "markAsRead",
    GetReplayPage = "getReplayPage",
    Subscribe = "subscribe"
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
    [RouteEnum.Me]: "auth/me",
    [RouteEnum.GoogleLogin]: "auth/google",
    [RouteEnum.ContactList]: "application/contacts",
    [RouteEnum.CreateContact]: "application/contacts",
    [RouteEnum.ConversationList]: "application/conversations",
    [RouteEnum.GetConversation]: "application/conversations/{conversationId}/messages",
    [RouteEnum.SendMessage]: "application/conversations/{conversationId}/messages",
    [RouteEnum.GetReplayPage]: "application/conversations/{conversationId}/messages/{messageId}/replay-page",
    [RouteEnum.MarkAsRead]: "application/conversations/{conversationId}/messages/{messageId}/read",
    [RouteEnum.UpdateProfile]: "application/profile",
    [RouteEnum.UploadMedia]: "application/media",
    [RouteEnum.Subscribe]: "application/subscribe",
}