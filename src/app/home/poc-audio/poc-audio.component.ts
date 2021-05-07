import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-poc-audio',
  templateUrl: './poc-audio.component.html',
  styleUrls: ['./poc-audio.component.css']
})
export class PocAudioComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

    // variáveis RECORD/PLAY
    let record = document.querySelector('.record') as HTMLElement;
    let stop = document.querySelector('.stop') as HTMLElement;
    let soundClips = document.querySelector('.sound-clips') as HTMLElement;
    let audio = document.querySelector('audio');
    let donwloadButton = document.querySelector('#downloadButton') as HTMLElement;

    let audioTypeWebm = { 'type': 'audio/webm' };
    let audioTypeWebmOpus = { 'type': 'audio/webm; codecs=opus' };
    let audioTypeOgg = { 'type': 'audio/ogg; codecs=opus' };
    let audioTypeMp3 = { 'type': 'audio/mpeg' };
    let audioType = audioTypeWebmOpus;

    // TODO: confirmar local de audio.setAttributes 
    // audio.setAttribute('controls', '');
    audio.controls = true;
    audio.preload = 'metadata';

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

    //console.log(SpeechRecognition);
    if (!SpeechRecognition) {
      console.log('SpeechRecognition não suportado.')
    }
    if (!SpeechGrammarList) {
      console.log('SpeechGrammarList não suportado.')
    }
    if (!SpeechRecognitionEvent) {
      console.log('SpeechRecognitionEvent não suportado.')
    }

    var recognition = new SpeechRecognition();
    //var speechRecognitionList = new SpeechGrammarList();
    let tamanho = 0; // SPEECH

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
      //let tamanho = 0;

      console.log('SPEECH detectado', event.results);
      let { transcript } = event.results[tamanho][0]
      document.getElementById("transcript_result").innerHTML += transcript + '<hr>';
      tamanho += 1;
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


    
    // usando MediaRecorder e blob (antigo???) - verificar o usado acima em: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API#basic_app_setup
    if (navigator.mediaDevices.getUserMedia) {
      console.log('Suporte para getUserMedia detectado.');

      let constraints = { audio: true }; //retrição: somente áudio
      let data = [];

      let onSuccess = (stream) => {
        const mediaRecorder = new MediaRecorder(stream); //perparado para capturar a stream em um Blob (https://developer.mozilla.org/en-US/docs/Web/API/Blob)

        record.onclick = () => {
          mediaRecorder.start();
          console.log(mediaRecorder.state);
          console.log("Gravação iniciada");
          record.style.background = "red";
          record.style.color = "black";
          recognition.start(); // SPEECH
          tamanho = 0; // SPEECH

        }

        stop.onclick = () => {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
          console.log("Gravação finalizada");
          record.style.background = "";
          record.style.color = "";
          recognition.stop(); // SPEECH
        }

        mediaRecorder.ondataavailable = (e) => {
          data.push(e.data);
          console.log('Event handler: Dados de audio coletados')
        }

        mediaRecorder.onstop = () => {
          let clipName = 'clipNameTest';
          // TODO: audio element aqui?
          let blob = new Blob(data, audioType);  // media stream
          data = [];
           const audioURL = window.URL.createObjectURL(blob);
          //audio.srcObject = mediaRecorder;
          audio.src = audioURL;
          audio.controls = true;
          // audio.preload = 'metadata';
          // audio.load();

          //donwloadButton.href = audioURL;
        }
      }

      let onError = (err) => {
        console.log('Erros do getUserMedia ocorridos: ' + err);
      }

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

    } else {
      console.log('Suporte para getUserMedia não detectado.');
    }

    // FIXME: Nova tentativa https://webrtc.org/getting-started/media-devices#using-asyncawait

    // const openMediaDevices = async (constraints) => {
    //   return await navigator.mediaDevices.getUserMedia(constraints);
    // }

    // // try {
    // //   //let constraints = { audio: true }; //retrição: somente áudio
    // //   //const stream = openMediaDevices(constraints);
    // //   console.log('Got MediaStream:', stream);
    // //   playAudio();

    // // } catch (error) {
    // //   console.error('Error accessing media devices.', error);
    // // }

    // async function playAudio() {
    //   try {
    //     let constraints = { audio: true }; //retrição: somente áudio
    //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
    //     audio.srcObject = stream;
    //   } catch (error) {

    //   }
    // }





    /*   
         // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API#basic_app_setup
       if (navigator.mediaDevices.getUserMedia) {
         console.log('Suporte para getUserMedia detectado.');
   
         
         let data = [];
         navigator.mediaDevices.getUserMedia(constraints).then
   
         
   
           record.onclick = () => {
             mediaRecorder.start();
             console.log(mediaRecorder.state);
             console.log("Gravação iniciada");
             record.style.background = "red";
             record.style.color = "black";
             recognition.start(); // SPEECH
             tamanho = 0; // SPEECH
   
           }
   
           stop.onclick = () => {
             mediaRecorder.stop();
             console.log(mediaRecorder.state);
             console.log("Gravação finalizada");
             record.style.background = "";
             record.style.color = "";
             recognition.stop(); // SPEECH
           }
   
           mediaRecorder.ondataavailable = (e) => {
             data.push(e.data);
             console.log('Event handler: Dados de audio coletados')
           }
   
           mediaRecorder.onstop = () => {
             let clipName = 'clipNameTest';
             // TODO: audio element aqui?
             //let blob = new Blob(data, audioType);  // media stream
             //data = [];
             // const audioURL = window.URL.createObjectURL(blob);
             audio.srcObject = mediaStream;
             //audio.src = audioURL;
             // audio.controls = true;
             // audio.preload = 'metadata';
             // audio.load();
   
             //donwloadButton.href = audioURL;
           }
         }
   
         let onError = (err) => {
           console.log('Erros do getUserMedia ocorridos: ' + err);
         }
   
         
   
       } else {
         console.log('Suporte para getUserMedia não detectado.');
       }
   */
  }
}
