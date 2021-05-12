import { toBase64String } from '@angular/compiler/src/output/source_map';
import { Component, OnInit } from '@angular/core';
import getBlobDuration from 'get-blob-duration';
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
    let record = document.querySelector('.record') as HTMLElement;
    let stop = document.querySelector('.stop') as HTMLElement;
    let soundClips = document.querySelector('.sound-clips') as HTMLElement;
    let audio = document.querySelector('audio');
    let downloadButton = document.querySelector('#downloadButton') as HTMLElement;
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

    }
    if (!SpeechGrammarList) {
      console.log('SpeechGrammarList não suportado.')
    }
    if (!SpeechRecognitionEvent) {
      console.log('SpeechRecognitionEvent não suportado.')
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
      let base64data: string | ArrayBuffer;
      let lastInsertedId = ''

      let onSuccess = (stream) => {
        const mediaRecorder = new MediaRecorder(stream); //preparado para capturar a stream em um Blob (https://developer.mozilla.org/en-US/docs/Web/API/Blob)

        record.onclick = () => {
          mediaRecorder.start();
          console.log(mediaRecorder.state);
          console.log("Gravação iniciada");
          record.style.background = "red";
          record.style.color = "black";
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
          //getBlobDuration(blob).then(function (duration) {
          //   console.log(duration + ' seconds');
          // });

          let reader = new FileReader();
          reader.readAsDataURL(blob);  // funciona
          // reader.readAsArrayBuffer(blob); // nao funciona
          reader.onloadend = () => {
            base64data = reader.result;
            // console.log('base64data: ', base64data); //ok, esse base64data pode ser usado como URL para tocar o áudio
            console.log('Áudio gravado com sucesso.');
          }
        }

        uploadButton.onclick = () => {
          let blob = new Blob(data, audioType);
          //let fileInput = document.querySelector('#file') as HTMLInputElement;
          //let file = fileInput.files[0]
          // let file = new File([blob], "testeAudioBlobToFile", audioType) // tag audio não reconhece duration
          let file = new File([blob], "testeAudioBlobToFile.weba", audioType) // tag audio reconhece duração
          // let file = new File([blob], "testeAudioBlobToFile.weba") // tag audio não reconhece duração
          console.log('File: ', file)
          this.audioService.uploadAudio(
            file
            // {
            // // "name": base64data.toString(),  // FUNCIONAL, mas com passagem de payload file como string
            // "name": "teste",
            // "created_at": new Date(),
            // "file": base64data
            // // "file": base64String
            // }

          ).subscribe({
            next: (res) => {
              console.log('Upload concluído.');
              // console.log('id: ', res._id);
              // lastInsertedId = res._id
              // console.log('blob: ', blob);
              // console.log('base64data uploaded: ', base64data);
              // console.log('base64String: ', base64String);

              data = [];

            },
            error: () => alert('Erro ao enviar áudio.')
          });
        }
        testPlayback2.onclick = () => {
          let audioURL = "http://localhost:3000/audio-in-folder";
          audio.src = audioURL;
          audio.controls = true;
          audio.preload = 'metadata'
          audio.load();
        }

        testPlayback.onclick = () => {

          this.audioService.getAudio(lastInsertedId)
            .subscribe({
              next: (res) => {  // TODO: verificar que next executa mesmo com erro
                console.log('Teste Playback');


                //                 https://stackoverflow.com/questions/11410170/export-text-stored-as-bindata-in-mongodb
                // https://stackoverflow.com/questions/48428385/convert-binary-data-image-in-mongoose-mongodb-to-base64-and-display-in-html
                // /**When you got your photo you can get rid of new Buffer(data.photo.toString(), 'base64'); I assume photo is already a buffer so: var base64OfPhoto = data.photo.toString('base64') is enough. – Roland Starke Jan 24 '18 at 17:47  */
                // https://stackoverflow.com/questions/31245140/using-binary-data-from-mongo-collection-as-image-source

                // https://stackoverflow.com/questions/45106141/error-while-reading-blob-binary-data-from-mongodb-using-java

                // console.log('res: ', res)

                // console.log('res.file testes: ', res.file.toString('base64'))
                // console.log('res.file.data testes: ', res.file.data)




                //var array = new Uint8Array(res.file);
                //var blob = new Blob([array], audioType);


                //let blob = new Blob([res.file.data], audioType);
                // console.log('blob from mongo file:', blob);
                // let arrayBuffer2 = res.file.data
                // let base64String2 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer2)));
                // console.log('arrayBuffer2:', arrayBuffer2);
                // console.log('base64String2:', base64String2);

                var binary = '';
                let bytes = new Uint8Array(res.file);
                let len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                  binary += String.fromCharCode(bytes[i]);
                }
                let novo = window.btoa(binary);
                console.log('Novo:', novo)



                let reader2 = new FileReader();
                //reader2.readAsDataURL(blob);  // funciona
                // reader.readAsArrayBuffer(blob); // nao funciona
                reader2.onloadend = () => {
                  let base64data2 = reader2.result;
                  // console.log('base64data2: ', base64data2); //ok?, esse base64data pode ser usado como URL para tocar o áudio

                  //let audioURL = "data:audio/webm; codecs=opus;base64,ZGF0YTphdWRpby93ZWJtOyBjb2RlY3M9b3B1cztiYXNlNjQsR2tYZm81OUNob0VCUXZlQkFVTHlnUVJDODRFSVFvS0VkMlZpYlVLSGdRUkNoWUVDR0ZPQVp3SC8vLy8vLy8vL0ZVbXBacGtxMTdHREQwSkFUWUNHUTJoeWIyMWxWMEdHUTJoeWIyMWxGbFN1YTcrdXZkZUJBWFBGaC9xM2cvMC9pUnlEZ1FLR2hrRmZUMUJWVTJPaWswOXdkWE5JWldGa0FRRUFBSUM3QUFBQUFBRGhqYldFUnp1QUFKK0JBV0prZ1NBZlE3WjFBZi8vLy8vLy8vL25nUUNqUWFLQkFBQ0ErNE80YzNaTzFWRWtlZHJPUnI1SnZONzhBTm01TFBpWjdSQlQ3MXVobDhjc0diQ3VjNFFqalJkVXRxV3Q4aGM2b3RqSkZxUDBFOG41dW5paXJqMDh3SzlITjdkTFdQNDFnM212T3pmTjFFTlNKOU9VK0dCYWVvVkxWeWphTXJGV3NoYXAvN0xkTXdhajNmNUZwYzBuSXp4dGtzZG00ekh0TDRndldVU0VaTWRidnU5d0NrY2hLSEZrcGJBOGJjT0h6V2tYczViTWNNZU9CaUV3MWJzZ05MeTVKcFFQbUUxRTRvN3BtTmVGQmtoTTB4Nk0zL3lPQm1hVlhEN0FHaUNKN2JJS0NQWkxmNjh2cUdiQWwxcG1YR1J3ZHVUMUpHeHlGWUlTT1lENHM4Q0FWSUFQZHhicUhERFlaTEVpWjVJb0hmMUZub1Q5cStNK1RjRVhYRXE3UXh1ODArRnVqMWkxekJyNmhvVEJEczVzRFJ6Z1ZCWURmQ1JVQXNBdUVxV3E0QjVFNWwwa0RMZW5XaDBNdGFYalJJcVNnMkJPTkl2ZjJybWFhRHRaSXJ6b3VEWTNCUVBlRmdodUgxb3A2eUxmdGNNZWt0NEZRQkxiWGZVb0hIL0xMdVVURXh6YkhvZ1hmSW1oalNzSk1wOGtta3RPSWdocFJqQTBSY0hPVjBzWUNxbDU5VURIUG44MHJObU1CdTJORW01SG5QYlJEaTJ1T2xLbThKN09vMEZxZ1FBOGdQdURaM3dCUmJteG1FK1UvcnRlelR6dTQvMFdmdGpJRndOZ050cTRiMGpOemNDRnc5cmIydXFuRkFiNVJHd1c3Y0pvKzI5N2JQc2wybXN4OEI0UzNKRWlqMnFqN3F3c0RWRFVCRlVlOUNGS29Qc205S2JnVU1JWHRUdWdrdmN0OXBDQXZFSjBENm9EdVd3cUdqVjlWNk1yeDkwS3Fucmd1bWozRmg0Y3BjQjhHZlcxWmlTM2V4R2pMYXltYjk2SnRMVWgzeTF5cElvQTZ1YXVqNHdZaCtBRGJNZklWdGV5QVFmVnNBRGJiNUlSYUZLNjI0Zng3czNGYm5PcnEwQnJpVWVYdmZjVXpKOGdTU3I0SGx5MXRSenlvdzFDbHIwbDhwTlV3NzNTT2c1Y2Q2TzloWWFGdkJHdURqUVYvWmYvc0xMWEc2MWdVdUlrbGhWYThvSlZ6TjR1SzdySTg3eFRhdFY5dlBJcmxDSnhLQnRBTStPbFQxYjAwSWxBemRQM3JHOGg3b0Y2NWt3c09zWktxdlZnT0w3WGpXazdKbHVMYzk2YUxLN2kvNFNaVHFXZUVQM1FScTJLNmlTQk1VWW93dlM1bzl4SnczcmNxWXJhSDhnVGdKbmNaancvaktTalFZT0JBSGlBK3dNa0QxMXlmWHB1VTA0NEs5OEFhUjhmUUdQVlgyWG9FUWUvVnBlcEZ3WkpFVlEzZUg1UWlmbmdQb2tlU3lQcmlTTkJ6dE8wbmp5YzRkYVJQS0NMSFVlQVRwcWljY2lDK3pmODhhR0U0eHRxdDFIdW9lRHY0dkxlRjlIczloWW9TeFVmMERJOEtUSGovWm81OGhqdzVwQ1EzV3Y5d0oxZ1VhekliV3RFMEVUbURwbWtWUHlxKzFUNFpQeFZGQktFYTFGcEZISlBLV3VEMm56ckt6Rk1kNlFUT0dpUmhJUVArTWoxV0tqODVQZWxONGlOc3IyVllhK3NhOUNrYjNrRks1anFRZ3pMVHB3eGRBNTVsOUp4L0JTdHhiZzdYYlBmb3lxTGRuU3Z6K3B6OGtHcVlReUNtaGcrcS9BN2dJZGN3Nzg2S2dIOW8xUDR4OVVEVEQ2alZsUmZTT2VIM3pGWWlKQ2MvMzNUcmtOOFloZ2NucHpHT0p1cldKLzdQSnlHNUxkRm5va1B0Sk51NXRGLzUzc3FKcnBhSWFRdmZSUVVxM2tvMHVqVmZmalpiN3ZVdmk5c1gyRjFtUHBRTjNPV0t0YXAzNEN1TXRPais4WCtST2lXNThzalYxbVkvdkJTVjhQckJKL1ZrdDBoT2lmVHd3ZmNUSmgwMkRaaUZaYWpRWU9CQUxTQSt3UFdoM3V3eXI1OXFRcWY2UXBUbzRwbThUK3RqR25DbGZBaDc0akl4SUtOWTZ5WFhXVGkwaHpPV0xXWlZHR21IbGc3R2JsYnZUb3dJZUV1Tlk0RnhqcXlBcTJ3dHU3TTJjY0ZSaG1KbU9YaGZ4b0VsVkpkR3liUkNYTjUxVVRRWCtzNDU2TjBnVWVJbnF6MmNwVG1nTW9zWDJicjVpeER2VjE2KzlLNEtRSW5WRk9VYlRQUHpJUWttRkhRV1c3d1VERVc1dFpuRXcvY20wSCt0UHJwVHpYcFh6Uk5FYzcrdnZhck5qWWZQU1V1T3kxV1FIM1dmV1BRamhvVFBLTDdTMjJHckdKc01mczd5WWVPRnNtZ1RrVTV0bno2Z3pwWmFaMlFLZGI1U1FiWlZOOE0yV2lvWHZiQ2Jnckp3TTRWbHA4T2xrUmNjdFFuQ0dtVnFWb1N5TnJ1WVpsN1hOY0lpQzMxNHFQeERmZVdCamttQnRMY00waDk5WTBmcVY3SVBoVytsb2tieW5TYUd2ZUJOU1dra3JLVTVtcTFvQUM4ZmRIek9sMXRwQjJ5WHJaM1VCYzRoL3VaZENDWHNpdEs0WC9XQlZUQXBydlo5VWVxMHdvelJCQkZiWFZyNkJYUlMxT2JlZnJwWERFYTAwbHZaRHBIQzRZL1BOWVN1aVdqUVlPQkFQQ0Erd1BDcXluVzljMktHcitkMUxFdVFBZDNzS3FTMlU3cnByL2FIbUQxTUs0bWlKNktkUkpOdHo0N05zYmtFMnRuSlFnVmxvTFEya0RoejdQbW5ZV3d5SXlJTUZhMU5rbXAyU1RQcjkvYjkxZ0o3Z0h3bDhwT1JqR0pvRmtPQkFITFE5SC9zci81cDd5OHFWT2ExK3M4U3BEd2JXc3hMWXpkbUg3YU1pak5sbjRWVkFNWk1RV3A5U0Y3T3VVak5oY2RxUzlMM1I0WEpQUzF5bEE4czIvWDV3WmxUL3JVS216MnBnN0ZNMVJqYXMza2tadG5icDBVOFU3d1F2V3hkdFpGM0dORHpGMlBBSEtQeDlmMVBpb3J5NVdhTUc3SFJQYU1iTUFoN3dOMit5bjBqRWJEUlZwYjZDd2JpUU1TSFJJTG5wa2Y0TVNYdEFuM2QvNUZNeHV6ODBHZkEwcXl5K2d1VlBUcHR4d1pOYm5xU2M2eWluZWpYdC9yR1I0bWl4RHNCSUhYd0NwZHpQQkRzdHFzS0Q0Wjg5aDBab1VaZStqTUQ2cnljYVZxaU1BQW1NQjFnTFdJY2tDb3Iwc201cVVJa0c5V09HZ0dBM01KRVdoR2hHQVhOckN6ZFRETHBqTmRXSmpQZ0FNOFZjQmR3cU1iVmRjSnZ5cnRQRFQzSGdXalFZT0JBU3lBK3dQYWhYbW5NbXV0TXhIcmhDekdxSkxuWmEyYkp1R2FxVUxHN0hxclp5TTJsUjJseGpuUyszMTRzQnpuYThCM3JmUG1PaEgzZ3d5cXlCY0c2ZEliYlJwb1JoelI5YTFHMEg3YVhxNE5IU2tSTWNJSXhmdzNhTXZQSWhybytHNWRiVXFia3ZHQkYxakt3ZWVjQ2ltZUxHVVlhLzFYdlFBMDJaVUlsY0cyc2ZySDNGUjFhdHZESHRLbDJDczd6MGdCRmR3dWgvOVJ5aE14OGgxc0NTa3VyenhZM3RIck9GQktsTUlaK3lGVUpKQ01nalRycStXWlJERWVPaEpYNEpqQ2NwVVVmVDBIcXlmL2ppZlFuRUxmbFMwS25GSFJSVkN1RmowaVo1SkZsaUVnM0lNaitmSjBab0ZvdW00dmdTMllIWU81aW5ZbEZ5VStqS3ZyUmJLYXZkcC9BakFYRTBzdUp5M3pJM0pBR2RIbmladklkeXcvWXFISStJMTVZYmk0bmp1U1QwdFQ5aEx3WjRBZEkzZmg4dlJVc1JpOURYcWxRQ3QrUUpOQkwrK25FUzdFdFp0Z0tYT3Y1U0I0dTIxcmVWL2E4dUVvRkRRVnllUlVzZm5sbm5XZloraHk2ejZkeCtCdXUyOUhiNksrQ1BMck9jK1pjWmtQWCtyaitzV2pRYitCQVdpQWU0TytlNG05LzRaOUpjMjNER28yL1pZbStPVkJTK2JPaitlNU90aW1VbFZHRUVCQ0cyVUNIeFFlbVpiZXZTR1llSjZNWmtERVcvWlAvTXNVSXU2dmxueVhkbTU1NTJjS1NlT3V6dDljRW9YbDg1b21ibEl2ampDMWxlQmNDRVNMMXdmbzJzcDl5bDdZUUJRM1g0K09RQVlWbkNRSER0cjA4TXI1V2NLTDZNSE95QnlwNzJ2dEg1MjAyRE9ReFNIRmZVVFpWUE5pTmxEemhoVjJvcmk5Y1lGSlp2MGFISVFjTEl3SFR0UUNXWTd1TldySlJEMmIrbW5oMFVKWjE4WGErcmFLNk15UzVLQ2pHN1k5OG9pQXhDWkJjUjQ3Q2x0d3hhUitvekVQMElGbDlDKzI2c04yaXBCK0hKM1ordnBnb3RwRklMVmNOSTNRTDJ0YmhjYnlqZC9DQXF3VHVOamlOdjBiNWozQ2I4VS8raDArUTRsMGt0R1VoL0R3MmdhVXhNNVFDWVRBbldiTlpLZW5sUml1ZG1jR3JXUVV3SFZYaG9id2FsdUxhMXY0eTd2M0V4N01HQU1WSGVQbUJoUy9EMUlMUE9WQ0pZVFIxL0w0YzdUNi8wMmRkTDlnZkFCTWVUeVpBejlVeEg4cjJuSWZHRDVJQ1JZZDN3L2xWRldXZUwyS0dVKzExWnYwT2J5cGs0NmhhRUR0dTNpNTA4WmN4N0hCMWNJYlFJZXhZR2VQMnhZNm9tbnFxTVpiVEtLdHQ0TkVNMEh4TFNneW5qeWpRWDJCQWFTQWU0TjRmWXJWWUtFaGZmYXpJSkpvVXFaaXZVeEY3YUpPdm82enVvVFc5alhSSlhUTVVselNGR1NlQXdZWHM0RFlwa0hTc1oyU2VWdG5HSFgvTU1NYTdhWkJ4WEIwNXZpcHZoaEdRejI5aWwxQ2Y3UVFFdjJXSms2WFllNjRXTXVtM20waVYzL0laQktFaS9DOG5LSS82OGdOdWhHNTQ4VGt5VXphWW9yYjZYRXdmZEJQS3Y2YXNGV2RPUzlXWXJQeTlZU2JNbkF3WnF2Qjl4MkgrSFJJSHZMOG43SG5pZ2gra3VqbUg3eXEyU21Oa0QwK2g5YnZpdVQzQVRhbmIwS3hiQS9Kb01LVDRlOHhLVW9RK2RNK3FxNnlDYmdaNFFhdFZLdW8wS21pM2lheDl1eHpnM3ZBbjdWR1dLd25xcndqOGhUSkNnVzYwVUdzaXVQS0o2dlFTOTQ4Zlp6NVkzazA3MVZ6NzRIbDhralhFZ3FlUmZ5NTF5dFhVdDBtdWdEUTlVRUZMa1pZS0E2dnhYaDdsNFRISkswYThkNGFjK2lDY2NoQnVOUk5qQ2JWU1ZpMUpxVWRpV0N5TDFoOGVMa3kzRjQvVlpmWFZvSEFHam5KOERVY0NoNG5LUDNXUW82NnBrR1E3citnd2JCUXB0YmpsWGpwUTJ5alFZR0JBZUNBZTRPSGZJR1RheEljNVJhelJYUnhwZzVlMnJYbEoyRndFT2QxK3dWemZ1RHZZRUUvSzgzc1ViRHVGWWN5V2prb2NCRUQ0VDJQM003UCtyRnZuN3RhaUN6WnlnWkJPeE1TQWdmYVNGbm9UMVYrSzdpS2lRdWI2WXdmOGtvWncyVlNaSnFnKzJtenpPWmV4UzFyZDRPeU9yOGNPcDlpdE9RbDdsT2hJWXB0N3pja2gvVU9rRUZZdmMzQm80cmxtNC93bmpGSk04NzBFcVRHQ0E3QmVvRFFBSGowREtER2ZCWmJJU0N4T3FUZmV5K0ZTbzZPUElJV0cyUCtIUkgyVkJnV2V3T3ppbDFDWHpFTy9reUZ4RXM0engxRnYvVUZtVXEybm0vVG1xZVJnSVpaazlUaVNzQ1NzbDZlQS9zSWtqRkM2RFFscTZwSS9HNld4RVhnbGwzeG85aWNxMk50a2pXS3lJTFU1bFJBbDJUaS9GZFdqZFJuelhzcHJuTjZuTWVYK0VLcWl3TlAzTWpqU09IVUdncTFRR3dTYlNqSmR4OFhwaUdNdnJtV253QmRrSFlxVFg5UCs4Y2pnWmNrZXpoRUoxdE9YODd5blhrcURibytwS2Vzc29FNlhhRkIvMTdGdDlYNVN2ajBrNWkvS3ZVcm9RUW5neXVIYkdya28wRmJnUUljZ0h1RGMyODJiaS9hV0xoR1FvaURGa2wvTFljYmxtbTZWTHNOMDc4QlBDZEc4d2FYMFJMUTVIdnZFdkNBcEFVM0dpa3lZM2t2SksxUTh5TTkzVnE0TGdtV2xubFFaZVY2SjBpUEJlbGlRb2lQRkt3a2o1NzBWY2NLVThMaEtISzV4T0FKSnRhUEx6Y2Ezc3ZNTFpGS2FHOUkxdVpGNHNuVGl1RFRadUNJMTJiY05qUXNHNXQ5RzdLTi9FQkt1b1EvNmlBYVd6VThUMWhKS2NDOEZiZWN1VjFJdS9ueVV3TUZiTWZzMElHc3VjRGRnREJEYlEzNjJuUVM5a21SeW5jZlhINmJQRnRXeU1tdHdIYWZZZFFTaC9ONWRIVWZ2aHQxaHZqNkJuMGJHSEJlMGZMd1NLR2tpdURUKytOR3MrQVgzbmNJOU94N0VkS21UQnVIRjZWdUtkeGNVYzBCYWVhOE5NUU4zK2RWU2ZRT3NWd1FDRC9VUnJOZU9oOVcwMFRYR0RCTXp4Wm9zd3VPSFVvejVYdnpMQU1PMVA0bmVqbmdoNGVnUk5SYWRLci9NWllCYTlBUmVwclZKMlI0TXRYaGJpT25FZ3hXRm1PalFXS0JBbGlBZTROemNqWmJtbVU2dG1Ibk0rRXEyR3Z4a1lFT2tKOFQyTmg0ZThaWkZVNEpZVys1T0FwMGhEUWFXRWxCYzdSM3ZEWHAwcGFXS3R4RHE3bHpBM0J1RXprSjFQdkRsT2NhMHROK3RyRG9WTWhHQXN3MURKTTJCc3JqeWtNbEJRZUZDZS9UZHJjcXBIQ3c4aDFCeE9oWFpBeDlwa3A4ZWUwMUk4Qmw2dTdHbmpPMmduNmZpMXk1L3BzbmlIc3ZXR21PM2oxRDkrSVRwNmlQRlUvMjM5N1dCT2d6blhmVXN4OUxuMzJJb2hqKzNFcTVHKzNVL0xibkdIaGE2d1djR0ZQalpWVlU0d0pmL0Vsby9SK1E4aTM4d2Z0TFJ5L1JPZnV2c0NETm9OUmNXeHdnQzBKTVM1ZzRvWnMxQ0V1blZBQlBsSDI4SkJjSno4V3VpS0QwZ21Pd0sxMXVMWHNlVEJ5RDcvdFRrU2t4SkxubElkZEdZcnUxUkh4RGcra2I3NXVjNHhSWU82d0N5c2xiQkF4NFZ6T0xDaTIzRlVabmo4MHY3QjVOc3N1QkswamZXREZLS2daR1lPVWF3VGxma0cxWEZlbWJXV2s1NG9sOU5kWEdncTJqUVYyQkFwU0FlNE54Y3pVSVMxTEtOdEErSnVrMjE2MERoMmpXamJFa09vUXhhMkdPNXo1Skw0UWw1cVdISUZQSTBMTyt4TnZ1VjlCMTJseUdZSXRTdFVGencrWnRvRm1vaTRJVHE3NElEUzk1NFI5SXdOTWhvZVMxZXlDSnpNNEx3RVZ2T0Z2MGc0eXF3eEdPRHduL21nYXNYSmp1eW9pTjlTbmlOUWhMZklNYlIvblBLSWZ4bkRCUlRIYk05S1hhRkc1S3BWeiswTjF2K0MxdDk0QnFyVXN5RTZxclBDV3ZhOUxkaDE0eGlpZ2s5bFovSlE5aTlUN3Q3MnRjVG9FSFBhUitTdDlXeWNVQzdHN0lucDA3T3lXNHRCbGVCMXBvRWFoM3FBMUhaQmM3TDlBZEtKVVNEbEx3aUNISnJUVUlTdy9OWXlNdEtRdEQwTGZoNm5OQXdiR1hnbDY2bjl3ZlkrNGhGdmxpTjhxUHhtZlJ3UzNuQkJYcTFraHVvWFFiN29UNlcvcm5aYUZjcGVHT3lqRW1EOTU1eFhkRkRDR2VLZmVrYnhsTVJOd0k0WXpwanI0cEVidXdLd095blZ0clQwbzVBWGNnQ09zdTlYaEV0WUxqbzBHQ2dRTFFnSHVEZkhZMUNFdDlSNE82d2ZEbFgzamNaS3h0Zk9tYkpGeUVJYml6NDFKVXdvVG5QM3ZxeitkU09YdjUrZmFSK2xiMkFIS1kvTWhNOFRNK0ltTjJYdG0vUzRoU2YrVHRzT3lKVTR1eUdJMm9xbHF5MUlCaFZaV0x3MEtGWFBaYmdqM2wxOU12d0xKQkduRTVuNmpXQVVhcUJRTUgyTlpXTVBQc2VmQkFWbW5zaW5iSXRYQjFGc3Q0NGFyN1BSejZkWHQ4VWJNZlcxbHZ3T29PbXV1VUdpWFdKamVKbTVSRExyUHI4eGxEVlNINWpXbVM1ZDV2czFXVDZFSkI4WDM5S3VBUGEwM3B4MytiakUvNmp6akJYbFBYblJFMnJHNE00TEJJUzZqcGJVQUYyVnZDc3QwYUNBY3I3endxZzMxZ0N1WUFwYm5TYllzTTlSWm43SnlrYWZWVVp4ejVXa3hWM2VsMWFheGZ4NE5lNGcrSkttTGpFRnJoN2ZDQ3NxVnJSSjZRcTBhc3RCaWJzWThrYTQzVmZITkFyWVNBZ043MlV0M0NJK0hTN28ra2ZVQktIOVRSUE9pYlVJY3NNRW1wcEs5NXBTQ2pvdUtEdXFYOHRRYU5aeUw4L1orclJ3R0FDZ0tnT1ZPTUNMR080amwyNXN2ZUFkYTZoQk85WFEralFhS0JBd3lBZTRPTGhaK1hIelJycDdKbzJad3BQZHFqeTl4b1NkU0lYelpDSWhGUDdicGZES0lvT0ZUVFFLZXZtdEhiMURKclB3TGpzNGtCTUpFbkpoUk82bWJYRE4rb0lJTkRqRFVtV0V1dWJhcjBhSE51V0hITjVBVjY2bTFZUm1UcDF6YndJR1FIQVczRndiVzBaT0QyUHJEWHcyeGdQWFJ3VHZjSC91UlZzVlFmN2RReFJ1cGtGeGZHNDRoTUloYzgzbitldTIyZit3S0M3SnUwb1lHVVRHaGE5NEFlZ2sreVBhTWxUT3IvMHkxL2c1eWs3Y3dnWE1jNW5sWENmSnB0YTYwdVp6WWhaeXpVZXJrN1YyMHNBcEl5Y2lsTE1namZIL0tXcEFRY3ZHYVMrOWsySEpXNDNqcEZjQitOWi90U3pCeWRLUUZpQU42RU9vMEZmNG0xVWo3Wit5b2ZhNmFtc2tOclJZaTYvRDF1ajZ2QWdaU0huayszWUM4VUQ4UVNJUUxpdDJJK0s2Y1RRQXVWUktlV0tZUTNKdUJqTWtuV0xjVytjRThLMjdaY0tEVnV2K29jUU1HbjhZUjZ3T0ZrMGxHaGVhWVNyQkM3M0dVNmg5TlU2MWJEMVFtb25FQ2NLV0RNQWxLaGtuUmhLUnlqWlJBN3pna0VoTmZVMk5CdTJRS1JYMGpoNGRYbnlnekIvUzAwK1B2RGJZOGhXM1A5UVdJaXg0QXBIenYzbzBHeGdRTklnSHVEa28yZXc5cCtUUmJmWmVoZ3lsbGc5WVYyMmR5SFJQMlNSWElwVVE2TDdMOE1hT1krS05IQTJnWmJEd0ovY2JqbmJPZ3lwRHFQUHlUL3BDbExPWlVoNnl6bW1hNG03NGpJYTN6RVV2UDl5K3pIL2Jtakk0em0xdnFzMENFWnlJemhQdGVWcWJRdTJaTTVhenA3NmpramNaaXNBdk9VZyt6djQrYi96Z2tNeHY3WEk1cW0xMkcxZ21zeXdJRUNzYzVDWUIvc1BwLzJkSFdHUnYxVzZyRGxSdkJiK2VkdE5RaFFDQURuTFBRQ1M4QktSNUh3eW9tK2l3R0diTUJUVnNIdXExVS9JZTlMUlNNdTdSbjUwWk5qaWQ3SkN4UzQvN1FXRjRIa3JQdDR6dFpzN0FvdGNTdk83akVxR3d4cE85NWFjVUh0RFcxakRFZVN3UzJaYXkyN1V4THNPbnRKYWd3SjJEZjVHZXM4RGZBdmtyQ2dDTDlBdmdrRVk2VjJDRUlXV1ovQTMvb1EyOFYrUDFPLzYzNHpTdHR3VVg0SFhWTnNCK0d2RUovQ3FGczFGakc3SjJtMmk0K0RWaEVMNi82Rkp2cU14RG1Ca0lJbkFUek1uUUlMWTVUNjRoZ05WTC9Hc0UxcGE0RlNMQnI0S3NCUTlvWXllNXYrcWxLazhNOE1aMS85bWltM1dlS1JTODNiRW9SL0p3UjhaSkJoMnZsRGtSc0FQM1J5c3FwYUJITmRRTDFHVlZwaEJxTkJoSUVEaElCN2c0Ri92ZXBKZ3VXNjNNaThaU0lnY1dmZmVPMTRyVzhUUzRvSHRHZW5pMUxraFg5TGFxcStpZFQ3QlZybDhGOGFJVWp0dkFTenJFSUdHYUlOTzNCTWpCZ1MyZkRNVFYxWmJyNUNtNkkvMTVrZXhCVWRTcldYbkNnaDlNQmNuOFpqZ3hiNmJVVHVqVU9uM3Z1elplYitUVC9jMHB4aThHSUhTTzRzQm1RV25GejRkNm9paTI2TDh6VllCK2RGcEJEMkpxZFgyRkZkN1dwZXl6NUlsbDZDdTR5S2ZBMlowdWlma0tDZVIwTTIvQkVrbzU2N3FJUGdQSFp1NmRoRGttdk45L2J3azNSd292MllUSEl4N3MxVG5xMUlPOSsrcFZ6eFptZWFSRlYvek92UTlKTi9mWHN5dklYZWlvVFZoRDN3VHZyZlVDTnNMaUJ6MFBuYjhiaXJhVzBkRG92bnM2R2tWU2t1RDNsbFAyRFVpTEVIMVV4elNSMHJ5MlJTdW9UdVMydHNrM1dzRnowbGkyWS9KLzRGUEVtcUIyN1FHcitTU2ZIUVNQaE44aVlQUTVFMmNld0xLRGxJUXZiUEcwM3pUamgxNHZ6REkrbDNQZ1lqSzQ0TExzTGpLNnJ5QU05MTBmdnM1S2prcDlmOVFkQUtNaFB0MzJCTDVWS1pzUkNqUVdDQkE4Q0FlNE55ZFl0dEh2QW5ZZkMrNjVnd290YkkvYy9NWGVnbjRJb1dTRGl3cUJaaTBGb2lpSzdDaVNvYkNLMi9udmlTU1VuTWFRd0pkdXVYU2pyYndTZk1YbGlXUkt3U1dENTZIemxpaDRZMm5xWVF2OVQ5b0pYRmFNa3F4TllIZ1JKNEVxQTFPMlJWRDI0R0NLRmhYWEJrNEVVUGgvdk5DSXRqZUp0ZHcvd042cTZGaTBrMVdzMDEvelNLSWFaQVlMYWczUXg1VjdjOVFJWE9KY0kwYnNab1VITnZrMUFNRldIYkQreE5QZTF0VndqVGMrNVMxeU1SakFwd1FkZ3ZJNGRoWXZzWUp3ZzhnRDc1dm1lYy9WbU5qY3Z4Qlc3U3NkS1lDeXQzKyt4M1JOVkVPZTNuUmZrR002cjFCNHR1aVk3N2pQd3ozY3Jjc1d3aExRQnU3WS9FR3VLelJrTVQ5bnJSZnBnaTQyTVo0N0ZtTnN1emNiYnBIZk40MTVDaG1FY0ZZanUrd1FCL2xTbW1ScWNyczQyZUxKbTRiVmxydnpZc0pwVGZ0WjFlbXdUYks5aWhxYUNJUkRxSk1YM09Qd2xUOFIvTFRtT0NoMjRTSGtjM28wR1ZnUVA4Z0h1RGU0aUxZWFBWWTh6bUNIWkt5UGYzTGI2YVhYeHhwMlJxaW1YUGpRWUl2a1BxYzliS3RHSzk0RWlzRDl3SFJieXlZVkkyNGVxMzNpbUNxNlZUQW11WGg3aVltSHg4MWRFUE5zNnNFS0lYRWtYLy8yaElZbWN1NmRpRzhRcmR0b1JsMDFmem1rMTEvRUxXcGwvdm1Ma2hhMkRUN1psdjBZcVBJNUhvTEJhTGYxSXJNU0IrNEt1S3VIYjFUUVRpTnMya01zd2NkUkpORk1VbTB6NlBYSFdwSUFod0ZWc0g2cEg3ZXI4di90cElQM3FGYStVMTl6UStET3kzK3hlK3pGK2ZrZXdxYmRVaU1Kakh6L2FYenZsdlRrNnNJaGVEalFEaWxFOWZzT2phZWhmM0gycHVmdFNyZ1BQOEUza3hwN0s5dkM5RFk5TVNJTmVpVHVuMUhad0VpcEplM1ZHR2dwMlNIN1dYLzBKMTAwWG9VellOd2xjUXJBdFFuMGlYREh5MTFMdWVVbjhXOWt1K0VCM1AxUTJ0czBuVC9BZGVDN0o0dlVrekNaaHIxN1phSlVCam5KWXNObWgwODRTb2p5elFxNlNydlJhWitaRk04YXJuV3BMMTZSdVNJQWxJa21hT1ZMZ3RudCt5RVJxNllGb0VqdURhb21JeXBwVlBTK3JOWnVSUmZMcUxNK1BMbVJzTkFkRVJvMEZ3Z1FRNGdIdURkWE9OanBSSmtuNHdwVndoRFc0WXRXeC9neHpMcDg4OFlJc2ZFdlI2VUswNjJ5Q1RWZVZMU2c0TGE4RGlzV3BHNnhOZEpqZmxQcGZLS0VyVWJBZXBwM0dLRUFEVGRDTVZoeG02Ukc2a0ZRbGJKUnYyRk9icGUvNUx5V2t5bEpTN1pxWUtmS28wY04zbk13dDJXZVgyWEx4MVRVRFNmd2lOYWljYVA4bnorRWpoeE1OeFY5OFl5MUREcG41QUhTd0liUExXZzRMTDRpOTltbDgralFTYmkyNElob0txYmFBUDNMcXVMREYzdU0weGRoSDF1VlA2a21QRjUxVzhYV1dnd1QyWS8zRnpNenVhL0h0Z0V5a3p2ZHpSZVNiTVdnSG1jTlJJeG9xeklHSnloOUo5aWlxWlFvMUl2Zjc5ajJRNUVCOWVXNDFBUGIzWkxoL2ZJc09pQ3QvZnZKMysrWUNVV0h4ejUvU1ZDdnhVTkR2ZVJERUwxdXFMWG5BR3BPZk45bEpzSkRyYVlrZ05xZGRvNGVUbUl0MGtYOTJINWpiOHNHQnJhamJGNEx6SWV1N2p0YWwwNG0zWWU4UUpPNVVua3pvSTNsN0Q1aDgzUmNLMlVQbVAvcyttcFpoSHdsV1VOUkE9"
                  let audioURL = base64data2.toString()
                  //let audioURL = res.name // TESTANDO com string dá certo
                  console.log('audioURL after buffer toString:', audioURL)
                  audio.src = audioURL;
                  audio.controls = true;
                  audio.preload = 'metadata'
                  audio.load();
                }

              },
              error: () => alert('Erro ao carregar áudio.')
            });
          //const audioURL = window.URL.createObjectURL(blob);
          //audio.srcObject = mediaRecorder;
          //audio.src = audioURL;
          //audio.controls = true;
          // audio.preload = 'metadata';
          // audio.load();

          //downloadButton.href = audioURL;


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
