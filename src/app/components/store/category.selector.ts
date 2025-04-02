import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CategoryState } from './category.reducer';

// Feature selector
export const selectCategoryState = createFeatureSelector<CategoryState>('categories');

// Selector to get categories
export const selectAllCategories = createSelector(
  selectCategoryState,
  (state) => state.categories
);
