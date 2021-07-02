import { Component, OnInit, NgZone, ChangeDetectionStrategy, TrackByFunction } from '@angular/core';
import getBlobDuration from 'get-blob-duration';
import { fileURLToPath } from 'url';
import { AudioService } from '../audio.service';
import { User } from '../../users/interfaces/user';
import { Team } from '../../teams/interfaces/team';
import { Audio } from '../../home/interfaces/audio';
import { UserService } from '../../users/user.service';
import { interval, Observable, Subscription } from 'rxjs';
import { ROLES } from '../../users/mocks/user-roles';
import { WebsocketService } from 'src/app/socket/websocket.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { TeamService } from 'src/app/teams/team.service';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { isThisTypeNode } from 'typescript';
import { UtilsService } from 'src/app/utils/utils.service';
import * as _ from 'lodash';
import { finalize, map, take, takeWhile, tap } from 'rxjs/operators';
import { resolve } from '@angular/compiler-cli/src/ngtsc/file_system';
import { NotifierService } from 'angular-notifier';
import { SocketMessage } from 'src/app/socket/interfaces/socketMessage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-audio-meeting',
  templateUrl: './audio-meeting.component.html',
  styleUrls: ['./audio-meeting.component.css', './audio-meeting.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush // não torna a parte de audios listados mais rápida. Precisa clicar
  // https://medium.com/totvsdevelopers/melhore-a-performance-da-sua-aplica%C3%A7%C3%A3o-com-change-detection-strategy-onpush-4259fc1eb59c
})
export class AudioMeetingComponent implements OnInit {

  apiUrl = environment.apiUrl
  // private notifier: NotifierService;
  // ownTeams$: Observable<Team[]>;
  ownTeams$: Team[];
  // audios$: Observable<Audio[]>;
  audios$: Audio[];
  // selectedId: string;
  audiosIdLoggedUserQuotedArray = []
  roles = ROLES;
  roleFilter = "";
  loggedUserId = "";
  loggedUserRole = "";
  isLoggedUserMember = false;
  // currentRoute: string;
  lastTeamId: string;
  selectedTeamId: string;
  selectedTeamName: string;
  mainAudioDuration: number;

  // member-player selection
  selectedAudioId?: string;

  // socket.io-client
  msgInputNewAudio: string = 'upload de audio no servidor';
  msgInputAudioListened: string = 'Áudio reproduzido pelo usuário.';

  // datePicker
  selectedDateModel: NgbDateStruct;

  // input devices
  inputDevices: any[];
  selectedInputDeviceLabel: string;
  selectedInputDeviceValue: string;

  // audio transcript
  transcriptionTitle: string = '';
  transcriptionTitleAudioAndText: string = 'Transcrição do seu áudio';
  transcriptionTitleTextOnly: string = 'Envie uma mensagem';
  transcriptionDatetime: string = '';
  transcript: string = '';
  textOnly = 0;
  transcriptTextarea: HTMLElement;
  editTranscriptButton: HTMLElement;

  // audio controls
  record: HTMLElement;
  spanRecordTimer: HTMLElement;
  iconRecord: HTMLElement;
  stop: HTMLElement;
  audio: HTMLAudioElement;
  discardButton: HTMLElement;
  uploadButton: HTMLElement;

  // mode selection
  modeSelectionInput: NodeListOf<HTMLElement>;

  //record times
  recordTimer: number = 0
  secondsCounter = interval(1000);
  result$: Observable<number>;
  stopTimerFlag = false;

  // selectors
  // "dropdownTeams"
  // "inputDatepickerMeeting"
  // "buttonDatepickerMeeting"
  datePickerDisabled = false;
  dropdownTeamsDisabled = false;

  // contagens
  audiosCount = 0;
  audiosListenedCount = 0;
  audiosQuotedCount = 0
  quotedSingular = ' cita você'
  quotedPlural = ' citam você'
  notSeenSingular = ' não lida'
  notSeenPlural = ' não lidas'

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
    private ngZone: NgZone,
    private utils: UtilsService,
    private notifier: NotifierService
    // private changeDetector: ChangeDetectorRef
  ) {
    // this.notifier = notifier;
  }

  memberTrackById: TrackByFunction<Audio> = (index, audio) =>
    // console.log('trackById: ', audio._id)
    // console.log('trackById: ', index)
    audio._id;


  activeMemberPlayer(elementId) {
    this.selectedAudioId = elementId
  }

  unselectedMemberPlayer() {
    this.selectedAudioId = ''
  }

  getOwnTeams(): void {
    this.teamService.getOwnTeams().pipe(
      tap((team) => {


        // atribui equipe inicial
        this.selectedTeamName = team[0].name;
        this.selectedTeamId = team[0]._id;
        this.lastTeamId = team[0]._id;
        this.enterTeamRoom();
        this.getAudios();
      }
      )
    ).subscribe(teams => this.ownTeams$ = teams);

  }

  enterTeamRoom() {
    this.websocketService.sendMessageLeaveTeamId(this.lastTeamId);
    this.lastTeamId = this.selectedTeamId
    this.websocketService.sendMessageJoinTeamId(this.selectedTeamId);
  }

  getLoggedUser(): void {
    this.loggedUserId = this.authService.userId;
    this.loggedUserRole = this.authService.userRole;
    // desabilita escolha de para para membros, exceto coordenador e admin
    this.loggedUserRole == 'member' ? this.isLoggedUserMember = true : this.isLoggedUserMember = false
    this.datePickerDisabled = this.isLoggedUserMember
  }

  changeTeam(): void {
    // console.log('old Team id changed: ', this.lastTeamId);
    // console.log('new Team id changed: ', this.selectedTeamId);
    if (this.lastTeamId != this.selectedTeamId) {
      // console.log('Team changed: ', this.selectedTeamId, this.selectedTeamName);

      // reinicia controles
      if (this.textOnly) {
        this.initTextOnlyControls()
      } else {
        this.initAudioAndTextControls()
      }
      this.enterTeamRoom()
      this.getAudios()
    }
  }

  getAudios(webSocketMessageAtual?: SocketMessage): void {
    let jsDateStringStart = this.utils.dateModelToString(this.selectedDateModel)
    let jsDateStringEnd = this.utils.nextDayModelToString(this.selectedDateModel)
    // TODO: testes com audios$ em ngOnInit
    // this.audios$ = this.audioService.searchAudios(this.selectedTeamId, jsDateStringStart, jsDateStringEnd).pipe(
    this.audioService.searchAudios(this.selectedTeamId, jsDateStringStart, jsDateStringEnd).pipe(

      // tap(audios => {
      // let audiosIdArrayTemp = []
      // audios.forEach(audio => audiosIdArrayTemp.push(audio._id))
      // this.audiosIdArray = audiosIdArrayTemp
      // }),
      // verifica e inclui info de audio reproduzido e usuário logado citado
      tap(audios => {
        this.audiosCount = 0
        this.audiosListenedCount = 0
        this.audiosQuotedCount = 0
        audios.forEach(audio => {
          audio.loggedUserListened = this.audioService.isAudioListened(audio)
          audio.loggedUserListened ? this.audiosListenedCount += 1 : 0
          audio.loggedUserQuoted = this.audioService.isLoggedUserQuoted(audio.transcription)
          if (audio.loggedUserQuoted) {
            this.audiosIdLoggedUserQuotedArray.push(audio._id)
            this.audiosQuotedCount += 1
          }
          this.audiosCount += 1
        })

      })
    ).subscribe({
      next: (audios) => this.audios$ = audios,
      complete: () => {
        console.log(webSocketMessageAtual)
        console.log(this.audiosIdLoggedUserQuotedArray)
        if (webSocketMessageAtual && webSocketMessageAtual.type == 'new-audio-teamId-room' && this.audiosIdLoggedUserQuotedArray.findIndex(id => id == webSocketMessageAtual.audioId) >= 0) {
          // verificar se foi mencionado na transcrição do NOVO áudio ou NOVA mensagem
          this.notifier.notify('warning', 'Você foi mencionado(a) na nova mensagem')
        }

        // }
      }
    })

  }

  sendButtonClick() {
    // console.log('Usuário enviou áudio');
    // this.websocketService.sendMessageNewAudio(this.msgInputNewAudio, this.loggedUserId)
  }

  markOnlyTextAsSeen(audioId, audioDuration, loggedUserListened): void {
    if (audioDuration == 0 && !loggedUserListened) {
      this.updateAudioListenedOrTextSeen(audioId)
    }
  }
  // grava o id do usuário que reproduziu o áudio até o fim
  markAsListened(audioId, audioDuration, loggedUserListened) {

    // TODO: atualizar somente o audio player alvo e manter posição na tela

    // envia informação de áudio reproduzido somente se usuário ainda não escutou
    // E somente envia informação se duration não é Infinity
    if (audioDuration && !loggedUserListened) {
      this.updateAudioListenedOrTextSeen(audioId)
    }
  }

  updateAudioListenedOrTextSeen(audioId) {
    let fileListenedOrSeen: Audio = {
      _id: audioId,
      listened_by: this.loggedUserId
    }
    this.audioService.updateAudioListened(fileListenedOrSeen)
      .subscribe({
        next: () => {
          // console.log(this.msgInputAudioListened);
          // this.websocketService.sendMessageMarkedAsListenedOrSeen(this.msgInputAudioListened);
          this.getAudios()
        },
        error: () => alert('Erro ao enviar status de áudio reproduzido/mensagem lida.')
      });
  }

  selectToday() {
    this.selectedDateModel = this.calendar.getToday();
  }

  updateTranscript(text: string) {
    let textTemp = text.trim()[0].toUpperCase() + text.trim().slice(1);
    this.transcript += textTemp + '.\n';
    this.transcriptTextarea.scrollTop = this.transcriptTextarea.scrollHeight;
  }

  editTranscript() {
    this.transcriptTextarea.removeAttribute('readonly');
    this.transcriptTextarea.focus();
  }

  getMemberTranscription(memberId: string, memberName: string, transcription: string, created_at) {
    this.transcriptionTitle = ((memberId == this.loggedUserId) ? 'Você' : memberName) + ' enviou:';
    this.transcriptionDatetime = created_at;
    this.transcript = transcription.length !== 0 ? transcription : '[Áudio sem transcrição]';
    this.transcriptTextarea.setAttribute('readonly', 'true');
    this.editTranscriptButton.setAttribute('disabled', 'true');
    // audio/text
    this.uploadButton.setAttribute('disabled', 'true');
    this.discardButton.setAttribute('disabled', 'true');
  }

  initAudioAndTextControls() {
    this.unselectedMemberPlayer()

    this.transcriptionTitle = this.transcriptionTitleAudioAndText;
    this.transcriptionDatetime = '';
    // audio
    this.audio.controls = true;
    this.record.removeAttribute('disabled');
    this.record.focus();
    this.stop.setAttribute('disabled', 'true');
    this.spanRecordTimer.style.display = 'block'
    // audio/text
    this.uploadButton.setAttribute('disabled', 'true');
    this.discardButton.setAttribute('disabled', 'true');
    // transcript
    this.transcript = '';
    this.transcriptTextarea.setAttribute('readonly', 'true');
    this.editTranscriptButton.setAttribute('disabled', 'true');
    // mode
    this.modeSelectionInput.forEach((element) => element.removeAttribute('disabled'));
  }

  initTextOnlyControls() {
    this.unselectedMemberPlayer()

    this.transcriptionTitle = this.transcriptionTitleTextOnly;
    this.transcriptionDatetime = '';
    // audio
    this.record.setAttribute('disabled', 'true');
    this.mainAudioDuration = 0;
    this.spanRecordTimer.style.display = 'none'
    // audio/text
    this.uploadButton.removeAttribute('disabled');
    this.discardButton.removeAttribute('disabled');
    // transcript
    this.editTranscript();
    this.transcript = '';
    this.transcriptTextarea.focus();
    // mode
    this.modeSelectionInput.forEach((element) => element.removeAttribute('disabled'));
  }

  initRecordControls() {
    this.transcriptionTitle = this.transcriptionTitleAudioAndText;
    this.transcriptionDatetime = '';
    // audio
    this.iconRecord.classList.add("blink_me");
    this.stop.removeAttribute('disabled');
    this.stop.focus();
    this.record.setAttribute('disabled', 'true');
    this.spanRecordTimer.style.display = 'block'
    // audio/text
    this.uploadButton.setAttribute('disabled', 'true');
    this.discardButton.setAttribute('disabled', 'true');
    // transcript
    this.transcriptTextarea.setAttribute('readonly', 'true');
    this.editTranscriptButton.setAttribute('disabled', 'true');
    // mode - change team - member players - datepicker
    this.modeSelectionInput.forEach((element) => element.setAttribute('disabled', 'true'));
    this.datePickerDisabled = true
    this.dropdownTeamsDisabled = true

  }

  initStopControls() {
    // audio
    this.iconRecord.classList.remove("blink_me");
    this.record.removeAttribute('disabled');
    this.stop.setAttribute('disabled', 'true');
    // audio/text
    this.uploadButton.removeAttribute('disabled');
    this.uploadButton.focus();
    this.discardButton.removeAttribute('disabled');
    // transcript
    this.editTranscriptButton.removeAttribute('disabled');
  }

  initDiscardControls() {
    if (this.textOnly) {
      this.initTextOnlyControls();
    } else {
      this.initAudioAndTextControls();
    }
    this.recordTimer = 0
    this.datePickerDisabled = this.isLoggedUserMember // reabilita datepicker se coordinator ou admin
    this.dropdownTeamsDisabled = false
  }

  initUploadControls() {
    if (this.textOnly) {
      this.initTextOnlyControls();
    } else {
      this.initAudioAndTextControls();
    }
  }

  startTimer() {

    this.recordTimer = 0
    this.stopTimerFlag = false
    this.result$ = this.secondsCounter.pipe(
      // takeWhile(n => n < +this.expiresInSeconds && this.isLoggedIn),
      takeWhile(() => !this.stopTimerFlag),

      finalize(() => {
      } // else, only finalize interval to avoid duplicates
      ));
    this.result$.subscribe(
      _ => this.recordTimer += 1
    )
  }

  stopTimer() {
    this.stopTimerFlag = true
  }



  ngOnInit(): void {

    this.getLoggedUser();
    this.getOwnTeams();
    this.selectToday();


    // socket.io-client
    this.websocketService.onNewMessage().subscribe(msg => {
      console.log('Recebido do servidor: ', msg);
      // servidor envia mensagem para atualizar lista de audios no cliente
      // conforme o type
      // if (msg.type == "enter-teamId-room" || msg.type == "new-audio-teamId-room" || msg.type == "mark-as-listened-or-seen") {
      if (msg.type == "enter-teamId-room" || msg.type == "new-audio-teamId-room") {
        // console.log('get audios: ', msg.type)
        this.getAudios(msg);

      }
      if (msg.type == "new-audio-teamId-room" && msg.userId != this.loggedUserId) {
        // console.log('msg.userId: ', msg.userId)
        // console.log('this.loggedUserId: ', this.loggedUserId)
        this.notifier.notify('info', 'Mensagem recebida');

      } else if (msg.type == "new-audio-teamId-room" && msg.userId == this.loggedUserId) {
        this.notifier.notify('success', 'Mensagem entregue');
      }
    });

    // variáveis RECORD/PLAY
    let record: HTMLElement = document.querySelector('#record');
    let iconRecord: HTMLElement = document.querySelector('#iconRecord');
    let spanRecordTimer: HTMLElement = document.querySelector('#recordTimer');
    let stop: HTMLElement = document.querySelector('#stop');
    let audio: HTMLAudioElement = document.querySelector('#main-audio-player');
    let discardButton: HTMLElement = document.querySelector('#discardButton');
    let uploadButton: HTMLElement = document.querySelector('#uploadButton');

    // TODO: confirmar atribuições iniciais e vínculo com variáveis de componente.
    this.record = record;
    this.iconRecord = iconRecord;
    this.spanRecordTimer = spanRecordTimer;
    this.stop = stop;
    this.audio = audio;
    this.discardButton = discardButton;
    this.uploadButton = uploadButton;

    // variáveis TRANSCRIPT
    let transcriptTextarea: HTMLElement = document.querySelector('#transcriptTextarea');
    let editTranscriptButton: HTMLElement = document.querySelector('#editTranscriptButton');
    this.transcriptTextarea = transcriptTextarea;
    this.editTranscriptButton = editTranscriptButton;

    // mode selection
    let modeSelectionInput: NodeListOf<HTMLElement> = document.querySelectorAll('.modeSelectionInput');
    this.modeSelectionInput = modeSelectionInput;


    let audioTypeWebm = { 'type': 'audio/webm' };
    let audioType = audioTypeWebm;
    // let audioTypeWebmOpus = { 'type': 'audio/webm; codecs=opus' };
    // let audioType = audioTypeWebmOpus;
    // let audioTypeOgg = { 'type': 'audio/ogg; codecs=opus' };
    // let audioTypeMp3 = { 'type': 'audio/mpeg' };
    // let audioType = audioTypeMp3;

    audio.controls = true;
    audio.setAttribute('controlsList', 'nodownload')
    audio.preload = 'none'
    // audio.onloadedmetadata = (data) => {
    //   console.log('loaded metadata')
    //   // console.log('loaded metadata target', data.target)
    //   // console.log('loaded metadata audio duration', audio.duration)
    //   // console.log('main audio duration sem THIS', mainAudioDuration)


    //   if (audio.duration === Infinity) {
    //     // set it to bigger than the actual duration
    //     // https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome
    //     audio.currentTime = 1e101;
    //     console.log('time update BEFORE', audio.currentTime)

    //     audio.ontimeupdate = function () {

    //       this.ontimeupdate = () => {
    //         return;
    //       }

    //       // console.log('after workaround: ' + audio.duration);
    //       // self.mainAudioDuration = audio.duration
    //       // mainAudioDuration = audio.duration
    //       // console.log('after workaround mainAudioDuration: ' + mainAudioDuration);
    //       // console.log('after workaround self mainAudioDuration: ' + self.mainAudioDuration);
    //       audio.currentTime = 0;
    //       console.log('time update AFTER', audio.currentTime)
    //     }
    //     // console.log('real audio duration: ', audio.duration)
    //     // console.log('mainAudioDuration to save local: ', mainAudioDuration)
    //     // console.log('mainAudioDuration to save self: ', self.mainAudioDuration)
    //     // this.mainAudioDuration = mainAudioDuration
    //   }
    //   // this.mainAudioDuration = mainAudioDuration
    //   // console.log('after workaround this self mainAudioDuration: ' + this.mainAudioDuration);
    // }

    this.initAudioAndTextControls();

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
        "audio/ogg; codecs=opus",
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
      let mainAudioDuration: number = 0;

      let onSuccess = (stream) => {
        const mediaRecorder = new MediaRecorder(stream); //preparado para capturar a stream em um Blob (https://developer.mozilla.org/en-US/docs/Web/API/Blob)

        record.onclick = () => {
          mediaRecorder.start();
          this.startTimer();
          this.initRecordControls();
          // console.log(mediaRecorder.state);

          if (speechRecognitionEnabled) {
            recognition.start(); // SPEECH
            recognitionTamanho = 0; // SPEECH
            this.transcript = '';
          }

        }

        stop.onclick = () => {
          mediaRecorder.stop();
          this.stopTimer();
          // console.log(mediaRecorder.state);
          this.initStopControls();

          if (speechRecognitionEnabled) {
            recognition.stop(); // SPEECH
          }
        }

        mediaRecorder.ondataavailable = (e) => {
          data.push(e.data);
          console.log('Event handler: Dados de áudio coletados')
        }





        mediaRecorder.onstop = () => {
          let blob = new Blob(data, audioType);  // media stream

          // se necessário saber a duração do aúdio (bug Chrome) 

          // getBlobDuration(blob).then(function (duration) {
          //   console.log('duration: ', duration + ' seconds');
          //   this.mainAudioDuration = duration
          // });
          getBlobDuration(blob).then(duration => this.mainAudioDuration = duration);


          // this.mainAudioDuration = getBlobDuration(blob);
          console.log('THIS mainAudiDuration AFTER STOP: ', this.mainAudioDuration)

          console.log('Áudio gravado com sucesso.');
          let mainAudioURL = window.URL.createObjectURL(blob);
          console.log('mainAudioURL: ', mainAudioURL);

          // audio.addEventListener("loadedmetadata", function () {
          //   //you can display the duration now
          //   // let audioTemp: HTMLAudioElement;
          //   // audioTemp = data.currentTarget as HTMLAudioElement
          //   // console.log('loadedmetadata, data = ', data)
          //   // console.log('loadedmetadata, data.target = ', audioTemp)
          //   // console.log('loadedmetadata, audio.duration = ', audioTemp.duration)

          // });


          // audio.onloadeddata = (event) => {
          //   console.log(event)
          //   console.log('onload, currentTime: ', audio.currentTime)
          //   if (audio.duration === Infinity) {
          //     audio.currentTime = 1e101;
          //     audio.ontimeupdate = function () {

          //       this.ontimeupdate = () => {
          //         return;
          //       }

          //       audio.currentTime = 0;
          //       console.log('onload, currentTime: ', audio.currentTime)
          //     }
          //   }
          // }


          audio.src = mainAudioURL;
          // console.log('audio.preload.length: ', audio.preload.length)

          audio.load();





        }

        discardButton.onclick = () => {
          cleanMainAudio();
          this.initDiscardControls();
        }

        function cleanMainAudio() {
          // TODO: refatorar utilizando componente 
          data = []
          window.URL.revokeObjectURL(mainAudioURL);
          // console.log('mainAudioURL: ', mainAudioURL);
          audio.src = '';
          uploadButton.setAttribute('disabled', 'true');
          discardButton.setAttribute('disabled', 'true');
        }

        uploadButton.onclick = () => {
          let blob = new Blob(data, audioType);
          let file = new File([blob], "audioBlobToFile.weba", audioType)
          let audioDuration: number;
          // console.log('File: ', file)

          // se foi coletado áudio
          if (data) {
            // audioDuration = audio.duration : sem usar onloadedmetadata, fica infinity. Se usa onloadedmetadata, causa erro de player ficar esperando o fim do áudio ou de ficar somente no fim
            audioDuration = this.mainAudioDuration
            // console.log('THIS mainAudiDuration AFTER UPLOAD: ', this.mainAudioDuration)
            // console.log('data AFTER UPLOAD (DEV SER > 0): ', data)
            // console.log('data.lenght AFTER UPLOAD (DEV SER > 0): ', data.length)
          } else {
            audioDuration = 0
            // console.log('THIS mainAudiDuration AFTER UPLOAD: ', this.mainAudioDuration)
            // console.log('data AFTER UPLOAD (DEV SER 0): ', data)
            // console.log('data.lenght AFTER UPLOAD (DEV SER 0): ', data.length)
          }

          // upload para servidor
          this.audioService.uploadAudio(
            file,
            this.loggedUserId,
            this.selectedTeamId,
            this.transcript,
            audioDuration
          ).subscribe({
            next: (res) => {
              // TODO: refatorar utilizando componente
              console.log('Upload concluído.');
              cleanMainAudio();
              this.initDiscardControls();
              data = [];
              this.transcript = '';
            },
            error: () => alert('Erro ao enviar áudio.')
          });
        }
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
