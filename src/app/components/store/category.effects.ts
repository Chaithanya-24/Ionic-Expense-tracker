import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap, of } from 'rxjs';
import { loadCategories, loadCategoriesSuccess, loadCategoriesFailure } from './category.actions';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategories),
      mergeMap(() =>
        this.http.get<string[]>('https://fakestoreapi.com/products/categories').pipe(
          map((categories) => loadCategoriesSuccess({ categories })),
          catchError((error) => of(loadCategoriesFailure({ error: error.message })))
        )
      )
    )
  );
}
