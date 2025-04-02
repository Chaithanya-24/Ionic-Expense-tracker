import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ChartData } from 'chart.js';
import { Observable } from 'rxjs';
import { CategoryService } from 'src/app/services/category.sevice';
import { deleteExpense } from '../store/expense.actions';
import { Expense } from '../store/expense.model';
import { selectAllExpenses } from '../store/expense.selector';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Icon } from 'ionicons/dist/types/components/icon/icon';
import { CommonModule } from '@angular/common';
import { ModalController, ToastController } from '@ionic/angular';
import { ExpenseFormComponent } from "../expense-form/expense-form.component";

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IonicModule, CommonModule, ExpenseFormComponent],
  providers:[ToastController, ModalController],
})
export class ExpenseListComponent  implements OnInit {

// Placeholder for chart data, we will update it dynamically later
pieChartData: ChartData<'pie'> | undefined; //  Use ChartData for Pie Chart
lineChartData: ChartData<'line'> | undefined; //  Use ChartData for Line Chart

private store = inject(Store);
private router = inject(Router);
private categoryService = inject(CategoryService);

expenses$: Observable<Expense[]> = this.store.select(selectAllExpenses);
displayForm: boolean = false;  // Controls the dialog visibility
displayDialog: boolean = false;
editDialogVisible: boolean = false; // Controls the Edit Expense Dialog
selectedExpense: Expense | null = null; 
selectedCategory: string | null = null;
categories: { label: string; value: string }[] = [];
expenses: Expense[] = [];
filteredExpenses: Expense[] = [];
updatedExpense: Expense [] = [];
  // toastMessage: string;
  // toastVisible: boolean;

updateLocalStorage() {
localStorage.setItem('expenses', JSON.stringify(this.expenses));
}

showDialog(expense?: Expense) {
if (expense) {
  this.selectedExpense = { ...expense }; // Clone to prevent direct mutation
} else {
  this.selectedExpense = null; // New expense
}
this.displayDialog = true;
}

filterExpenses(event: Event) {
  const inputElement = event.target as HTMLInputElement; // Ensure this is an input element
  const query = inputElement?.value?.toLowerCase() || ''; // Get the input value and convert to lowercase

  // Filter the expenses list based on the query
  this.filteredExpenses = this.expenses.filter((expense) =>
    expense.title.toLowerCase().includes(query) ||
    expense.category.toLowerCase().includes(query) ||
    expense.amount.toString().includes(query) ||
    new Date(expense.date).toLocaleDateString().includes(query)
  );
}


filterByCategory(selectedCategory: string) {
this.selectedCategory = selectedCategory;

if (selectedCategory) {
  this.filteredExpenses = this.expenses.filter(expense => expense.category === selectedCategory);
} else {
  this.filteredExpenses = [...this.expenses]; // Show all if no filter
}
}


constructor(private alertController: AlertController) {}

async confirmDelete(expenseId: number) {
  const alert = await this.alertController.create({
    header: 'Delete Confirmation',
    message: 'Are you sure you want to delete this expense?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary', // Styling for the Cancel button
        handler: () => {
          console.log('Delete action cancelled');
        },
      },
      {
        text: 'Delete',
        cssClass: 'danger', // Styling for the Delete button
        handler: () => {
          this.onDelete(expenseId); // Call the delete method if accepted
        },
      },
    ],
    backdropDismiss: true, // Allows closing when clicking outside
  });

  await alert.present();
}

// showToast(message: string) {
//   this.toastMessage = message; // Set the message
//   this.toastVisible = true; // Show the toast

//   // Automatically hide the toast after the duration
//   setTimeout(() => {
//     this.toastVisible = false;
//   }, 2000); // Match the duration in the template
// }

closeDialog() {
this.displayDialog = false;
this.selectedExpense = null;
}

editExpense(expense: Expense) {
// console.log("pressed");
// console.log(expense.id);
this.selectedExpense = { ...expense };
// console.log(this.selectedExpense.id);
this.editDialogVisible = true;
}

generateUniqueId(): number {
if (!this.expenses || this.expenses.length === 0) {
  return 1; // Start from 1 if the list is empty
}
const maxId = Math.max(...this.expenses.map(expense => expense.id));
return maxId + 1; // Assign the next unique number
}


handleExpenseUpdate(updatedExpense: Expense) {
this.expenses = this.expenses.map(exp => 
  exp.id === updatedExpense.id ? updatedExpense : exp
);
this.updateLocalStorage();
this.editDialogVisible = false;
}


ngOnInit() {
this.store.select(selectAllExpenses).subscribe((data) => {
  this.expenses = data.map(expense => {
    if (!expense.date || isNaN(Date.parse(expense.date))) {
      console.error("Invalid date detected:", expense.date);
      return { ...expense, date: new Date().toISOString().split('T')[0] }; // Assign current date if invalid
    }
    return { 
      ...expense, 
      date: expense.date.includes('T') ? expense.date : new Date(expense.date).toISOString().split('T')[0]
    };
  });

  this.filteredExpenses = [...this.expenses];
  this.updatePieChart(); // Update the Pie Chart
  this.updateLineChart(this.expenses); // Update the Line Chart
});


this.categoryService.categories$.subscribe((data: string[]) => {
  // console.log('Categories fetched:', data); // Debugging
  this.categories = [
    { label: "All", value: "all" }, // Add "All" option
    ...data.map(category => ({ 
      label: category.trim(), 
      value: category.trim().toLowerCase() 
    }))
  ];
});

this.categoryService.fetchCategories();
}

getFormattedDate(date: string): string {
const today = new Date();
const givenDate = new Date(date);
const differenceInDays = Math.floor((today.getTime() - givenDate.getTime()) / (1000 * 3600 * 24));

return differenceInDays < 30 
  ? date // Use timeago pipe in the template
  : givenDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}


onCategoryChange(event: any) {
  // Use event.detail.value for 'ion-select' value
  this.selectedCategory = event?.detail?.value || null;
  
  if (this.selectedCategory === 'all' || !this.selectedCategory) {
    this.filteredExpenses = [...this.expenses]; // Reset to all expenses
  } else {
    this.filteredExpenses = this.expenses.filter(expense =>
      expense.category?.trim().toLowerCase() === this.selectedCategory
    );
  }
}

searchExpenses(query: string) {
if (!query.trim()) {
  this.filteredExpenses = [...this.expenses]; // Reset to full list if empty query
  return;
}

this.filteredExpenses = this.expenses.filter(expense =>
  expense.title.toLowerCase().includes(query.toLowerCase())
);
}

onDelete(id: number) {
this.store.dispatch(deleteExpense({ id }));

// Remove from localStorage
const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
const updatedExpenses = storedExpenses.filter((expense: Expense) => expense.id !== id);
localStorage.setItem('expenses', JSON.stringify(updatedExpenses));


}

updatePieChart() {
const categoryTotals: { [key: string]: number } = {};

// Calculate total expenses per category
this.expenses.forEach(expense => {
  if (categoryTotals[expense.category]) {
    categoryTotals[expense.category] += expense.amount;
  } else {
    categoryTotals[expense.category] = expense.amount;
  }
});

// Prepare data for the Pie Chart
this.pieChartData = {
  labels: Object.keys(categoryTotals),
  datasets: [
    {
      data: Object.values(categoryTotals),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800']
    }
  ]
};
}  
updateLineChart(expenses: Expense[]) {
const monthlyTotals: { [month: string]: number } = {};

// Process each expense
expenses.forEach(expense => {
  const month = new Date(expense.date).toLocaleString('en-US', { month: 'short', year: 'numeric' });

  if (!monthlyTotals[month]) {
    monthlyTotals[month] = 0;
  }
  monthlyTotals[month] += expense.amount;
});

// Extract labels and data
const labels = Object.keys(monthlyTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
const data = labels.map(month => monthlyTotals[month]);

// Assign to chart
this.lineChartData = {
  labels: labels,
  datasets: [
    {
      label: 'Monthly Expenses',
      data: data,
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',
      fill: true
    }
  ]
};
}

}
