import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MessagesComponent } from './messages/messages.component';
import { HomeModule } from './home/home.module';

import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { CommonModule } from '@angular/common';
import { AuthModule } from './auth/auth.module';
import { httpInterceptorProviders } from './http-interceptors';
import { SessionCounterPipe } from './session-counter.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WebsocketService } from './socket/websocket.service';
// import { DataService } from './socket/data.service';

// import { AngularFireModule } from '@angular/fire';
// import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
// import { AngularFirestoreModule } from '@angular/fire/firestore';
// import { AngularFireStorageModule, BUCKET } from '@angular/fire/storage';
// import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MessagesComponent,
    SessionCounterPipe,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HomeModule,
    UsersModule,
    TeamsModule,
    AuthModule,
    NgbModule,
    // AngularFireModule.initializeApp(environment.firebase),
    // AngularFireAnalyticsModule,
    // AngularFirestoreModule,
    // AngularFireStorageModule,
    AppRoutingModule,
  ],
  providers: [
    httpInterceptorProviders,
    // { provide: BUCKET, useValue: environment.firebase.storageBucket },
    // DataService
    WebsocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
