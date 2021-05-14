import { User } from '../../users/interfaces/user';
import { Team } from '../../teams/interfaces/team';
import { Binary } from 'bson';

export interface Audio {
    _id?: string,
    name: string,
    created_at: Date
    team?: Team,
    member?: User,
}