import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { UserService } from '../user.service';

// based on https://angular.io/tutorial/toh-pt6#herosearchcomponent

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {

  users$: Observable<User[]>;
  private searchTerms = new Subject<string>();
  
  constructor(
    private userService: UserService
  ) { }

  // Push a search term into the observable stream
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.users$ = this.searchTerms.pipe(
      // delay Xms to consider the term
      debounceTime(300),

      // ignore consecutive repeated terms
      distinctUntilChanged(),

      // switch observable on each term changed
      switchMap((term: string) => 
        this.userService.searchUsers(term)),

    );
  }
}
