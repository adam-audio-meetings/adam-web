import { Component, OnInit } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from './users/user.service';
import { User } from './users/interfaces/user';
import { take } from 'rxjs/operators';
// import { User } from './users/interfaces/user';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'adam-web';
  public isMenuCollapsed = true;
  roles$: Observable<any[]>;
  user$: Observable<User>;
  // user: User;

  imageUrl: Observable<string | null>;



  constructor(
    public authService: AuthService,
    public userService: UserService,
    public router: Router
  ) {


    // const ref = this.storage.ref('github.png');
    // this.imageUrl = ref.getDownloadURL();

  }

  ngOnInit(): void {
    // console.log('teste oninit app')
    if (this.authService.userId) {
      this.getUser();
      // console.log('get user logged in')
    }
  }

  getUser() {
    this.user$ = this.userService.getUser(this.authService.userId);
  }


}
