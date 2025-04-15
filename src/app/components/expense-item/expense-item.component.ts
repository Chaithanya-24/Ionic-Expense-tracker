import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Expense } from '../store/expense.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-expense-item',
  templateUrl: './expense-item.component.html',
  styleUrls: ['./expense-item.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ExpenseItemComponent implements OnChanges {
  @Input() expenses: Expense[] = [];

  pieChartRef: any;
  lineChartRef: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expenses'] && this.expenses.length > 0) {
      this.updatePieChart();
      this.updateLineChart(this.expenses);
    }
  }

  updatePieChart() {
    const categoryTotals: { [key: string]: number } = {};

    this.expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (this.pieChartRef) {
      this.pieChartRef.destroy();
    }

    const ctx: any = document.getElementById('pieChart');
    if (ctx) {
      this.pieChartRef = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  updateLineChart(expenses: Expense[]) {
    const monthlyTotals: { [month: string]: number } = {};

    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
    });

    const labels = Object.keys(monthlyTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const data = labels.map(month => monthlyTotals[month]);

    if (this.lineChartRef) {
      this.lineChartRef.destroy();
    }

    const ctx: any = document.getElementById('lineChart');
    if (ctx) {
      this.lineChartRef = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Monthly Expenses',
            data,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }
}

