export interface SocketMessage {
    type: string,
    text: string,
    userId: string,
    msgTime: string,
    audioId?: string
}