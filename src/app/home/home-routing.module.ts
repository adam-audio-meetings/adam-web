import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { HomeMemberComponent } from './home-member/home-member.component';
import { HomeCoordinatorComponent } from './home-coordinator/home-coordinator.component';
import { HomeComponent } from './home/home.component';
import { PocAudioComponent } from './poc-audio/poc-audio.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'poc-audio', component: PocAudioComponent },

  {
    path: 'home',
    //canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          { path: 'admin', component: HomeAdminComponent },
          { path: 'coordinator', component: HomeCoordinatorComponent },
          { path: 'member', component: HomeMemberComponent },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
