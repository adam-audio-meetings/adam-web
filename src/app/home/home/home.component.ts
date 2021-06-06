import { Component, OnInit } from '@angular/core';
// import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  imageUrl: Observable<string | null>;

  constructor(
    // private storage: AngularFireStorage
  ) {
    // const ref = this.storage.ref('hero.jpg');
    // this.imageUrl = ref.getDownloadURL();
  }

  ngOnInit(): void {
  }

}
