import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, distinctUntilChanged, take } from 'rxjs';
import { Expense } from '../store/expense.model';
import { selectAllExpenses } from '../store/expense.selector';
import { addExpense, loadExpenses, updateExpense } from '../store/expense.actions';
import { FormsModule } from '@angular/forms'; // For [(ngModel)] and form functionality
import { IonicModule } from '@ionic/angular'; // For Ionic components
import { CommonModule } from '@angular/common'; // For Angular directives like *ngFor and *ngIf
import { ModalController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule], // Import necessary modules for template
})
export class ExpenseFormComponent  implements OnInit {
  private store = inject(Store);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  @Input() selectedExpense: Expense | null = null;
  @Output() formClosed = new EventEmitter<void>();
  @Output() expenseSaved = new EventEmitter<Expense>(); // Event to emit the saved expense

  expenses$: Observable<Expense[]> = this.store.select(selectAllExpenses).pipe(distinctUntilChanged());
  categories: string[] = [];
  categoryOptions: { label: string; value: string }[] = [];
  expense: Expense = { id: 0, title: '', amount: 0, category: '', date: '' };
  displayDialog: boolean = false;
  editingId: number | null = null;
  isEditMode: boolean = false;
  expenseForm!: FormGroup;
  constructor ( private fb: FormBuilder, private modalCtrl: ModalController ) { }
  // expenseForm!: FormGroup;
  @ViewChild(IonModal) modal!: IonModal;

  ngOnInit() {
    this.initForm(); // Ensure the form exists
    this.fetchCategories();
    this.loadExpensesFromLocalStorage();
  
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id !== null) { // Explicitly check for null
        this.editingId = Number(id);
        console.log("Editing ID set from route:", this.editingId);
      }
      if (id) {
        this.editingId = Number(id);
        console.log("Editing ID:", this.editingId);
        this.isEditMode = true; // Indicate we're editing
        this.expenses$.pipe(take(1)).subscribe(expenses => {
          const foundExpense = expenses.find(exp => exp.id === this.editingId);
          if (foundExpense) {
            this.expense = { ...foundExpense };
            this.expense.date = this.expense.date ? this.expense.date.split('T')[0] : '';  // Converts "2025-03-25T00:00:00.000Z" to "2025-03-25"
            this.displayDialog = true;
          }
        });
      } else {
        this.isEditMode = false;
      }
    });
    setTimeout(() => {
      const routerOutlet = document.querySelector('ion-router-outlet');
      if (routerOutlet) {
        routerOutlet.setAttribute('aria-hidden', 'false');
      }
    }, 200);
    
  }

  closeModal() {
    this.modal.dismiss();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedExpense'] && this.selectedExpense) {
      if (!this.expenseForm) {
        this.initForm(); // Ensure form is initialized
      }
      this.editingId = this.selectedExpense.id;
      // console.log("Editing ID set from selectedExpense:", this.editingId);
      const formattedDate = this.formatDate(this.selectedExpense.date);

      if (this.selectedExpense) { // Add a null check
        this.expenseForm.patchValue({...this.selectedExpense, date: formattedDate,});
      }
      this.expense = { ...this.selectedExpense }; //  Copy selected expense
      this.displayDialog = true; // Ensure dialog opens when editing
  }
}

formatDate(date: string): string {
  return date ? new Date(date).toISOString().split('T')[0] : '';
}

  initForm() {
    this.expenseForm = this.fb.group({
      title: [''],
      amount: [ ],
      category: [''],
      date: ['']
    });
  }

  async openExpenseFormModal() {
    const modal = await this.modalCtrl.create({
      component: ExpenseFormComponent,
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'custom-modal-class',
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  openExpenseForm() {
    const activeElement = document.activeElement as HTMLElement | null; // Type assertion
    activeElement?.blur(); // Remove focus from the button
    this.modalCtrl.create({ component: ExpenseFormComponent }).then(modal => modal.present());
  }
  loadExpenses(id: number) {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    this.expense = expenses.find((exp: { id: number; }) => exp.id === id) || {};
  }


  fetchCategories() {
    this.http.get<string[]>('https://fakestoreapi.com/products/categories').subscribe({
      next: (data) => {
        this.categories = data;
        this.categoryOptions = data.map(cat => ({ label: cat, value: cat }));
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  loadExpensesFromLocalStorage() {
    const storedExpenses = localStorage.getItem('expenses'); // Directly access localStorage
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses); // Parse the stored JSON data
        if (Array.isArray(parsedExpenses) && parsedExpenses.length > 0) {
          this.store.dispatch(loadExpenses({ expenses: parsedExpenses })); // Dispatch action to update NgRx state
        }
      } catch (error) {
        console.error('Error parsing expenses from localStorage:', error);
      }
    }
  }
  

  onSubmit() {
    if (!this.expense.title || !this.expense.amount || !this.expense.category || !this.expense.date) {
      return; // Ensure all fields are filled
    }
    this.isEditMode = true;
    // console.log(this.isEditMode);
    // console.log(this.editingId);
    this.expenses$.pipe(take(1)).subscribe(expenses => {
      if (this.isEditMode && this.editingId !== null) {
        // **Find the index of the expense being edited**
        const expenseIndex = expenses.findIndex(exp => exp.id === this.editingId);
        // console.log("Expense index:", expenseIndex);
        if (expenseIndex !== -1) {
          const updatedExpenses = [...expenses];
          const updatedExpense: Expense = {
            ...this.expense,
            id: this.editingId ?? 0 // Ensure id is always a number
          };
          updatedExpenses[expenseIndex] = updatedExpense; //  Replace instead of appending
          // this.store.dispatch(updateExpense({ expense: this.expense }));
          // console.log("Subscribing to store to check updated expenses...");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          this.store.select(selectAllExpenses).pipe(take(1)).subscribe(updatedExpenses => {
          this.store.dispatch(updateExpense({ expense: updatedExpense })); // Dispatch update
          // console.log("Updated expenses from store:", updatedExpenses);
          // console.log("Updated expense sucessfully") 
          });
          localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
         }
      } else {
        const lastId = Number(localStorage.getItem('lastExpenseId') || '0') + 1;
        localStorage.setItem('lastExpenseId', String(lastId));
        // **Adding a new expense**
        const newExpense: Expense = {
          id: lastId, 
          title: this.expense.title,
          amount: this.expense.amount,
          category: this.expense.category,
          date: this.expense.date || new Date().toISOString().split('T')[0]
        };
  
        this.store.dispatch(addExpense({ expense: newExpense })); 
        const updatedExpenses = [...expenses, newExpense]; // Append only when adding
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));      }
      this.closeDialog();
    });
  }

  closeDialog() {
    this.displayDialog = false;
    this.expense = { id: 0, title: '', amount: 0, category: '', date: '' }; // Reset form
    this.isEditMode = false;
    this.editingId = null;
    this.formClosed.emit();
  }

  showAddExpenseDialog() {
    this.editingId = null; // Reset edit mode
    this.expense = this.selectedExpense 
    ? { ...this.selectedExpense } // Use selected expense if available
    : { id: 0, title: '', amount: 0, category: '', date: '' };
     this.displayDialog = true;
  }
}

