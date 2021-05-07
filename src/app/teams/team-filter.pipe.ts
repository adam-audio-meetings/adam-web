import { Pipe, PipeTransform } from '@angular/core';
import { Team } from './interfaces/team';

@Pipe({
  name: 'teamFilter'
})
export class TeamFilterPipe implements PipeTransform {

  getTeam(team: Team, term: string) {
    return team.name.toLowerCase().includes(term.toLowerCase())
  }

  transform(teams: Team[], term: string) {
    if (term === "") {
      return teams;
    }

    if (teams) {
      return teams.filter(team => this.getTeam(team, term));
    }
    else {
      return [];
    }
  }

}
