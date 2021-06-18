import { User } from "src/app/users/interfaces/user";

export interface Audio {
    _id?: string,
    name?: string,
    transcription?: string,
    created_at?: Date
    team?: string,
    member?: string | any,
    listened_by?:string
}