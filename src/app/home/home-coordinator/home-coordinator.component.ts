import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';
import { Audio } from '../interfaces/audio';
import { count } from 'console';
import { Observable } from 'rxjs';
import { AudioService } from '../audio.service';

@Component({
  selector: 'app-home-coordinator',
  templateUrl: './home-coordinator.component.html',
  styleUrls: ['./home-coordinator.component.css']
})
export class HomeCoordinatorComponent implements OnInit {

  constructor(
    public teamService: TeamService,
    public audioService: AudioService,
  ) { }

  totalTeams: number;
  totalMembers: number = 0;
  teams$: Observable<Team[]>;
  membersByTeams = [];

  audios$: Observable<Audio[]>;

  // google chart
  chartMembersByTeams = {
    title: 'Membros por Equipe',
    type: 'PieChart',
    data: this.membersByTeams,
    chartColumns: ['Equipe', 'Qtde Membros']
  }

  getAudios() {
    // TODO: implement
    this.audios$ = this.audioService.searchAudios('this.selectedTeamId', 'jsDateStringStart', 'jsDateStringEnd', true);
  }


  getTeams(): void {
    this.teams$ = this.teamService.getOwnTeams();
  }

  ngOnInit(): void {
    this.teamService.getOwnTeams().subscribe(
      teams => {
        this.teams$ = this.teamService.getOwnTeams();
        this.totalTeams = teams.length;
        teams.forEach(team => {
          this.membersByTeams.push([team.name, team.members.length]);
          this.totalMembers += team.members.length
        });
      }
    );

  }
}
