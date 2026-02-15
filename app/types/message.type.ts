import type {UserType} from "~/types/user.type";
import type {MediaType} from "~/types/media.type";

export default interface MessageType {
    id: string,
    created_at: string,
    body: string,
    message_reads: [],
    parent: MessageType,
    sender: UserType,
    sender_id: string,
    type: string
    media: MediaType[]
}