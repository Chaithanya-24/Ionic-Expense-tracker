import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExpenseState } from './expense.reducer';

// Select the entire expense state
export const selectExpenseState = createFeatureSelector<ExpenseState>('expenses');

// Select all expenses
export const selectAllExpenses = createSelector(
  selectExpenseState,
  (state) => {
    const seenIds = new Set();
    return state.expenses.filter(expense => {
      if (seenIds.has(expense.id)) {
        return false;
      }
      seenIds.add(expense.id);
      return true;
    });
  }
);

// Select an expense by ID
export const selectExpenseById = (id: number) =>
  createSelector(selectExpenseState, (state) =>
    state.expenses.find(expense => expense.id === id)
  );
