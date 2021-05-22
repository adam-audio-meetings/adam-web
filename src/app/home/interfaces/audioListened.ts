import { User } from '../../users/interfaces/user';
import { Team } from '../../teams/interfaces/team';
import { Binary } from 'bson';

export interface AudioListened {
    _id?: string,
    // created_at: Date
    fileId: string,
    team?: string,
    member?: string,
}