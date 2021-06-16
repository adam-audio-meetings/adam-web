import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {


  constructor() { }



  dateModelToString(dateModel) {
    // return format: 'MM-DD-YYYY' 
    let date = dateModel;
    return date.month + "-" + date.day + "-" + date.year;
  }

  nextDayModelToString(dateModel) {
    // return next day (dateModel)
    let jsDateStringStart = this.dateModelToString(dateModel)
    let jsDateStart = new Date(jsDateStringStart);
    var jsDateEnd = new Date(jsDateStart.getTime() + 86400000); // + 1 day in ms
    // console.log(jsDateEnd.toDateString());
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