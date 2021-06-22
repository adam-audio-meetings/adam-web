import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
// https://stackoverflow.com/questions/47161589/how-to-use-socket-io-client-in-angular-4
// Note 2021: Do not install @types/socket.io-client since the types are now included in the socket.io-client (v3) package and thus may cause issues (source).
@Injectable()
export class WebsocketService {

  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000/');
  }

  // EMITTER
  sendMessage(msg: string) {
    //console.log('sendMessage emmiter: ', msg);
    this.socket.emit('clientMessage', { message: msg });
  }

  // EMMITER: Connected to Team Room
  sendMessageEnterTeamId(teamId: string) {
    //console.log('sendMessage emmiter team room: ', teamId);
    this.socket.emit('clientMessageEnterTeamId', { message: teamId });
  }

  // EMMITER: Send new audio or message
  sendMessageNewAudio(teamId: string) {
    //console.log('sendMessage emmiter team room: ', teamId);
    this.socket.emit('clientMessageNewAudio', { message: teamId });
  }

  // EMMITER: Send new audio or message
  sendMessageMarkedAsListenedOrSeen(teamId: string) {
    //console.log('sendMessage emmiter team room: ', teamId);
    this.socket.emit('clientMessageMarkedAsListenedOrSeen', { message: 'client marked' });
  }

  // HANDLER
  onNewMessage() {
    return new Observable<any>(observer => {
      let srvMsg: { type: string, text: string }
      this.socket.on('serverMessage', srvMsg => {
        console.log('onNewMessage handler');
        // let srvMsg = { type: msg.type, text: msg.text }
        observer.next(srvMsg);
      });
    });
  }
}