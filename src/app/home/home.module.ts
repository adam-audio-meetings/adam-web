import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { HomeComponent } from './home/home.component';
import { HomeCoordinatorComponent } from './home-coordinator/home-coordinator.component';
import { HomeMemberComponent } from './home-member/home-member.component';
import { PocAudioComponent } from './poc-audio/poc-audio.component';
import { AudiolistenedDirective } from './audiolistened.directive';


@NgModule({
  declarations: [HomeComponent, HomeAdminComponent, HomeCoordinatorComponent, HomeMemberComponent, PocAudioComponent, AudiolistenedDirective],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
