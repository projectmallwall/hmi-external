import { Component, OnInit } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Diet-tracker-Component Features:
  - Responsive mobile-first design.
  - Add daily meals with calories.
  - View and remove meals for any selected day.
  - Calendar date picker to select which day's meals to view/edit.
  - Total calorie count for selected day.
  - Persistent storage: meals are saved per day in localStorage.
  - Input validation for meal name and calories.
*/

@Component({
  selector: 'app-diet-tracker-',
  template: `
    <div class="diet-tracker-container">
      <h2>Diet Tracker</h2>
      <div class="calendar-section">
        <label for="datePicker">Select Day:</label>
        <input
          id="datePicker"
          type="date"
          [ngModel]="selectedDateString"
          (ngModelChange)="onDateChange($event)"
          name="selectedDate"
          max="{{ todayString }}"
        />
      </div>
      <form (ngSubmit)="addMeal()" #mealForm="ngForm" class="meal-form">
        <input
          type="text"
          placeholder="Meal Name"
          [(ngModel)]="mealName"
          name="mealName"
          required
          maxlength="50"
        />
        <input
          type="number"
          placeholder="Calories"
          [(ngModel)]="calories"
          name="calories"
          required
          min="0"
        />
        <button type="submit" [disabled]="!mealName || calories === null">Add Meal</button>
      </form>
      <div class="meal-list" *ngIf="meals.length > 0">
        <h3>{{ selectedDateString | date:'fullDate' }} Meals</h3>
        <ul>
          <li *ngFor="let meal of meals; let i = index">
            <span class="meal-info">{{ meal.name }}: {{ meal.calories }} kcal</span>
            <button (click)="removeMeal(i)" aria-label="Remove meal">✕</button>
          </li>
        </ul>
        <div class="total">
          <strong>Total:</strong> {{ getTotalCalories() }} kcal
        </div>
      </div>
      <div *ngIf="meals.length === 0" class="no-meals">
        No meals added yet for this day.
      </div>
    </div>
  `,
  styles: [`
    .diet-tracker-container {
      max-width: 100%;
      width: 100%;
      box-sizing: border-box;
      margin: 0 auto;
      padding: 16px 8px 32px 8px;
      border-radius: 10px;
      background: #f7fafc;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      font-family: Arial, sans-serif;
    }
    h2, h3 {
      margin-top: 0;
      color: #4a5568;
      font-size: 1.5em;
      text-align: center;
    }
    .calendar-section {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      margin-bottom: 18px;
    }
    .calendar-section label {
      font-size: 1em;
      color: #2d3748;
    }
    .calendar-section input[type="date"] {
      padding: 6px;
      border-radius: 5px;
      border: 1px solid #cbd5e0;
      font-size: 1em;
      background: white;
    }
    .meal-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 18px;
    }
    input[type="text"], input[type="number"] {
      width: 100%;
      padding: 10px;
      font-size: 1em;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      box-sizing: border-box;
    }
    button[type="submit"] {
      background: #38a169;
      color: white;
      border: none;
      padding: 10px 0;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 1em;
    }
    button[type="submit"]:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }
    .meal-list ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .meal-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 1em;
    }
    .meal-info {
      flex: 1;
      word-break: break-word;
    }
    .meal-list button {
      background: transparent;
      border: none;
      color: #e53e3e;
      font-size: 1.3em;
      cursor: pointer;
      margin-left: 8px;
      padding: 0 4px;
    }
    .total {
      margin-top: 12px;
      font-weight: bold;
      color: #2d3748;
      text-align: right;
      font-size: 1.1em;
    }
    .no-meals {
      color: #a0aec0;
      text-align: center;
      margin-top: 24px;
      font-size: 1em;
    }

    @media (min-width: 480px) {
      .diet-tracker-container {
        max-width: 400px;
        padding: 24px 16px 40px 16px;
      }
      .meal-form {
        flex-direction: row;
        gap: 8px;
      }
      input[type="text"], input[type="number"] {
        width: auto;
        flex: 1;
      }
      button[type="submit"] {
        width: auto;
        min-width: 90px;
      }
    }
  `]
})
export class DietTrackerComponent extends CommonExternalComponent implements OnInit {
  mealName: string = '';
  calories: number | null = null;
  meals: Array<{ name: string; calories: number }> = [];
  selectedDate: Date = new Date();

  get selectedDateString(): string {
    return this.formatDate(this.selectedDate);
  }

  get todayString(): string {
    return this.formatDate(new Date());
  }

  ngOnInit(): void {
    this.loadMeals();
  }

  addMeal(): void {
    if (this.mealName.trim() && this.calories !== null && this.calories >= 0) {
      this.meals.push({ name: this.mealName.trim(), calories: this.calories });
      this.mealName = '';
      this.calories = null;
      this.saveMeals();
    }
  }

  removeMeal(index: number): void {
    this.meals.splice(index, 1);
    this.saveMeals();
  }

  getTotalCalories(): number {
    return this.meals.reduce((sum, meal) => sum + meal.calories, 0);
  }

  onDateChange(dateStr: string): void {
    this.selectedDate = new Date(dateStr);
    this.loadMeals();
  }

  private saveMeals(): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.meals));
    } catch {}
  }

  private loadMeals(): void {
    const data: string | null = localStorage.getItem(this.getStorageKey());
    if (data) {
      try {
        const parsed: unknown = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.meals = parsed.filter(
            (m: any) =>
              typeof m === 'object' &&
              typeof m.name === 'string' &&
              typeof m.calories === 'number'
          );
        }
      } catch {
        this.meals = [];
      }
    } else {
      this.meals = [];
    }
  }

  private getStorageKey(): string {
    return 'diet-tracker-meals-' + this.formatDate(this.selectedDate);
  }

  private formatDate(date: Date): string {
    // Returns YYYY-MM-DD
    const y: number = date.getFullYear();
    const m: number = date.getMonth() + 1;
    const d: number = date.getDate();
    return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }
}