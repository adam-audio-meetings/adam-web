import { User } from "src/app/users/interfaces/user";

export interface Audio {
    _id?: string,
    name?: string,
    transcription?: string,
    fileId?: string,
    created_at?: Date,
    duration?: number,
    team?: string,
    member?: string | any,
    listened_by?: string
}