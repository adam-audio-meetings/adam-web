import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SocketMessage } from './interfaces/socketMessage';
// https://stackoverflow.com/questions/47161589/how-to-use-socket-io-client-in-angular-4
// Note 2021: Do not install @types/socket.io-client since the types are now included in the socket.io-client (v3) package and thus may cause issues (source).
@Injectable()
export class WebsocketService {

  private socket: Socket;
  private socketUrl = 'http://localhost:3000/'; //FIXME: pegar por .ENV 

  constructor() {
    this.socket = io(this.socketUrl, { autoConnect: false });
  }

  // EMITTER
  sendMessage(msg: string) {
    //console.log('sendMessage emmiter: ', msg);
    this.socket.emit('clientMessage', { message: msg });
  }

  // EMMITER: Connected to Team Room
  sendMessageJoinTeamId(teamId: string) {
    //console.log('sendMessage emmiter team room: ', teamId);
    this.socket.emit('clientMessageJoinTeamId', { message: teamId });
  }
  // EMMITER: Connected to Team Room
  sendMessageLeaveTeamId(teamId: string) {
    //console.log('sendMessage emmiter team room: ', teamId);
    this.socket.emit('clientMessageLeaveTeamId', { message: teamId });
  }

  // EMMITER: Send new audio or message
  sendMessageNewAudio(teamId: string, userId: string, newAudioId: string) {
    //console.log('sendMessage emmiter team room: ', teamId);
    this.socket.emit('clientMessageNewAudio', { message: teamId, userId: userId, audioId: newAudioId });
  }

  // EMMITER: Verify member quoted
  // sendMessageVerifyQuote(teamId: string, userId: string, newAudioId: string) {
  //   this.socket.emit('clientMessageVerifyQuote', { message: teamId, userId: userId, audioId: newAudioId });
  // }

  // EMMITER: Login message
  sendMessageLogin() {
    // this.socket.emit('login', { message: 'logged in' });
    this.socket.open()
  }

  // EMMITER: Logout message
  sendMessageLogout() {
    this.socket.emit('logout', { message: 'logged out' });
  }

  // // EMMITER: Send 
  // sendMessageMarkedAsListenedOrSeen(teamId: string) {
  //   this.socket.emit('clientMessageMarkedAsListenedOrSeen', { message: 'client marked' });
  // }

  // HANDLER
  onNewMessage() {
    return new Observable<any>(observer => {
      let srvMsg: SocketMessage //{ type: string, text: string, userId: string, msgTime: string, audioId?: string }
      this.socket.on('serverMessage', srvMsg => {
        console.log('onNewMessage handler');
        observer.next(srvMsg);
      });
    });
  }
}