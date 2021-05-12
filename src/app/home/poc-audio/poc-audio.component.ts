import { Component, OnInit } from '@angular/core';
import getBlobDuration from 'get-blob-duration';
import { fileURLToPath } from 'url';
import { AudioService } from '../audio.service';

@Component({
  selector: 'app-poc-audio',
  templateUrl: './poc-audio.component.html',
  styleUrls: ['./poc-audio.component.css']
})
export class PocAudioComponent implements OnInit {

  constructor(
    public audioService: AudioService) { }

  ngOnInit(): void {

    // variáveis RECORD/PLAY
    let record = document.querySelector('#record') as HTMLElement;
    let stop = document.querySelector('#stop') as HTMLElement;
    let soundClips = document.querySelector('.sound-clips') as HTMLElement;
    let audio = document.querySelector('audio');
    let discardButton = document.querySelector('#discardButton') as HTMLElement;
    let uploadButton = document.querySelector('#uploadButton') as HTMLElement;
    let testPlayback = document.querySelector('#testPlayback') as HTMLElement;
    let testPlayback2 = document.querySelector('#testPlayback2') as HTMLElement;

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

        console.log('SPEECH detectado', event.results);
        let { transcript } = event.results[recognitionTamanho][0]
        document.getElementById("transcript_result").innerHTML += transcript + '<hr>';
        recognitionTamanho += 1;
      }
      if (!SpeechGrammarList) {
        console.log('SpeechGrammarList não suportado.')
      }
      if (!SpeechRecognitionEvent) {
        console.log('SpeechRecognitionEvent não suportado.')
      }
    }



    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API#examining_potential_input_sources
    // TODO: mover options para pagina permanente
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        //console.log(devices);
        devices.forEach((device) => {
          let menu = document.getElementById("inputDevices");
          if (device.kind == "audioinput") {
            let item = document.createElement("option");
            item.innerHTML = device.label;
            item.value = device.deviceId;
            menu.appendChild(item);
          }
        })
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
          record.style.background = "red";
          record.innerHTML = "Gravando";
          record.style.color = "black";
          stop.removeAttribute('disabled');
          if (speechRecognitionEnabled) {
            recognition.start(); // SPEECH
            recognitionTamanho = 0; // SPEECH
          }

        }

        stop.onclick = () => {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
          console.log("Gravação finalizada");
          record.style.background = "";
          record.style.color = "";
          record.innerHTML = "Gravar";
          stop.setAttribute('disabled', 'true');
          uploadButton.removeAttribute('disabled');
          discardButton.removeAttribute('disabled');
          if (speechRecognitionEnabled) {
            recognition.stop(); // SPEECH
          }
        }

        mediaRecorder.ondataavailable = (e) => {
          data.push(e.data);
          console.log('Event handler: Dados de audio coletados')
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
          data = [];

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
            file
          ).subscribe({
            next: (res) => {
              console.log('Upload concluído.');
              cleanMainAudio();
              data = [];
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
