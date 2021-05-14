import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from '../message.service';
import { Audio } from './interfaces/audio';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // Authorization: '...'
    })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    ) { }

  private audiosUrl = environment.apiUrl + 'audio-noauth'; // FIXME: alterar para "audios";

  getAudios(): Observable<Audio[]> {
    return this.http.get<Audio[]>(this.audiosUrl)
      .pipe(
        tap(_ => this.log('fetched audios')),
        catchError(this.handleError<Audio[]>('getAudios', []))
      )    
  }

  getAudio(id: string): Observable<Audio> {
    const url =  `${this.audiosUrl}/${id}`;
    return this.http.get<Audio>(url)
      .pipe(
        tap(_ => this.log(`fetched audio id=${id}`)),
        catchError(this.handleError<Audio>(`getAudio id=${id}`))
      );
  }

  searchAudios(term: string): Observable<Audio[]> {
    if(!term.trim()){
      return of([])
    }
    const url = `${this.audiosUrl}/search?role=${term}&name=${term}&audioname=${term}&email=${term}`;
    return this.http.get<Audio[]>(url)
      .pipe(
        tap(x => x.length ?
            this.log('found audios') :
            this.log('not found')),
        catchError(this.handleError<Audio[]>('searchAudios', []))
      )
  }

  updateAudio(audio: Audio): Observable<Audio> {
    // httpOptions.headers =
    //   httpOptions.headers.set('Authorization', 'my-new-auth-token');
    const id = audio._id;
    const url =  `${this.audiosUrl}/${id}`;
    return this.http.put<Audio>(url, audio)
      .pipe(
        tap(_ => this.log(`updated audio id=${id}`)),
        catchError(this.handleError<Audio>(`updateAudio id=${id}`))
      );
  }

  uploadAudio(file: File): Observable<Audio> {
  // uploadAudio(file: Audio): Observable<Audio> {
    const formData = new FormData();
    
    // files.forEach(file => formData.append('file', file, file.name));
    // file => formData.append('file', file, file.name);
    formData.append('file', file, file.name);
    formData.append("idTeam", "12");
    formData.append("idUser", "1236");
    const url = this.audiosUrl + '/upload';
    return this.http.post(url, formData)
      .pipe(
        tap((newAudio: Audio) => this.log(`added audio id=${newAudio._id}`)),
        catchError(this.handleError<Audio>(`createAudio`))
      );
  }

  // sem observable de Audio
  // uploadAudio(file: File) {
  //   const formData = new FormData();
  //   formData.append('file',file, file.name);
  //   const url = this.audiosUrl + '/upload';
  //   return this.http.post(url, formData)
  // }


  deleteAudio(id: string): Observable<{}> {
    /** TODO: confirm deletion */
    /** TODO: logic deletion */
    const url = `${this.audiosUrl}/${id}`;
    return this.http.delete(url)
      .pipe(
        tap(_ => this.log(`deleted audio id=${id}`)),
        catchError(this.handleError(`deleteAudio id=${id}`))
      );
  }

  /** Log a message with the service */
  private log(message: string): void {
    this.messageService.add(`[AudioService] ${message}`);
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
    
     // TODO: better job of transforming error for audio consumption
     this.log(`${operation} failed: ${error.message}`);
    
     // Let the app keep running by returning an empty result.
     return of(result as T);
   };
  }

}