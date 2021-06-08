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
var _ = require('lodash');

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

  async getTeams() {
    this.teams$ = this.teamService.getOwnTeams();

    this.subscribeTeams$ = this.teams$.subscribe(
      teams => {
        this.totalTeams = teams.length;
        teams.forEach(team => {
          this.membersByTeams.push([team.name, team.members.length]);
          this.totalMembers += team.members.length;
          this.teamsIds.push(team._id);
          console.log('teamsIds: ', this.teamsIds);
        })
        this.teamsIds.forEach(
          id => {
            console.log('forEach id= ', id);
            //jsdatestring: 'mes-dia-ano'
            this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true).pipe(
              // this.audiosByTeams.push({ id: id, audios: audios })
              // map(audioList => this.audiosByTeams.push(audioList)),

              // map(audioList => audioList.forEach(audio => {
              //   this.audiosByTeams.push(audio)
              // })),

            ).subscribe(audioList => {

              // console.log('audiosByTeams: ', this.audiosByTeams);
              audioList.forEach(audioByTeam => this.audiosTeam0.push([audioByTeam.team, audioByTeam.member.name]));
              console.log('audiosTeam0: ', this.audiosTeam0);


            });
          });

      });

    // this.audiosTeam0.push(this.audiosByTeams[0]);
    // console.log('audiosTeam0: ', this.audiosTeam0);
    // this.audiosByTeams[1].forEach(val => console.log());

  }







  // async getAudiosByTeam() {
  //   this.teamsIds.forEach(
  //     id => {
  //       console.log('forEach id= ', id);
  //       //jsdatestring: 'mes-dia-ano'
  //       this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true).subscribe(
  //         audios => {
  //           this.audiosByTeams.push({ id: id, audios: audios });
  //         });
  //     });
  //   this.audiosByTeams.forEach(
  //     audioByTeam => {
  //       console.log('teste');
  //     });
  //   console.log('audiosByTeams', this.audiosByTeams[0]);
  // }

  // async getAudios() {
  //   await this.getTeams();

  //   await this.getAudiosByTeam();
  //   // this.audios$ =

  //   // this.subscribeAudios$ = this.audios$.subscribe(
  //   //   audios => {
  //   //     console.log(audios);
  //   //   }
  //   // );

  // }


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
