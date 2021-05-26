import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamsRoutingModule } from './teams-routing.module';
import { TeamFormComponent } from './team-form/team-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamFilterPipe } from './team-filter.pipe';


@NgModule({
  declarations: [
    TeamFormComponent,
    TeamListComponent,
    TeamFilterPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TeamsRoutingModule,
  ]
})
export class TeamsModule { }
