import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map, tap, retry } from 'rxjs/operators';
import { Team } from "./interfaces/team";
import { environment } from 'src/environments/environment';
import { MessageService } from '../message.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // Authorization: '...'
    })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  private teamsUrl = environment.apiUrl + "teams";

  getTeams(auth: boolean): Observable<Team[]> {
    let url: string;
    if (auth) {
      url = this.teamsUrl;
    } else {
      url = this.teamsUrl + '-noauth'
    }
    return this.http.get<Team[]>(url)
      .pipe(
        tap(_ => this.log('fetched teams')),
        catchError(this.handleError<Team[]>('getTeams', []))
      )
  }

  getOwnTeams(): Observable<Team[]> {
    const url = this.teamsUrl + '/own'
    return this.http.get<Team[]>(url)
      .pipe(
        tap(_ => this.log('fetched teams of the user')),
        catchError(this.handleError<Team[]>('getOwnTeams', []))
      )
  }

  getAvailableTeams(): Observable<Team[]> {
    const url = this.teamsUrl + '/available'
    return this.http.get<Team[]>(url)
      .pipe(
        tap(_ => this.log('fetched available teams for the user')),
        catchError(this.handleError<Team[]>('getAvailableTeams', []))
      )
  }

  getTeam(id: string): Observable<Team> {
    const url = `${this.teamsUrl}/${id}`;
    return this.http.get<Team>(url)
      .pipe(
        tap(_ => this.log(`fetched team id=${id}`)),
        catchError(this.handleError<Team>(`getTeam id=${id}`))
      );
  }

  searchTeams(term: string): Observable<Team[]> {
    if (!term.trim()) {
      return of([])
    }
    const url = `${this.teamsUrl}/search?name=${term}&description=${term}`;
    return this.http.get<Team[]>(url)
      .pipe(
        tap(x => x.length ?
          this.log('found teams') :
          this.log('not found')),
        catchError(this.handleError<Team[]>('searchTeams', []))
      )
  }

  updateTeam(team: Team): Observable<Team> {
    // httpOptions.headers =
    //   httpOptions.headers.set('Authorization', 'my-new-auth-token');
    const id = team._id;
    const url = `${this.teamsUrl}/${id}`;
    return this.http.put<Team>(url, team)
      .pipe(
        tap(_ => this.log(`updated team id=${id}`)),
        catchError(this.handleError<Team>(`updateTeam id=${id}`))
      );
  }

  createTeam(team: Team): Observable<Team> {

    return this.http.post<Team>(this.teamsUrl, team, this.httpOptions)
      .pipe(
        tap((newTeam: Team) => this.log(`added team id=${newTeam._id}`)),
        catchError(this.handleError<Team>(`createTeam`))
      );
  }

  deleteTeam(id: string): Observable<{}> {
    /** TODO: confirm deletion */
    /** TODO: logic deletion */
    const url = `${this.teamsUrl}/${id}`;
    return this.http.delete(url)
      .pipe(
        tap(_ => this.log(`deleted team id=${id}`)),
        catchError(this.handleError(`deleteTeam id=${id}`))
      );
  }

  subscribeToTeam(id: string): Observable<{}> {
    const url = `${this.teamsUrl}/subscribe`;
    const team = {
      teamId: id
    }
    return this.http.post(url, team)
      .pipe(
        tap(_ => this.log(`subscribed to team id=${id}`)),
        catchError(this.handleError(`subscribeToTeam id=${id}`))
      );
  }

  unsubscribeFormTeam(id: string): Observable<{}> {
    const url = `${this.teamsUrl}/unsubscribe`;
    const team = {
      teamId: id
    }
    return this.http.post(url, team)
      .pipe(
        tap(_ => this.log(`unsubscribed team id=${id}`)),
        catchError(this.handleError(`unsubscribeFromTeam id=${id}`))
      );
  }

  /** Log a message with the service */
  private log(message: string): void {
    this.messageService.add(`[TeamService] ${message}`);
  }

  /**
  * based on: https://angular.io/tutorial/toh-pt6#error-handling
  * Handle Http operation that failed.
  * Let the app continue.
  * @param operation - name of the operation that failed
  * @param result - optional value to return as the observable result
  */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for team consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
