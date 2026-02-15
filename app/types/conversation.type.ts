import type MessageType from "~/types/message.type";
import type {UserType} from "~/types/user.type";

export interface ConversationType {
    id: string
    type: string
    title: string
    message: MessageType
    updated_at: string
    users: UserType[]
    meta: ConversationMetaType
}

export interface ConversationMetaType {
    media_count: number
    files_count: number
    links_count: number
    voice_count: number
}