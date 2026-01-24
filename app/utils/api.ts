export const baseUrl = useRuntimeConfig().public.apiBase;

export enum RouteEnum {
    Login = 'login',
}

export function getBaseUrl(version: number = 1, route: RouteEnum) {
    const url = baseUrl + `/v${version}/`
    return url + (routes[route] ?? '')
}

export const routes = {
    [RouteEnum.Login]: "/auth/login",
}