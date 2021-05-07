import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';

@Component({
  selector: 'app-home-member',
  templateUrl: './home-member.component.html',
  styleUrls: ['./home-member.component.css']
})
export class HomeMemberComponent implements OnInit {

  constructor(
    public teamService: TeamService,
  ) { }

  totalTeams: number;
  teams: Team[];

  ngOnInit(): void {
    this.teamService.getOwnTeams().subscribe(
      teams => this.totalTeams = teams.length
    );

  }

}
