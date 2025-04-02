import { Routes } from '@angular/router';

import { ExpenseListComponent } from './components/expense-list/expense-list.component';


export const routes: Routes = [
    {
        path:'',
        redirectTo: '/expenses',
        pathMatch: 'full'
    },
    // { 
    //     path: 'expense/:id', 
    //     component: ExpenseItemComponent
    // },
    { 
        path: 'expenses', 
        component: ExpenseListComponent 
    },
    

//   { path: 'category/:category', component: CategoryExpensesComponent },

];

