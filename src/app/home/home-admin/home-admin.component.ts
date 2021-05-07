import { Component, OnInit } from '@angular/core';
import { Observable, observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CategoryService } from 'src/app/teams/category.service';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';
import { User } from 'src/app/users/interfaces/user';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
})
export class HomeAdminComponent implements OnInit {

  constructor(
    public userService: UserService,
    public teamService: TeamService,
    public categoryService: CategoryService
  ) { }

  totalUsers: number;
  totalUsersAdmin: number;
  totalUsersCoordinator: number;
  totalUsersMember: number;
  totalTeams: number;
  totalCategories: number;

  ngOnInit(): void {
    this.userService.getUsers().subscribe(
      users => {
        this.totalUsers = users.length;
        this.totalUsersAdmin = users.filter(user => user.role == 'admin').length;
        this.totalUsersCoordinator = users.filter(user => user.role == 'coordinator').length;
        this.totalUsersMember = users.filter(user => user.role == 'member').length;
      }
    );

    this.teamService.getTeams(true).subscribe(
      teams => this.totalTeams = teams.length
    );

    this.categoryService.getCategories().subscribe(
      categories => this.totalCategories = categories.length
    );

  }

}
