import { Component, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';
import { Audio } from '../interfaces/audio';
import { count } from 'console';
import { Observable, Subscription } from 'rxjs';
import { AudioService } from '../audio.service';
import { delay, finalize, map, takeUntil } from 'rxjs/operators';
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
  teamsData: Team[];
  membersByTeams = [];
  subscribeTeams$: Subscription;

  teamsIds = [];
  audiosByTeams = [];
  audiosTeam0 = [];

  audios$: Observable<Audio[]>;
  subscribeAudios$: Subscription;

  // google chart
  chartMembersByTeams = {
    title: 'Membros por Equipe',
    type: 'PieChart',
    data: this.membersByTeams,
    chartColumns: ['Equipe', 'Qtde Integrantes']
  }

  audiosByTeamsMock = [
    ['2021-5-1', 3, 5],
    ['2021-5-1', 3, 5],
    ['2021-5-2', 3, 5],
    ['2021-5-3', 3, 5],
    ['2021-5-4', 5, 5],
    ['2021-5-5', 3, 5],
    ['2021-5-6', 4, 5],
    ['2021-5-7', 3, 5],
    ['2021-5-8', 3, 5],
    ['2021-5-9', 3, 4],
    ['2021-5-10', 3, 5],
    ['2021-5-11', 3, 5],
    ['2021-5-12', 3, 5],
  ]

  dashboardData2 = [];

  chartAudiosByTeams = {
    title: 'Áudios (?) por Integrantes da Equipe',
    type: 'AreaChart',
    data: this.audiosByTeamsMock,
    chartColumns: ['Data', 'Áudios entregues', 'Qtde Integrantes']
  }

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
  getAudios(teamsIds) {
    // console.log('teamdIds: ', teamsIds)
    teamsIds.forEach(
      id => {
        console.log('forEach id= ', id);
        //jsdatestring: 'mes-dia-ano'
        this.subscribeAudios$ = this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true)
          .subscribe(
            audios => {
              // this.audiosByTeams = audios
              console.log('audios para teamId: ', id);
              _.forEach(audios, audio => {
                // TODO: verificar MES (inicia em 0 ou 1)
                let date = new Date(audio.created_at)
                this.audiosByTeams.push({ teamId: audio.team, audioMemberId: audio.member._id, audioMemberName: audio.member.name, audioCreatedAt: `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}` })
              })
              // agrupa por data > idMember (nome) : contagem de envios de áudios de usuários distindos por data
              //TODO: pegar por data sem hora
              let groupAudiosByDate = _.groupBy(this.audiosByTeams, 'audioCreatedAt')
              this.dashboardData2 = []
              // group[0].audioCreatedAt
              // _.forEach(groupAudiosByDate, group => { this.dashboardData2.push(new Date('5-5-2021'), _.size(_.groupBy(group, 'audioMemberId')), 10) })
              _.forEach(groupAudiosByDate, group => { this.dashboardData2.push([123456, _.size(_.groupBy(group, 'audioMemberId')), 10]) })
              // console.log('audiosByTeams: ', this.audiosByTeams)
              console.log('groupAudiosByDate: ', groupAudiosByDate)
              console.log('dashboardData2: ', this.dashboardData2)

            });

      })


  }


  ngOnInit(): void {

    this.teams$ = this.teamService.getOwnTeams().pipe(
      map((teams) => {
        console.log(teams)

        // this.teamsData = teams
        this.totalTeams = _.size(teams)

        _.forEach(teams,
          team => {
            // total count members by team
            this.membersByTeams.push([team.name, _.size(team.members)])
            // total members
            this.totalMembers += _.size(team.members)
            // teams IDS
            this.teamsIds.push(team._id);
          })

        this.getAudios(this.teamsIds);

        return teams
      }),

      // finalize(() => console.log('funcionando pipe')
      // )
    )
  }

  ngOnDestroy(): void {
    this.subscribeAudios$.unsubscribe();
  }
}
