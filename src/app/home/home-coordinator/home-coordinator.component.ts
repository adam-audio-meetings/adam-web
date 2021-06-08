import { Component, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';
import { Audio } from '../interfaces/audio';
import { count } from 'console';
import { Observable, Subscription } from 'rxjs';
import { AudioService } from '../audio.service';
import { delay, map } from 'rxjs/operators';
import { isThisTypeNode } from 'typescript';
import { User } from 'src/app/users/interfaces/user';
import * as _ from 'lodash';

@Component({
  selector: 'app-home-coordinator',
  templateUrl: './home-coordinator.component.html',
  styleUrls: ['./home-coordinator.component.css']
})
export class HomeCoordinatorComponent implements OnInit, OnDestroy {

  constructor(
    public teamService: TeamService,
    public audioService: AudioService,
  ) { }

  _;
  totalTeams: number;
  totalMembers: number = 0;
  teams$: Observable<Team[]>;
  membersByTeams = [];
  subscribeTeams$: Subscription;

  teamsIds = [];
  audiosByTeams = [];
  audiosTeam0 = [];

  // audios$: Observable<Audio[]>;
  // subscribeAudios$: Subscription;

  // google chart
  chartMembersByTeams = {
    title: 'Membros por Equipe',
    type: 'PieChart',
    data: this.membersByTeams,
    chartColumns: ['Equipe', 'Qtde Integrantes']
  }

  chartAudiosByTeams = {
    title: 'Áudios (?) por Integrantes da Equipe',
    type: 'PieChart',
    data: this.audiosTeam0,
    chartColumns: ['Integrante', 'Qtde Audios']
  }

  getTeams() {
    this.teams$ = this.teamService.getOwnTeams();

    this.subscribeTeams$ = this.teams$.subscribe(
      teams => {
        console.log(teams);

      });

    // this.subscribeTeams$ = this.teams$.subscribe(
    //   teams => {
    //     this.totalTeams = teams.length;
    //     teams.forEach(team => {
    //       this.membersByTeams.push([team.name, team.members.length]);
    //       this.totalMembers += team.members.length;
    //       this.teamsIds.push(team._id);
    //       // console.log('teamsIds: ', this.teamsIds);
    //     })
    //     // this.teamsIds.forEach(
    //     //   id => {
    //     //     console.log('forEach id= ', id);
    //     //     //jsdatestring: 'mes-dia-ano'
    //     //     this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true).pipe(
    //     //       // this.audiosByTeams.push({ id: id, audios: audios })
    //     //       // map(audioList => this.audiosByTeams.push(audioList)),

    //     //       // map(audioList => audioList.forEach(audio => {
    //     //       //   this.audiosByTeams.push(audio)
    //     //       // })),

    //     //     ).subscribe(audioList => {

    //     //       // console.log('audiosByTeams: ', this.audiosByTeams);
    //     //       audioList.forEach(audioByTeam => this.audiosTeam0.push([audioByTeam.team, audioByTeam.member.name]));
    //     //       console.log('audiosTeam0: ', this.audiosTeam0);


    //     //     });
    //     //   });

    //   });


  }


  ngOnInit(): void {

    this.getTeams();

    // this.audiosByTeams.forEach(
    //   audioByTeam => {
    //     console.log('audio', audioByTeam);
    //   });
    // console.log('audiosByTeams', this.audiosByTeams[0]);

  }

  ngOnDestroy(): void {
    this.subscribeTeams$.unsubscribe();
    // this.subscribeAudios$.unsubscribe();
  }
}
