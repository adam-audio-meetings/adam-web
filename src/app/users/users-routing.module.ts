import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { AuthGuard } from '../auth/auth.guard'

const routes: Routes = [
  { path: 'users',
    canActivate: [AuthGuard],
    children: [
      { path: '',
        children: [
          { path: '', component: UserListComponent },
          { path: 'form', component: UserFormComponent },
          { path: 'random', component: UserFormComponent }, /** ONLY FOR DEVELOPMENT/TESTS */
          { path: 'edit/:id', component: UserFormComponent },
        ]
      },
    ]
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
