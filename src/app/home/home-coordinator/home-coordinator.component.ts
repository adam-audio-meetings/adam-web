import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';

@Component({
  selector: 'app-home-coordinator',
  templateUrl: './home-coordinator.component.html',
  styleUrls: ['./home-coordinator.component.css']
})
export class HomeCoordinatorComponent implements OnInit {

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
