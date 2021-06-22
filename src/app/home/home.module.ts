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
import { NotifierModule, NotifierOptions } from 'angular-notifier';

/**
 * Custom angular notifier options
 */
const customNotifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: 'right',
      distance: 11
    },
    vertical: {
      position: 'top',
      distance: 105,
      gap: 10
    }
  },
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};
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
    NotifierModule.withConfig(customNotifierOptions),
    // GoogleChartsModule,
    // AngularFireModule.initializeApp(environment.firebase),
    // AngularFireAnalyticsModule,
    // AngularFirestoreModule,
    // AngularFireStorageModule,
    // GoogleChartsModule
    GoogleChartsModule.forRoot({ mapsApiKey: 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY' })
  ]
})
export class HomeModule { }
