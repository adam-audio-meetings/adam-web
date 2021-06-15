import { Component, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from 'src/app/teams/team.service';
import { Team } from 'src/app/teams/interfaces/team';
import { Audio } from '../interfaces/audio';
import { count } from 'console';
import { interval, Observable, Subscription } from 'rxjs';
import { AudioService } from '../audio.service';
import { delay, finalize, map, takeUntil, share, tap, take } from 'rxjs/operators';
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
  summarizeAudios$: Observable<any>;
  membersByTeams = [];

  teamsIds = [];
  audiosByTeams = [];
  audiosByTeamsAll = [];

  audios$: Observable<Audio[]>;

  // audiosByTeamsMock = [
  //   [new Date(2021, 1, 1), 3, 5]
  //   ['2021', 3, 5]
  // ]

  selectedTeamId: string;
  selectedTeamName: string;

  // inicializa google chart parameters
  chartMembersByTeams = {
    title: 'Membros por Equipe',
    type: 'PieChart',
    data: [],
    chartColumns: ['Equipe', 'Qtde Integrantes'],
    options: {
      pieHole: 0.4,
      pieSliceTextStyle: {
        color: 'black',
      },
      // legend: 'none'
    }
  }

  audioByTeamsByDate = [];

  chartAudiosByTeams = {
    title: 'Envio de Áudios por Integrantes da Equipe',
    type: 'AreaChart',
    data: [],
    chartColumns: ['Data', 'Participantes', 'Qtde Integrantes']
  };

  getTeamsSummary(): void {

    this.teamService.getOwnTeams()
      .pipe(
        // delay(700),
        take(1),
      )
      .subscribe(
        (teams) => {
          // inicializa seletor de equipes
          this.selectedTeamName = teams[0].name;
          this.selectedTeamId = teams[0]._id;
          // console.log(teams)
          this.totalTeams = _.size(teams);
          _.forEach(teams,
            team => {
              // total count members by team
              this.membersByTeams.push([team.name, _.size(team.members)])
              // console.log(this.membersByTeams)
              // total members
              this.totalMembers += _.size(team.members)
              // teams IDS
              this.teamsIds.push(team._id);
            });
        },
        error => { alert('Dashboard. Erro ao buscar equipes no servidor') },

        //complete
        () => {
          this.updateChartMembersByTeams();
          // this.getAudiosAllTeams(this.teamsIds);
          // console.log(this.teamsIds);
          // inicializa gráfico com áudios da primeira equipe do corrdenador
          this.getAudiosByTeam(this.selectedTeamId);
        }
      )
  }

  updateChartMembersByTeams() {
    this.chartMembersByTeams.data = this.membersByTeams;
  }


  getAudiosByTeam(id) {
    // console.log('teamdIds: ', teamsIds)

    // console.log('forEach id= ', id);
    //jsdatestring: 'mes-dia-ano'
    // this.subscribeAudios$ = this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true)
    this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true)
      .pipe(take(1))
      .subscribe(
        audios => {
          this.audiosByTeams = []
          // this.audiosByTeams = audios
          // console.log('audios para teamId: ', id);
          //this.audiosByTeams.push({ id: id, data: [] });
          _.forEach(audios, audio => {
            // TODO: verificar MES (inicia em 0 ou 1)
            let date = new Date(audio.created_at)
            this.audiosByTeams.push({ teamId: audio.team, audioMemberId: audio.member._id, audioMemberName: audio.member.name, audioCreatedAt: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}` })
          })
          // agrupa por data > idMember (nome) : contagem de envios de áudios de usuários distintos por data
          let groupAudiosByDate = _.groupBy(this.audiosByTeams, 'audioCreatedAt')
          let audioByTeamsByDateTemp = []
          // group[0].audioCreatedAt
          _.forEach(groupAudiosByDate, group => { audioByTeamsByDateTemp.push([group[0].audioCreatedAt, _.size(_.groupBy(group, 'audioMemberId')), 5]) })
          // console.log('audiosByTeams: ', this.audiosByTeams)
          // console.log('groupAudiosByDate: ', groupAudiosByDate)
          this.audioByTeamsByDate = audioByTeamsByDateTemp

          // console.log('audioByTeamsByDate: ', this.audioByTeamsByDate)
          console.log('audioByTeams', this.audiosByTeams);
          // console.log('audioByTeamsAll', this.audiosByTeamsAll);

        },
        error => { alert('Dashboard. Erro ao buscar aúdios do servidor') },

        //complete
        () => {
          this.updateChartAudiosByTeamsFilter();
        }
      );
  }

  updateChartAudiosByTeamsFilter() {
    // this.chartAudiosByTeams.data = this.audiosByTeamsMock;
    this.chartAudiosByTeams.data = this.audioByTeamsByDate;
  }

  // getAudiosAllTeams(teamsIds) {
  //   // TODO: não utilizada função com total
  //   // console.log('teamdIds: ', teamsIds)
  //   teamsIds.forEach(
  //     id => {
  //       // console.log('forEach id= ', id);
  //       //jsdatestring: 'mes-dia-ano'
  //       // this.subscribeAudios$ = this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true)
  //       this.audioService.searchAudios(id, '3-5-2021', '6-5-2022', true)
  //         .pipe(take(1))
  //         .subscribe(
  //           audios => {
  //             this.audiosByTeams = []
  //             // this.audiosByTeams = audios
  //             // console.log('audios para teamId: ', id);
  //             //this.audiosByTeams.push({ id: id, data: [] });
  //             _.forEach(audios, audio => {
  //               // TODO: verificar MES (inicia em 0 ou 1)
  //               let date = new Date(audio.created_at)
  //               this.audiosByTeams.push({ teamId: audio.team, audioMemberId: audio.member._id, audioMemberName: audio.member.name, audioCreatedAt: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}` })
  //             })
  //             // agrupa por data > idMember (nome) : contagem de envios de áudios de usuários distintos por data
  //             let groupAudiosByDate = _.groupBy(this.audiosByTeams, 'audioCreatedAt')
  //             let audioByTeamsByDateTemp = []
  //             // group[0].audioCreatedAt
  //             _.forEach(groupAudiosByDate, group => { audioByTeamsByDateTemp.push([group[0].audioCreatedAt, _.size(_.groupBy(group, 'audioMemberId')), 5]) })
  //             // console.log('audiosByTeams: ', this.audiosByTeams)
  //             // console.log('groupAudiosByDate: ', groupAudiosByDate)
  //             this.audioByTeamsByDate = audioByTeamsByDateTemp

  //             // console.log('audioByTeamsByDate: ', this.audioByTeamsByDate)
  //             this.audiosByTeamsAll.push([id, audioByTeamsByDateTemp]);
  //             // console.log('audioByTeams', this.audiosByTeams);
  //             // console.log('audioByTeamsAll', this.audiosByTeamsAll);

  //           },
  //           error => { alert('Dashboard. Erro ao buscar aúdios do servidor') },

  //           //complete
  //           () => {
  //             this.updateChartAudiosByTeams();
  //           }
  //         );
  //     })
  // }

  // updateChartAudiosByTeams() {
  //   // this.chartAudiosByTeams.data = this.audiosByTeamsMock;
  //   // this.chartAudiosByTeams.data = this.audioByTeamsByDate;
  //   if (this.audiosByTeamsAll.length == this.teamsIds.length) {
  //     console.log(this.audiosByTeamsAll)
  //     this.audiosByTeamsAll.forEach(group => this.chartAudiosByTeams.data.push(group[1]));
  //     // this.audiosByTeamsAll.forEach(group => console.log(group));
  //   }
  //   console.log('chartAudiosByTeams.data: ', this.chartAudiosByTeams.data);
  // }

  ngOnInit(): void {

    this.teams$ = this.teamService.getOwnTeams();

    this.getTeamsSummary();

  }

  ngOnDestroy(): void {
  }
}
