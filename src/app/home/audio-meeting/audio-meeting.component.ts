import { Component, OnInit, NgZone } from '@angular/core';
import getBlobDuration from 'get-blob-duration';
import { fileURLToPath } from 'url';
import { AudioService } from '../audio.service';
import { User } from '../../users/interfaces/user';
import { Team } from '../../teams/interfaces/team';
import { Audio } from '../../home/interfaces/audio';
import { AudioListened } from '../../home/interfaces/audioListened';
import { UserService } from '../../users/user.service';
import { Observable, Subscription } from 'rxjs';
import { ROLES } from '../../users/mocks/user-roles';
import { WebsocketService } from 'src/app/socket/websocket.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { TeamService } from 'src/app/teams/team.service';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-audio-meeting',
  templateUrl: './audio-meeting.component.html',
  styleUrls: ['./audio-meeting.component.css', './audio-meeting.component.scss']
})
export class AudioMeetingComponent implements OnInit {

  ownTeams$: Observable<Team[]>;
  audios$: Observable<Audio[]>;
  selectedId: string;
  roles = ROLES;
  roleFilter = "";
  loggedUserId = "";
  // currentRoute: string;
  selectedTeamId: string;
  selectedTeamName: string;

  // socket.io-client
  msgInput: string = 'upload de audio no servidor';

  // datePicker
  selectedDateModel: NgbDateStruct;

  // input devices
  inputDevices: any[];
  selectedInputDeviceLabel: string;
  selectedInputDeviceValue: string;

  // audio transcript
  transcript: string = '';
  textOnly = 0;

  // audio controls ???
  uploadButton: HTMLElement;

  constructor(
    private teamService: TeamService,
    public audioService: AudioService,
    private userService: UserService,
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private dateAdapter: NgbDateAdapter<Date>,
    private ngZone: NgZone
  ) {
  }


  getOwnTeams(): void {
    this.ownTeams$ = this.teamService.getOwnTeams();
    this.ownTeams$.subscribe(
      (team) => {
        this.selectedTeamName = team[0].name;
        this.selectedTeamId = team[0]._id;
        this.getAudios();
      }
    );
  }

  getLoggedUser(): void {
    this.loggedUserId = this.authService.userId;
  }

  changeTeam(): void {
    console.log('Team changed: ', this.selectedTeamId, this.selectedTeamName);
    this.getAudios();
  }

  getAudios($event?): void {
    // if (this.selectedDateModel!) {
    //   this.selectedDateModel = this.calendar.getToday();
    // }
    console.log(this.selectedDateModel);
    let date = this.selectedDateModel;
    //let javaDateModel: Date = this.dateAdapter.toModel(this.selectedDateModel);
    let jsDateStringStart = date.month + "-" + date.day + "-" + date.year;
    let jsDateStart = new Date(jsDateStringStart);
    console.log(jsDateStart);
    var jsDateEnd = new Date(jsDateStart.getTime() + 86400000); // + 1 day in ms
    console.log(jsDateEnd.toDateString());
    // Date em js: mês começa do 0
    let jsDateStringEnd = (jsDateEnd.getMonth() + 1) + "-" + jsDateEnd.getDate() + "-" + jsDateEnd.getFullYear();
    this.audios$ = this.audioService.searchAudios(this.selectedTeamId, jsDateStringStart, jsDateStringEnd);
  }

  sendButtonClick() {
    // console.log('Usuário enviou áudio');
    this.websocketService.sendMessage(this.msgInput)
  }

  listenAudioEnded(audioId) {
    // console.log('Usuário reproduziu áudio', audioId);
    let audioListened = {
      fileId: audioId,
      // team ,  // TODO: utilizar ids logados
      // member: ,
    }
    this.audioService.createAudioListened(audioListened)
      .subscribe({
        next: (res) => {
          console.log('Áudio reproduzido pelo usuário.');
        },
        error: () => alert('Erro ao enviar status de áudio reproduzido.')
      });;
  }

  selectToday() {
    this.selectedDateModel = this.calendar.getToday();
  }

  updateTranscript(text: string): void {
    let text2 = text.trim()[0].toUpperCase() + text.trim().slice(1);
    this.transcript += text2 + '.\n';
    // console.log('Transcricao: ', this.transcript, text2[0]);
  }

  editTranscript(): void {

  }

  readonlyTranscript(): void {

  }

  sendOnlyText(): void {
    this.uploadButton.removeAttribute('disabled');
  }

  ngOnInit(): void {

    this.getLoggedUser();
    this.getOwnTeams();
    this.selectToday();

    // testes socket.io-client
    this.websocketService.onNewMessage().subscribe(msg => {
      console.log('Recebido do servidor: ', msg);
      // servidor envia mensagem para atualizar lista de audios no cliente
      // this.getUsers();
      this.getAudios();
    });

    // variáveis RECORD/PLAY
    let record = document.querySelector('#record') as HTMLElement;
    let iconRecord = document.querySelector('#iconRecord') as HTMLElement;
    let stop = document.querySelector('#stop') as HTMLElement;
    let soundClips = document.querySelector('.sound-clips') as HTMLElement;
    let audio = document.querySelector('#main-audio-player') as HTMLAudioElement;
    let discardButton = document.querySelector('#discardButton') as HTMLElement;
    let uploadButton = document.querySelector('#uploadButton') as HTMLElement;
    this.uploadButton = uploadButton; // TODO: confirmar atribuições iniciais e vínculo com variáveis de componente.
    let testPlayback = document.querySelector('#testPlayback') as HTMLElement;
    // let testPlayback2 = document.querySelector('#testPlayback2') as HTMLElement;

    let audioTypeWebm = { 'type': 'audio/webm' };
    let audioTypeWebmOpus = { 'type': 'audio/webm; codecs=opus' };
    let audioTypeOgg = { 'type': 'audio/ogg; codecs=opus' };
    let audioTypeMp3 = { 'type': 'audio/mpeg' };
    let audioType = audioTypeWebmOpus;

    // TODO: confirmar local de audio.setAttributes 
    // audio.setAttribute('controls', '');
    audio.controls = true;
    // audio.preload = 'metadata';

    // downloadButton.setAttribute('disabled', 'true');
    uploadButton.setAttribute('disabled', 'true');
    discardButton.setAttribute('disabled', 'true');
    stop.setAttribute('disabled', 'true');

    // variáveis SPEECH RECOGNITION

    var SpeechRecognition = SpeechRecognition || window['webkitSpeechRecognition'];
    var SpeechGrammarList = SpeechGrammarList || window['webkitSpeechGrammarList'];
    var SpeechRecognitionEvent = SpeechRecognitionEvent || window['webkitSpeechRecognitionEvent'];

    // https://w3c.github.io/mediacapture-record/#examples
    if (window.MediaRecorder == undefined) {
      console.error('Suporte para MediaRecorder não detectado.');
    } else {
      var contentTypes = [
        //"video/webm",
        //"video/webm;codecs=vp8",
        //"video/x-matroska;codecs=avc1",
        "audio/webm",
        "audio/webm; codecs=opus",
        "audio/ogg; codecs=opus", // TODO: teste: em chrome diz não ser suportado, mas funcionou
        "audio/ogg; codecs=vorbis",
        "audio/mp4",
        //"video/mp4;codecs=avc1",
        //"video/invalid"
      ];
      contentTypes.forEach(contentType => {
        console.log(contentType + ': '
          + (MediaRecorder.isTypeSupported(contentType) ?
            '' : 'NÃO ') + 'possui suporte');
      });
    }

    let speechRecognitionEnabled = true;
    //console.log(SpeechRecognition);
    if (!SpeechRecognition) {
      speechRecognitionEnabled = false;
      console.log('SpeechRecognition não suportado.')
    } else {
      var recognition = new SpeechRecognition();
      //var speechRecognitionList = new SpeechGrammarList();
      var recognitionTamanho = 0; // SPEECH

      //recognition.grammars = speechRecognitionList;
      recognition.continuous = true;
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      let recognitionStarted = false;
      let recognitionStopped = false;

      // executado quando começa a gravação
      // recognition.onaudiostart = () => {
      //   // altera a variável de estado de gravação para indicar que começou a gravar o áudio
      //   recognitionStarted = true;
      //   console.log('SPEECH: onaudiostart');
      // }

      // executado quando termina a gravação
      // recognition.onend = () => {
      //   // altera a variável de estado de gravação para indicar que parou de gravar o áudio
      //   recognitionStarted = false;
      //   console.log('SPEECH: onaudioend');
      // }

      recognition.onresult = (event) => {
        // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
        // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
        // It has a getter so it can be accessed like an array
        // The first [0] returns the SpeechRecognitionResult at position 0.
        // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
        // These also have getters so they can be accessed like arrays.
        // The second [0] returns the SpeechRecognitionAlternative at position 0.
        // We then return the transcript property of the SpeechRecognitionAlternative object
        // let { transcript } = event.results[0][0];
        // teste de resultado
        // console.log(event.results);
        // document.getElementById("transcript_result").innerHTML += transcript + '<hr>';
        //let recognitionTamanho = 0;

        // console.log('SPEECH detectado', event.results);
        let { transcript } = event.results[recognitionTamanho][0]
        // document.getElementById("transcript_result").innerHTML += transcript + '<hr>';
        recognitionTamanho += 1;
        this.ngZone.run(() => this.updateTranscript(transcript));

      }
      if (!SpeechGrammarList) {
        console.log('SpeechGrammarList não suportado.')
      }
      if (!SpeechRecognitionEvent) {
        console.log('SpeechRecognitionEvent não suportado.')
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API#examining_potential_input_sources
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        let inputDevices = [];
        //console.log(devices);
        devices.forEach((device) => {

          if (device.kind == "audioinput") {
            let item = { label: device.label, value: device.deviceId };
            inputDevices.push(item);
          }
          this.inputDevices = inputDevices;
          this.selectedInputDeviceLabel = this.inputDevices[0].label;
        })
        // console.log('MENU INPUT DEVICES: ', this.inputDevices);
      });

    if (navigator.mediaDevices.getUserMedia) {
      console.log('Suporte para getUserMedia detectado.');

      let constraints = { audio: true }; //restrição: somente áudio
      let data = [];
      let mainAudioURL: string = '';
      let base64data: string | ArrayBuffer;
      let lastInsertedId = ''

      let onSuccess = (stream) => {
        const mediaRecorder = new MediaRecorder(stream); //preparado para capturar a stream em um Blob (https://developer.mozilla.org/en-US/docs/Web/API/Blob)

        record.onclick = () => {
          mediaRecorder.start();
          console.log(mediaRecorder.state);
          console.log("Gravação iniciada");
          // record.style.background = "#bd2130";
          // record.innerHTML = "Gravando";
          // record.style.fontWeight = "bold";
          iconRecord.classList.add("blink_me");
          stop.removeAttribute('disabled');
          record.setAttribute('disabled', 'true');
          if (speechRecognitionEnabled) {
            recognition.start(); // SPEECH
            recognitionTamanho = 0; // SPEECH
            this.transcript = '';
          }

        }

        stop.onclick = () => {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
          console.log("Gravação finalizada");
          // record.style.background = "";
          // record.style.fontWeight = "";
          // record.innerHTML = "Gravar";
          iconRecord.classList.remove("blink_me");
          record.removeAttribute('disabled');
          stop.setAttribute('disabled', 'true');
          uploadButton.removeAttribute('disabled');
          discardButton.removeAttribute('disabled');
          if (speechRecognitionEnabled) {
            recognition.stop(); // SPEECH
          }
        }

        mediaRecorder.ondataavailable = (e) => {
          data.push(e.data);
          console.log('Event handler: Dados de áudio coletados')
        }

        mediaRecorder.onstop = () => {
          let clipName = 'clipNameTest';
          // TODO: audio element aqui?
          let blob = new Blob(data, audioType);  // media stream

          // se necessário saber a duração do aúdio (bug Chrome) 
          // getBlobDuration(blob).then(function (duration) {
          //   console.log(duration + ' seconds');
          // });

          console.log('Áudio gravado com sucesso.');
          let mainAudioURL = window.URL.createObjectURL(blob);
          console.log('mainAudioURL: ', mainAudioURL);
          audio.src = mainAudioURL;
          audio.controls = true;
          audio.preload = 'metadata'
          audio.load();
        }

        discardButton.onclick = () => {
          cleanMainAudio();
        }

        function cleanMainAudio() {
          window.URL.revokeObjectURL(mainAudioURL);
          // console.log('mainAudioURL: ', mainAudioURL);
          audio.src = '';
          uploadButton.setAttribute('disabled', 'true');
          discardButton.setAttribute('disabled', 'true');
        }

        uploadButton.onclick = () => {
          let blob = new Blob(data, audioType);
          let file = new File([blob], "testeAudioBlobToFile.weba", audioType)
          // console.log('File: ', file)

          this.audioService.uploadAudio(
            file,
            this.loggedUserId,
            this.selectedTeamId
          ).subscribe({
            next: (res) => {
              console.log('Upload concluído.');
              cleanMainAudio();
              data = [];
              this.transcript = '';
            },
            error: () => alert('Erro ao enviar áudio.')
          });
        }
        // testPlayback.onclick = () => {
        //   let audioURL = "http://localhost:3000/audio-in-folder";
        //   audio.src = audioURL;
        //   audio.controls = true;
        //   audio.preload = 'metadata'
        //   audio.load();
        // }
        // testPlayback.onclick = () => {
        //   let audioURL = "http://localhost:3000/audio-in-db/609b007829740040f84d59af";
        //   audio.src = audioURL;
        //   audio.controls = true;
        //   audio.preload = 'metadata'
        //   audio.load();
        // }
      }

      let onError = (err) => {
        console.log('Erros do getUserMedia ocorridos: ' + err);
      }

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

    } else {
      console.log('Suporte para getUserMedia não detectado.');
    }
  }

}
