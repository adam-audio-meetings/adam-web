import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { HomeComponent } from './home/home.component';
import { HomeCoordinatorComponent } from './home-coordinator/home-coordinator.component';
import { HomeMemberComponent } from './home-member/home-member.component';
import { AudioMeetingComponent } from './audio-meeting/audio-meeting.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleChartsModule } from 'angular-google-charts';
import { SessionCounterPipe } from '../session-counter.pipe';


@NgModule({
  declarations: [
    HomeComponent,
    HomeAdminComponent,
    HomeCoordinatorComponent,
    HomeMemberComponent,
    AudioMeetingComponent,
    SessionCounterPipe
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    // GoogleChartsModule
    GoogleChartsModule.forRoot({ mapsApiKey: 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY' })
  ]
})
export class HomeModule { }
