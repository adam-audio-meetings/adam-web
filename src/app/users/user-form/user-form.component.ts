import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { UserService } from "../user.service";
import { User } from '../interfaces/user';
import { ROLES } from '../mocks/user-roles';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private location: Location
  ) { }

  user: User;

  roles = ROLES;

  userForm = this.fb.group({
    _id: [null],
    role: ['', Validators.required],
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    email: ['', [Validators.email, Validators.required]],
  });

  id: string = this.route.snapshot.paramMap.get('id');

  resetButtonText: string = "Limpar";
  backButtonText: string = "Voltar";


  ngOnInit(): void {
    /** ONLY FOR DEVELOPMENT/TESTS */
    // console.warn("Rota: ",this.route.snapshot.routeConfig.path);
    if (this.route.snapshot.routeConfig.path == "random") {
      this.userForm.patchValue(this.getMockUser());
    }
    else if (this.id) {
      this.getUserInForm();
    }

    // this.userForm.get('_id').disable(); /** TODO: automatic id from server */
  }

  getUserInForm(): void {
    const id: string = this.id;
    // console.warn('GET USER id: ', this.id)
    this.userService.getUser(id)
      .subscribe(user => this.userForm.patchValue(user));
    ;
  }

  onSubmit() {
    if (this.userForm.value._id) {
      this.userService.updateUser(this.userForm.value)
        .subscribe({
          next: () => alert('Dados atualizados com sucesso.'),
          error: () => alert('Erro ao atualizar dados.'),
          complete: () => this.goBack()
        })
    } else {
      this.userService.createUser(this.userForm.value)
        .subscribe({
          next: () => alert('Novo usuário adicionado com sucesso.'),
          error: () => alert('Erro ao adicionar o usuário.'),
          complete: () => this.goBack()
        })
    }
  }

  onReset(): void {
    this.userForm.reset();
  }

  goBack(): void {
    this.onReset();
    this.location.back();
  }

  /** ONLY FOR DEVELOPMENT/TESTS */
  getMockUser() {

    const mockRoleIndex = Math.floor(Math.random() * 3); /* 0 a 2 */
    const mockRole = ROLES[mockRoleIndex];
    const mockUserNumber = (100 + Math.floor(Math.random() * 900)).toString();  /* 100 a 999 */
    const mockUser = mockRole + mockUserNumber;

    const user = {
      "teams": [],
      "_id": null,
      "role": mockRole,
      "name": mockUser,
      "avatar": "",
      "username": mockUser,
      "password": "password",
      "email": mockUser + "@gmail.com",
    }
    return user
  }

}
