import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from "@angular/common";
import { User } from '../interfaces/user';
import { ROLES } from '../mocks/user-roles';
import { UserService } from "../user.service";
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users$: Observable<User[]>;
  selectedId: string;
  roles = ROLES;
  roleFilter = "";
  // id: string = this.route.snapshot.paramMap.get('id');

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.users$ = this.userService.getUsers();
  }

  deleteUser(id: string): void {
    if (window.confirm('Confirma excluir?')) {
      this.userService.deleteUser(id)
        .subscribe(() => this.getUsers());
    }
  }

}
