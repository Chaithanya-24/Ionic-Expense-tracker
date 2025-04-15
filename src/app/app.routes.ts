import { Routes } from '@angular/router';

import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { ExpenseItemComponent } from './components/expense-item/expense-item.component';


export const routes: Routes = [
    {
        path:'',
        redirectTo: '/list',
        pathMatch: 'full'
    },
    { 
        path: 'dashboard', 
        component: ExpenseItemComponent
    },
    { 
        path: 'list', 
        component: ExpenseListComponent 
    },
    

//   { path: 'category/:category', component: CategoryExpensesComponent },

];

