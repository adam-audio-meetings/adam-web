import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/users/interfaces/user';
import { ROLES_SIGIN } from 'src/app/users/mocks/user-signin-roles';
import { UserService } from 'src/app/users/user.service';
import { Location } from "@angular/common";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private location: Location
  ) { }

  user: User;

  roles = ROLES_SIGIN;

  userForm = this.fb.group({
    _id: [null],
    role: ['member', Validators.required],
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    email: ['', [Validators.email, Validators.required]],
  });

  id: string = this.route.snapshot.paramMap.get('id');

  resetButtonText: string = "Limpar";
  backButtonText: string = "Cancelar";


  ngOnInit(): void {
  }

  ngAfter(): void {
    this.userForm.reset();
  }

  onSubmit() {
    this.userService.signinUser(this.userForm.value)
  }

  onReset(): void {
    this.userForm.reset();
    this.userForm.controls['role'].setValue('member');
  }

  goBack(): void {
    this.onReset();
    this.location.back();
  }



}
