import { Team } from '../../teams/interfaces/team';

export interface User {
  _id?: string,
  role: string,
  name: string,
  avatar?: string,
  username: string,
  password?: string,
  email: string,
  teams?: Team[]
}