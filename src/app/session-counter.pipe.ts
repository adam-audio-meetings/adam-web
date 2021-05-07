import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sessionCounter'
})
export class SessionCounterPipe implements PipeTransform {

  transform(remainSeconds: number): string {
    const minutesNumber: number = Math.floor(remainSeconds/60);
    const secondsNumber: number = remainSeconds%60;
    const minutes: string = minutesNumber.toString().padStart(2,'0');
    const seconds: string = secondsNumber.toString().padStart(2,'0');
    return `${minutes}:${seconds}`;
  }

}
