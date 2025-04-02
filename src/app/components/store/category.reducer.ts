import { createReducer, on } from '@ngrx/store';
import { loadCategoriesSuccess, loadCategoriesFailure } from './category.actions';

export interface CategoryState {
  categories: string[];
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  error: null,
};

export const categoryReducer = createReducer(
  initialState,
  on(loadCategoriesSuccess, (state, { categories }) => ({ ...state, categories })),
  on(loadCategoriesFailure, (state, { error }) => ({ ...state, error }))
);
