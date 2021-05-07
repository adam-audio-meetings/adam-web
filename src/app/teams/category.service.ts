import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from '../message.service';
import { Category } from './interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private firestore: AngularFirestore,
    private messageService: MessageService
  ) { }

  getCategories(): Observable<any[]> {
    return this.firestore.collection('category').valueChanges({idField: '_id'});
  }

  getCategory(id: string): Observable<any> {
    return this.firestore.collection('category').doc(id).get()
      .pipe(
        tap(_ => this.log(`fetched category id=${id}`)),
        catchError(this.handleError<Category>(`getCategory id=${id}`))
      );
  }

  updateCategory(category: Category) {
    const id: string = category._id;
    delete category._id;
    return this.firestore.doc(`category/${id}`).update(category);
  }

  createCategory(category: Category) {
    delete category._id;
    return this.firestore.collection('category').add(category);
  }

  deleteCategory(id: string) {
    /** TODO: confirm deletion */
    /** TODO: logic deletion */
    this.firestore.doc(`category/${id}`).delete();
  }

  /** Log a message with the service */
  private log(message: string): void {
    this.messageService.add(`[CategoryService] ${message}`);
  }

  /**
  * based on: https://angular.io/tutorial/toh-pt6#error-handling
  * Handle Http operation that failed.
  * Let the app continue.
  * @param operation - name of the operation that failed
  * @param result - optional value to return as the observable result
  */
  private handleError<T>(operation = 'operation', result?: T) {
   return (error: any): Observable<T> => {
    
     // TODO: send the error to remote logging infrastructure
     console.error(error); // log to console instead
    
     // TODO: better job of transforming error for category consumption
     this.log(`${operation} failed: ${error.message}`);
    
     // Let the app keep running by returning an empty result.
     return of(result as T);
   };
  }
}
