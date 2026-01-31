
export enum RouteEnum {
    Login = 'login',
    ConversationList = "conversationList",
}

function getBaseRoute(){
    return useRuntimeConfig().public.apiBase;
}

export function getBaseUrl(version: number = 1, route: RouteEnum) {
    const url = getBaseRoute() + `/v${version}/`
    return url + (routes[route] ?? '')
}

export const routes = {
    [RouteEnum.Login]: "auth/login",
    [RouteEnum.ConversationList]: "application/conversations",
}