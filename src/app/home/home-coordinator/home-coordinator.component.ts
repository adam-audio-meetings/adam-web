import { Component, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';
import { Audio } from '../interfaces/audio';
import { count } from 'console';
import { Observable, Subscription } from 'rxjs';
import { AudioService } from '../audio.service';
import { delay, finalize, map, takeUntil, share } from 'rxjs/operators';
import { isThisTypeNode } from 'typescript';
import { User } from 'src/app/users/interfaces/user';
import * as _ from 'lodash';
import { Formatter, ScriptLoaderService } from 'angular-google-charts';

@Component({
  selector: 'app-home-coordinator',
  templateUrl: './home-coordinator.component.html',
  styleUrls: ['./home-coordinator.component.css']
})
export class HomeCoordinatorComponent implements OnInit, OnDestroy {

  // https://github.com/FERNman/angular-google-charts
  public readonly formatters$: Observable<Formatter[]> = this.scriptLoaderService.loadChartPackages().pipe(
    share(),
    map(() => [
      // { colIndex: 1, formatter: new google.visualization.NumberFormat({ fractionDigits: 0, prefix: '$', suffix: '‰' }) }
      { colIndex: 0, formatter: new google.visualization.DateFormat({ formatType: 'long' }) }
    ])
  );

  constructor(
    public teamService: TeamService,
    public audioService: AudioService,
    private scriptLoaderService: ScriptLoaderService,
  ) { }

  totalTeams: number;
  totalMembers: number = 0;
  teams$: Observable<Team[]>;
  teams: Team[];
  membersByTeams = [];
  // subscribeTeams$: Subscription;

  teamsIds = [];
  audiosByTeams = [];

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
    [new Date(2021, 1, 1), 3, 5]
    ,
    // [new Date('2021'), 3, 5],
    ['2021', 3, 5],
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
    ["2021-1-1", 2, 10],
    ["2021-1-1", 1, 10],
    ["2021-1-1", 1, 10],
    ["2021-1-1", 1, 10],
    ["2021-1-1", 1, 10],
    ["2021-1-1", 1, 10],
    ["2021-1-1", 2, 10],
    ["2021-1-1", 3, 10],
    ["2021-1-1", 1, 10],
  ]

  audioByTeamsByDate = [];
  audioByTeamsByDate2 = [];



  public chartAudiosByTeams = {
    title: 'Áudios (?) por Integrantes da Equipe',
    type: 'AreaChart',
    data: this.audioByTeamsByDate2,
    chartColumns: ['Data', 'Áudios entregues', 'Qtde Integrantes']
  };



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
  getOwnTeams(): void {
    this.teams$ = this.teamService.getOwnTeams()
    this.teams$.pipe(
      map(
        (teams) => {
          this.teams = teams
          this.getTeamsSummary()
          this.getAudios(this.teamsIds)
        })
    )

  }

  getAudiosByMembersByTeams(): void {
    this.teamService.getOwnTeams().subscribe(
      (teams) => {
        // TODO: verificar se deve iniciar getOwnTeams primeiro 
        // TODO: confirmar se busca audios por aqui
        this.getAudios(this.teamsIds);
      })



  }

  getTeamsSummary(): void {

    this.teamService.getOwnTeams().subscribe(
      (teams) => {
        console.log(teams)

        this.totalTeams = _.size(teams)

        _.forEach(teams,
          team => {
            // total count members by team
            this.membersByTeams.push([team.name, _.size(team.members)])
            console.log(this.membersByTeams)
            // total members
            this.totalMembers += _.size(team.members)
            // teams IDS
            this.teamsIds.push(team._id);
          })

        return teams
      })


  }

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
              let audioByTeamsByDateTemp = []
              // group[0].audioCreatedAt
              _.forEach(groupAudiosByDate, group => { audioByTeamsByDateTemp.push(['2021-1-1', _.size(_.groupBy(group, 'audioMemberId')), 10]) })
              // _.forEach(groupAudiosByDate, group => { this.audioByTeamsByDate.push([123456, _.size(_.groupBy(group, 'audioMemberId')), 10]) })
              // console.log('audiosByTeams: ', this.audiosByTeams)
              console.log('groupAudiosByDate: ', groupAudiosByDate)
              console.log('audioByTeamsByDate: ', audioByTeamsByDateTemp)
              console.log('audioByTeamsByDate typeOf: ', audioByTeamsByDateTemp[0][1].typeOf)
              // let testeArr: { date: Date, number: number } = { date: new Date(2021, 1, 1), number: 1 }
              // console.log('teste typeOf:', testeArr[0].typeOf)
              this.audioByTeamsByDate2 = audioByTeamsByDateTemp
              console.log('audioByTeamsByDate: ', this.audioByTeamsByDate)

            });

      })

  }


  ngOnInit(): void {

    this.audioByTeamsByDate2.push([1, 2, 3]);

    this.teams$ = this.teamService.getOwnTeams()
    this.teams$.pipe(
      map(
        (teams) => {
          this.teams = teams;

        })
    ).subscribe(() => {
      this.getTeamsSummary();
      console.log(this.teamsIds);
      this.getAudios(this.teamsIds);
    })

    // this.getOwnTeams()
    // this.getTeamsSummary();
    this.getAudiosByMembersByTeams();


  }

  ngOnDestroy(): void {
    // this.subscribeAudios$.unsubscribe();
  }
}
