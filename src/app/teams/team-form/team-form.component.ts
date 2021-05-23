import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { TeamService } from "../team.service";
import { Team } from '../interfaces/team';
import { Observable } from 'rxjs';
import { MOCK_TEAM_NAMES } from '../mocks/team-names';


@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.css']
})
export class TeamFormComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private teamService: TeamService,
    private location: Location
  ) { }

  team: Team;

  categories: null;

  teamForm = this.fb.group({
    _id: [null],
    name: ['', Validators.required],
    // category: ['', Validators.required],
    description: ['', Validators.required],
  });

  id: string = this.route.snapshot.paramMap.get('id');

  resetButtonText: string = "Limpar";
  backButtonText: string = "Voltar";


  ngOnInit(): void {
    // this.categories = ;
    /** ONLY FOR DEVELOPMENT/TESTS */
    // console.warn("Rota: ",this.route.snapshot.routeConfig.path);
    if (this.route.snapshot.routeConfig.path == "random") {
      this.teamForm.patchValue(this.getMockTeam());
    }
    else if (this.id) {
      this.getTeamInForm();
    }

    // this.teamForm.get('_id').disable(); /** TODO: automatic id from server */
  }

  getTeamInForm(): void {
    const id: string = this.id;
    // console.warn('GET TEAM id: ', this.id)
    this.teamService.getTeam(id)
      .subscribe(team => this.teamForm.patchValue(team));
    ;
  }

  onSubmit() {
    if (this.teamForm.value._id) {
      this.teamService.updateTeam(this.teamForm.value)
        .subscribe({
          next: () => alert('Dados atualizados com sucesso.'),
          error: () => alert('Erro ao atualizar dados.'),
          complete: () => this.goBack()
        })
    } else {
      this.teamService.createTeam(this.teamForm.value)
        .subscribe({
          next: () => alert('Nova equipe criada com sucesso.'),
          error: () => alert('Erro ao criar a equipe.'),
          complete: () => this.goBack()
        })
    }
  }

  onReset(): void {
    this.teamForm.reset();
  }

  goBack(): void {
    this.onReset();
    this.location.back();
  }

  /** ONLY FOR DEVELOPMENT/TESTS */
  getMockTeam() {

    const mockCategoryIndex = Math.floor(Math.random() * 3); /* 0 a 2 */
    const mockName = MOCK_TEAM_NAMES[mockCategoryIndex];
    const mockTeamNumber = (100 + Math.floor(Math.random() * 900)).toString();  /* 100 a 999 */
    const mockTeam = `${mockName} ${mockTeamNumber}`;

    const team = {
      "coordinator": null,
      "members": [],
      "_id": null,
      "name": mockTeam,
      "category": null,
      "description": mockTeam + 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla a nobis, id consectetur veniam, veritatis quos maiores dolor!',
    }
    return team
  }

}
