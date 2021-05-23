import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { TeamFormComponent } from './team-form/team-form.component';
import { TeamListComponent } from './team-list/team-list.component';

const routes: Routes = [
  { path: 'teams-noauth', component: TeamListComponent },
  { path: 'teams-noauth/subscribe', redirectTo: '/login' },

  {
    path: 'teams',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          { path: '', component: TeamListComponent },
          { path: 'available', component: TeamListComponent },
          { path: 'form', component: TeamFormComponent },
          { path: 'random', component: TeamFormComponent }, /** ONLY FOR DEVELOPMENT/TESTS */
          { path: 'edit/:id', component: TeamFormComponent },
        ]
      }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamsRoutingModule { }
