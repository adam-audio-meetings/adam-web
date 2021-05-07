import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CategoryService } from '../category.service';
import { Category } from '../interfaces/category';
import { Location } from "@angular/common";

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  title: string = 'Categorias de Time'

  categories$: Observable<any[]>;
  id: string = this.route.snapshot.paramMap.get('id');
  currentRoute: string;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private location: Location,
    public authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  deleteCategory(id: string): void {
    if (window.confirm('Confirma excluir?')) {
      this.categoryService.deleteCategory(id);
      this.getCategories();
    }
  }

  goBack(): void {
    this.location.back();
  }

}
