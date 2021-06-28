import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from '../message.service';
import { Audio } from './interfaces/audio';
import { environment } from 'src/environments/environment';
import { UtilsService } from '../utils/utils.service';
import { AuthService } from '../auth/auth.service';
import * as _ from 'lodash';
import { WebsocketService } from '../socket/websocket.service';

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

  // socket.io-client
  msgInputNewAudio: string = 'upload de audio no servidor';

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private utils: UtilsService,
    private authService: AuthService,
    private websocketService: WebsocketService,
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
    const url = `${this.audiosUrl}/${id}`;
    return this.http.get<Audio>(url)
      .pipe(
        tap(_ => this.log(`fetched audio id=${id}`)),
        catchError(this.handleError<Audio>(`getAudio id=${id}`))
      );
  }

  // getAudiosByTeamAndDate(idTeam: string): Observable<Audio[]> {
  //   const url = `${this.audiosUrl}/${idTeam}`;
  //   return this.http.get<Audio[]>(url)
  //     .pipe(
  //       tap(_ => this.log(`fetched audios by idTeam=${idTeam}`)),
  //       catchError(this.handleError<Audio[]>(`getAudioByTeam idTeam=${idTeam}`))
  //     );
  // }

  searchAudios(teamId: string, dateStringStart: string, dateStringEnd: string, onlyInfo = false): Observable<Audio[]> {
    dateStringStart = this.utils.dateStringToAPIFormat(dateStringStart)
    dateStringEnd = this.utils.dateStringToAPIFormat(dateStringEnd)
    if (!teamId) {
      return of([])
    }
    const url = `${this.audiosUrl}/search?teamId=${teamId}&dateStringStart=${dateStringStart}&dateStringEnd=${dateStringEnd}&onlyInfo=${onlyInfo}`;
    return this.http.get<Audio[]>(url)
      .pipe(
        tap(x => x.length ?
          this.log('found audios') :
          this.log('not found')),
        catchError(this.handleError<Audio[]>('searchAudios', []))
      )
  }

  isAudioListened(audio: Audio) {
    // console.log('>>>>> called isAudioListened')
    return audio.member._id == this.authService.userId || _.includes(audio.listened_by, this.authService.userId)
  }

  // isTextSeen(audio: Audio) {
  //   return audio.duration == 0 && this.isAudioListened(audio)
  // }

  isLoggedUserQuoted(transcription) {
    let quoted = false
    if (transcription.length > 0) {
      let userFullName = this.authService.userName
      let firstName = userFullName.split(' ')[0]
      let keywords = [firstName, userFullName];
      keywords.forEach(word => {
        let found = transcription.toLowerCase().search(word.toLowerCase())
        if (found >= 0) {
          quoted = true
        }
      });
    }
    return quoted
  }

  updateAudioListened(audio: Audio): Observable<Audio> {
    // httpOptions.headers =
    //   httpOptions.headers.set('Authorization', 'my-new-auth-token');
    const id = audio._id;
    // FIXME: api login route - sigin function
    // const url = `${this.audiosUrl}/${id}`;
    const url = `${this.audiosUrl}/audio_listened/${id}`;
    return this.http.put<Audio>(url, audio)
      .pipe(
        tap(_ => this.log(`updated audio id=${id}`)),
        catchError(this.handleError<Audio>(`updateAudio id=${id}`))
      );
  }

  updateAudio(audio: Audio): Observable<Audio> {
    // httpOptions.headers =
    //   httpOptions.headers.set('Authorization', 'my-new-auth-token');
    const id = audio._id;
    const url = `${this.audiosUrl}/${id}`;
    return this.http.put<Audio>(url, audio)
      .pipe(
        tap(_ => this.log(`updated audio id=${id}`)),
        catchError(this.handleError<Audio>(`updateAudio id=${id}`))
      );
  }

  uploadAudio(file: File, userId: string, teamId: string, transcript: string, audioDuration: number): Observable<Audio> {
    // uploadAudio(file: Audio): Observable<Audio> {
    const formData = new FormData();
    let filename = teamId + '-' + userId + (new Date()).toJSON().replace(':', '-');
    if (isNaN(audioDuration)) {
      audioDuration = 0
    }
    formData.append('file', file, file.name);
    formData.append("userId", userId);
    formData.append("teamId", teamId);
    formData.append("name", filename);
    formData.append("transcription", transcript);
    formData.append("duration", audioDuration.toString());
    const url = this.audiosUrl + '/upload';
    return this.http.post(url, formData)
      .pipe(
        tap(
          res => {
            let resModified: { msg: string, audioId: string } | any = res
            let newAudioId = resModified.audioId
            this.log(`added audio id=${newAudioId}`)
            this.websocketService.sendMessageNewAudio(this.msgInputNewAudio, this.authService.userId, newAudioId)
          }),
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

  createAudio(audio: Audio): Observable<Audio> {

    // FIXME: api login route - sigin function
    // const url = environment.apiUrl + 'audio_info'
    const url = this.audiosUrl + '/audio_info';
    // console.log('createAudio info');
    return this.http.post<Audio>(url, audio, this.httpOptions)
      .pipe(
        tap((newAudio: Audio) => this.log(`added audio id=${newAudio._id}`)),
        catchError(this.handleError<Audio>(`createAudio`))
      );
  }

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

  // createAudioListened(audioListened: AudioListened): Observable<AudioListened> {

  //   // FIXME: api login route - sigin function
  //   // const url = environment.apiUrl + 'audio_listened'
  //   const url = this.audiosUrl + '/audio_listened';
  //   console.log('createAudioListened info');
  //   return this.http.post<AudioListened>(url, audioListened, this.httpOptions)
  //     .pipe(
  //       tap((newAudioListened: AudioListened) => this.log(`added audioListened id=${newAudioListened._id}`)),
  //       catchError(this.handleError<AudioListened>(`createAudioListened`))
  //     );

  // }

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