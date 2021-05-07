import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { UserFormComponent } from './user-form/user-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserFilterPipe } from './user-filter.pipe';


@NgModule({
  declarations: [
    UserListComponent,
    UserFormComponent,
    UserSearchComponent,
    UserFilterPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule,
  ]
})
export class UsersModule { }
