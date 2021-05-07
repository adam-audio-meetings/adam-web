import { User } from '../../users/interfaces/user';
import { Team } from '../../teams/interfaces/team';

export interface Audio {
    _id: string,
    name: string,
    created_at: Date,
    file: Blob,
    team?: Team,
    member?: User,
}