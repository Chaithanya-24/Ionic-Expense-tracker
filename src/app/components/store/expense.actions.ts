import { createAction, props } from '@ngrx/store';
import { Expense } from './expense.model';

// Action to load expenses (e.g., from an API)
export const loadExpenses = createAction('[Expense] Load Expenses', props<{ expenses: Expense[] }>());

// Action to add an expense
export const addExpense = createAction('[Expense] Add Expense', props<{ expense: Expense }>());

export const updateExpense = createAction('[Expense] Update Expense', props<{ expense: Expense }>());

// Action to remove an expense
export const deleteExpense = createAction('[Expense] Remove Expense', props<{ id: number }>());
