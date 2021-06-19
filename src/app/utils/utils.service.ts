import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {


  constructor() { }



  dateModelToString(dateModel) {
    // return format: 'MM/DD/YYYY'
    // para uso em navegadores
    let date = dateModel;
    return date.month + "/" + date.day + "/" + date.year;
  }

  dateStringToAPIFormat(dateString) {
    // return format: 'MM-DD-YYYY'
    // para uso na api com envio por url
    return dateString.replace('-', '/');
  }

  nextDayModelToString(dateModel) {
    // return next day (dateModel)
    // para uso em firefox, passar model para formato: 'MM/DD/AAAA'
    // para uso na api com envio por url, usar formato 'MM-DD-AAAA'
    let jsDateStringStart = this.dateModelToString(dateModel)
    let jsDateStart = new Date(jsDateStringStart);
    var jsDateEnd = new Date(jsDateStart.getTime() + 86400000); // + 1 day in ms
    // Date em js: mês começa do 0
    return (jsDateEnd.getMonth() + 1) + "-" + jsDateEnd.getDate() + "-" + jsDateEnd.getFullYear();
  }

  todayString() {
    let jsDateToday = new Date();
    return (jsDateToday.getMonth() + 1) + "-" + jsDateToday.getDate() + "-" + jsDateToday.getFullYear();

  }

  nextDayString() {
    let jsDateToday = new Date();
    var jsDateEnd = new Date(jsDateToday.getTime() + 86400000); // + 1 day in ms
    // Date em js: mês começa do 0
    return (jsDateEnd.getMonth() + 1) + "-" + jsDateEnd.getDate() + "-" + jsDateEnd.getFullYear();
  }

}