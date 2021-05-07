import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../category.service';
import { Category } from '../interfaces/category';
import { Location } from "@angular/common";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private location: Location
    ) { }

  category: Category;

  categoryForm = this.fb.group({
    _id: [null],
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  id:string = this.route.snapshot.paramMap.get('id');

  resetButtonText: string = "Limpar";
  backButtonText: string = "Voltar";
  

  ngOnInit(): void {
     if(this.id){
      this.getCategoryInForm();     
    }
  }

  getCategoryInForm(): void {
    const id:string = this.id;
    console.warn('GET CATEGORY id: ', this.id)
    this.categoryService.getCategory(id)
      .subscribe(payload => this.categoryForm.patchValue({_id: id, ...payload.data()}));
    ;
  }

  onSubmit() {
    if(this.categoryForm.value._id) {
      this.categoryService.updateCategory(this.categoryForm.value)
      .then(() => alert('Dados atualizados com sucesso.'))
      .catch(() => alert('Erro ao atualizar dados.'))
      .finally(() => this.goBack())
    } else {
      this.categoryService.createCategory(this.categoryForm.value)
      .then(() => alert('Nova categoria criada com sucesso.'))
      .catch(() => alert('Erro ao criar categoria.'))
      .finally(() => this.goBack())
    }
  }

  onReset(): void {
    this.categoryForm.reset();
  }

  goBack(): void {
    this.onReset();
    this.location.back();
  }

}
