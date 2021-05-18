import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appAudiolistened]'
})
export class AudiolistenedDirective {

  constructor() { }

  @HostListener('play') onPlay() {
    console.log();
  }

}
