import { Component } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'adam-web';
  public isMenuCollapsed = true;
  roles$: Observable<any[]>;

  imageUrl: Observable<string | null>;

  constructor(
    // firestore: AngularFirestore,
    // private storage: AngularFireStorage,
    public authService: AuthService
  ) {

    // this.roles$ = firestore.collection('roles').valueChanges({ idField: '_id' });

    // const ref = this.storage.ref('github.png');
    // this.imageUrl = ref.getDownloadURL();

  }

}
