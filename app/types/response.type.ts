export interface ResponseType<T> {
    success: boolean
    data: T
}

interface PaginationLinksType {
    url: string | null
    label: string
    active: boolean
}

export interface PaginationType {
    total: number
    count: number
    per_page: number
    current_page: number
    total_pages: number
    from: number
    to: number
    next_page_url: string | null
    prev_page_url: string | null
    path: string
    links: PaginationLinksType[]
    has_more_page: boolean
    on_last_page: boolean
}

export interface PaginationResponseType<T> {
    success: boolean
    data: T
    pagination: PaginationType
}

