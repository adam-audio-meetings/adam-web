import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from "@angular/common";
import { Team } from '../interfaces/team';
import { TeamService } from "../team.service";
import { AuthService } from 'src/app/auth/auth.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  teams$: Observable<Team[]>;
  id: string = this.route.snapshot.paramMap.get('id');
  userRole: string = this.authService.userRole;
  currentRoute: string;
  isOwnTeams: boolean;
  title: string;
  teamFilterTerm: string = '';

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private location: Location,
    public authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getTeams();
    this.currentRoute = this.route.snapshot.routeConfig.path;
    if (!this.authService.isLoggedIn ||
      this.currentRoute == 'available' ||
      this.userRole == 'admin') {
      this.title = 'Times';
      this.isOwnTeams = false;
    } else {
      this.title = 'Meus Times';
      this.isOwnTeams = true;
    }
  }

  getTeams(): void {
    if (!this.userRole || this.userRole == 'admin') {
      this.teams$ = this.teamService.getTeams(this.authService.isLoggedIn);

      // only member and coordinator
    } else if (this.route.snapshot.routeConfig.path == "available") {
      this.teams$ = this.teamService.getAvailableTeams()
    } else {
      this.teams$ = this.teamService.getOwnTeams()
    }
  }

  deleteTeam(id: string): void {
    if (window.confirm('Confirma excluir?')) {
      this.teamService.deleteTeam(id)
        .subscribe(() => this.getTeams());
    }
  }

  subscribe(id: string): void {
    this.teamService.subscribeToTeam(id)
      .subscribe(() => this.getTeams());
  }

  unsubscribe(id: string): void {
    this.teamService.unsubscribeFormTeam(id)
      .subscribe(() => this.getTeams());
  }

  goBack(): void {
    this.location.back();
  }

}

