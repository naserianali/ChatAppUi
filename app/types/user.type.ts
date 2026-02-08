import type {MediaType} from "~/types/media.type";

export interface ProfileType {
    user_id: string
    username: string
    bio: string
    avatar: MediaType
}

export interface UserType {
    id: string
    name: string
    first_name: string
    last_name: string
    profile: ProfileType
    last_seen_at: string
}

