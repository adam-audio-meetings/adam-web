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
import { UtilsService } from 'src/app/utils/utils.service';

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
    private utils: UtilsService,
  ) { }

  totalTeams: number;
  totalMembers: number = 0;
  teams$: Observable<Team[]>;
  summarizeAudios$: Observable<any>;
  membersByTeams = [];
  membersByTeamsSummary = [];

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
  colors = ['#FA7059', '#17a2b8', '#80FA82', '#FAEA5B', '#DFA4FA']
  // colors = ['#FA7059', '#4395FA', '#80FA82', '#FAEA5B', '#DFA4FA']
  fontName = 'Segoe UI'
  fontSize = 16
  backgroundColor = 'transparent'

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
      colors: this.colors
    }

  }

  audioByTeamsByDate = [];
  audioByTeamsToday = [];

  chartAudiosByTeamsToday = {
    title: 'Envio de Áudios: Hoje',
    type: 'PieChart',
    data: [],
    chartColumns: ['Entregues', 'Faltantes'],
    dynamicResize: true,
    options: {
      fontSize: this.fontSize,
      fontName: this.fontName,
      pieHole: 0.4,
      pieSliceText: 'none',
      pieSliceTextStyle: {
        color: '#919191',
      },
      legend: 'label',

      sliceVisibilityThreshold: 0,
      colors: [],
      backgroundColor: this.backgroundColor,
    }
  };

  chartAudiosByTeams = {
    title: 'Envio de Áudios: Período',
    type: 'AreaChart',
    data: [],
    chartColumns: ['Data', 'Participantes', 'Qtde Integrantes'],
    options: {
      colors: this.colors,
    }
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
              //// usando tamanho de matriz específico para PieChart (2 colunas) 
              this.membersByTeams.push([team.name, _.size(team.members)])
              //// objeto com id e demias dados de somatório para outros gráficos
              this.membersByTeamsSummary.push({ id: team._id, name: team.name, count: _.size(team.members) })

              // total members
              this.totalMembers += _.size(team.members)

              // teams IDS
              this.teamsIds.push(team._id);
            });
        },
        error => { alert('Dashboard. Erro ao buscar equipes no servidor') },

        //complete
        () => {
          this.updateCharts();
        }
      )
  }

  updateCharts() {
    this.updateChartMembersByTeams();

    // inicializa gráficos com áudios da primeira equipe do coordenador
    this.updateChartAudiosByTeamsTodayFilter();
    this.updateChartAudiosByTeamsFilter();
  }

  updateChartMembersByTeams() {
    this.chartMembersByTeams.data = this.membersByTeams;
  }

  getAudiosByTeam(chart, cols, id, startDateString?, endDateString?) {

    //TODO: passar definição de datas iniciais para audioService.searchAudios
    // date string format: 'DD-MM-YYYY'
    if (!startDateString) {
      startDateString = this.utils.todayString()
      // startDateString = '3-5-2021'
    }
    if (!endDateString) {
      endDateString = this.utils.nextDayString()
      //'6-5-2022'
    }

    this.audioService.searchAudios(id, startDateString, endDateString, true)
      .pipe(take(1))
      .subscribe(
        audios => {
          let audiosByTeams = []
          _.forEach(audios, audio => {
            // MES (inicia em 0)
            let date = new Date(audio.created_at)
            audiosByTeams.push(
              {
                teamId: audio.team,
                audioMemberId: audio.member._id,
                audioMemberName: audio.member.name,
                audioCreatedAt: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
              })
          })

          // agrupa por data > idMember (nome) : contagem de envios de áudios de usuários distintos por data
          let groupAudiosByDate = _.groupBy(audiosByTeams, 'audioCreatedAt')
          let audioByTeamsByDateTemp = []

          // utilizando número total de inscritos na equipe atualmente (data da geração do gráfico)
          // TODO: deve usar total de instritos na respectiva data
          _.forEach(groupAudiosByDate, group => {
            let membersByTeamsCount = _.filter(this.membersByTeamsSummary, { id: id })[0].count

            if (cols == 2) {
              audioByTeamsByDateTemp.push(['Entregue', _.size(_.groupBy(group, 'audioMemberId'))])
              audioByTeamsByDateTemp.push(['Faltante', membersByTeamsCount - _.size(_.groupBy(group, 'audioMemberId'))])
              chart.options.colors = ['#17a2b8', '#c1c1c1']
              chart.options.pieSliceText = 'none'
            } else {
              // formato: [ data, distinct_sent_audios_count, members_count_by_team]
              audioByTeamsByDateTemp.push([group[0].audioCreatedAt, _.size(_.groupBy(group, 'audioMemberId')), membersByTeamsCount])
            }
          })
          if (audioByTeamsByDateTemp.length == 0) {
            // TODO: fazer slice em momento posterior 
            if (cols == 2) {
              let membersByTeamsCount = _.filter(this.membersByTeamsSummary, { id: id })[0].count
              audioByTeamsByDateTemp.push(['Entregue', 0])
              audioByTeamsByDateTemp.push(['Faltante', membersByTeamsCount])
              chart.options.colors = ['#c1c1c1', '#17a2b8']
              chart.options.pieSliceText = 'none'
            } else {
              // formato: [ data, distinct_sent_audios_count, members_count_by_team]
              audioByTeamsByDateTemp = [[this.utils.todayString(), 0, _.filter(this.membersByTeamsSummary, { id: id })[0].count]]
            }
          }

          chart.data = audioByTeamsByDateTemp;


        },
        error => { alert('Dashboard. Erro ao buscar aúdios do servidor') },

        //complete
        () => {
        }
      );
  }


  updateChartAudiosByTeamsTodayFilter() {
    this.getAudiosByTeam(this.chartAudiosByTeamsToday, 2, this.selectedTeamId);
  }

  updateChartAudiosByTeamsFilter() {
    this.getAudiosByTeam(this.chartAudiosByTeams, 3, this.selectedTeamId, '5-1-2021');
  }

  ngOnInit(): void {

    this.teams$ = this.teamService.getOwnTeams();

    this.getTeamsSummary();

  }

  ngOnDestroy(): void {
  }
}
