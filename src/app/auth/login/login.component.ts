import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../../message.service';
import { AuthService} from '../auth.service';
import { Location } from "@angular/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private location: Location,
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const username = this.loginForm.get('username').value;
    const password = this.loginForm.get('password').value;

    const credentials = { 
      username: username,
      password: password
    };

    this.authService.login(credentials)
  }

  logout(): void {
    this.authService.logout()
  }

  goBack(): void {
    this.location.back();
  }

}
