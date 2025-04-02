import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Expense } from '../store/expense.model';

@Component({
  selector: 'app-expense-item',
  templateUrl: './expense-item.component.html',
  styleUrls: ['./expense-item.component.scss'],
  standalone: true,
})
export class ExpenseItemComponent  {

  @Input() expense!: Expense;
  @Output() edit = new EventEmitter<Expense>();
  @Output() delete = new EventEmitter<number>();

  onEdit() {
    this.edit.emit(this.expense);
  }

  onDelete() {
    this.delete.emit(this.expense.id);
  }
}
