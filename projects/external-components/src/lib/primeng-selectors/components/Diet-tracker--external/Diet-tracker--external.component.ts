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
  - Inline SVG bar graph visualizes calories per meal.
  - Inline SVG line chart shows total daily calories for the selected month.
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
          [max]="todayString"
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
        <!-- Calorie Bar Graph -->
        <div class="calorie-graph-section">
          <h4>Calories per Meal</h4>
          <svg
            [attr.width]="graphWidth"
            [attr.height]="barHeight * meals.length + 40"
            class="calorie-graph"
            *ngIf="meals.length > 0"
          >
            <g *ngFor="let meal of meals; let i = index">
              <rect
                [attr.x]="0"
                [attr.y]="i * barHeight"
                [attr.width]="getBarWidth(meal.calories)"
                [attr.height]="barInnerHeight"
                fill="#63b3ed"
                rx="4"
              ></rect>
              <text
                [attr.x]="getBarWidth(meal.calories) + 6"
                [attr.y]="i * barHeight + barInnerHeight / 1.5"
                font-size="13"
                fill="#2d3748"
              >{{ meal.calories }} kcal</text>
              <text
                [attr.x]="6"
                [attr.y]="i * barHeight + barInnerHeight / 1.5"
                font-size="13"
                fill="#2d3748"
                font-weight="bold"
                style="pointer-events:none;"
              >{{ meal.name }}</text>
            </g>
            <text
              [attr.x]="graphWidth / 2"
              [attr.y]="meals.length * barHeight + 25"
              text-anchor="middle"
              font-size="12"
              fill="#718096"
            >Calories</text>
          </svg>
        </div>
      </div>
      <div *ngIf="meals.length === 0" class="no-meals">
        No meals added yet for this day.
      </div>
      <!-- Monthly Line Chart Section -->
      <div class="month-chart-section">
        <h4>Monthly Calories Trend</h4>
        <svg
          [attr.width]="monthChartWidth"
          [attr.height]="monthChartHeight"
          class="month-line-chart"
        >
          <!-- X and Y axes -->
          <line x1="38" y1="18" x2="38" [attr.y2]="monthChartHeight - 32" stroke="#a0aec0" stroke-width="1"/>
          <line x1="38" [attr.y1]="monthChartHeight - 32" [attr.x2]="monthChartWidth - 8" [attr.y2]="monthChartHeight - 32" stroke="#a0aec0" stroke-width="1"/>
          <!-- Y axis ticks and labels -->
          <ng-container *ngFor="let y of yTicks">
            <line x1="34" [attr.y1]="y.pos" x2="38" [attr.y2]="y.pos" stroke="#a0aec0" stroke-width="1"/>
            <text x="30" [attr.y]="y.pos + 4" font-size="11" text-anchor="end" fill="#718096">{{ y.label }}</text>
          </ng-container>
          <!-- X axis day numbers -->
          <ng-container *ngFor="let d of daysInMonthArray; let i = index">
            <text
              [attr.x]="getMonthChartX(i)"
              [attr.y]="monthChartHeight - 16"
              font-size="10"
              text-anchor="middle"
              fill="#718096"
            >{{ d }}</text>
          </ng-container>
          <!-- Polyline for calorie trend -->
          <polyline
            [attr.points]="monthLinePoints"
            fill="none"
            stroke="#3182ce"
            stroke-width="2"
          ></polyline>
          <!-- Dots for each day -->
          <ng-container *ngFor="let c of monthCaloriesData; let i = index">
            <circle
              [attr.cx]="getMonthChartX(i)"
              [attr.cy]="getMonthChartY(c)"
              r="2.8"
              fill="#3182ce"
            ></circle>
          </ng-container>
        </svg>
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
    .calorie-graph-section {
      margin-top: 24px;
      background: #ebf8ff;
      border-radius: 8px;
      padding: 14px 8px 10px 8px;
      box-shadow: 0 1px 4px rgba(99,179,237,0.07);
    }
    .calorie-graph-section h4 {
      margin: 0 0 12px 0;
      color: #3182ce;
      font-size: 1.08em;
      text-align: left;
    }
    .calorie-graph {
      width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      background: transparent;
    }
    .month-chart-section {
      margin-top: 28px;
      background: #fff5f5;
      border-radius: 8px;
      padding: 16px 10px 18px 10px;
      box-shadow: 0 1px 4px rgba(226,38,77,0.05);
    }
    .month-chart-section h4 {
      margin: 0 0 10px 0;
      color: #e53e3e;
      font-size: 1.08em;
      text-align: left;
    }
    .month-line-chart {
      width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      background: transparent;
      user-select: none;
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
      .calorie-graph-section {
        padding: 16px 12px 14px 12px;
      }
      .month-chart-section {
        padding: 20px 14px 22px 14px;
      }
    }
  `]
})
export class DietTrackerComponent extends CommonExternalComponent implements OnInit {
  mealName: string = '';
  calories: number | null = null;
  meals: Array<{ name: string; calories: number }> = [];
  selectedDate: Date = new Date();

  // Bar graph config
  graphWidth: number = 320;
  barHeight: number = 28;
  barInnerHeight: number = 20;

  // Month line chart config
  monthChartWidth: number = 340;
  monthChartHeight: number = 140;
  daysInMonthArray: number[] = [];
  monthCaloriesData: number[] = [];
  yTicks: Array<{ pos: number; label: string }> = [];

  get selectedDateString(): string {
    return this.formatDate(this.selectedDate);
  }

  get todayString(): string {
    return this.formatDate(new Date());
  }

  ngOnInit(): void {
    this.loadMeals();
    this.prepareMonthChart();
  }

  addMeal(): void {
    if (this.mealName.trim() && this.calories !== null && this.calories >= 0) {
      this.meals.push({ name: this.mealName.trim(), calories: this.calories });
      this.mealName = '';
      this.calories = null;
      this.saveMeals();
      this.prepareMonthChart();
    }
  }

  removeMeal(index: number): void {
    this.meals.splice(index, 1);
    this.saveMeals();
    this.prepareMonthChart();
  }

  getTotalCalories(): number {
    return this.meals.reduce((sum: number, meal: { name: string; calories: number }) => sum + meal.calories, 0);
  }

  onDateChange(dateStr: string): void {
    this.selectedDate = new Date(dateStr);
    this.loadMeals();
    this.prepareMonthChart();
  }

  getMaxCalories(): number {
    if (!this.meals.length) return 1;
    return Math.max(...this.meals.map(m => m.calories), 1);
  }

  getBarWidth(calories: number): number {
    const maxCals: number = this.getMaxCalories();
    const maxBarW: number = this.graphWidth - 80;
    return Math.round((Math.max(0, calories) / maxCals) * maxBarW);
  }

  // --- Month Line Chart Logic ---

  prepareMonthChart(): void {
    const year: number = this.selectedDate.getFullYear();
    const month: number = this.selectedDate.getMonth(); // 0-based
    const daysInMonth: number = new Date(year, month + 1, 0).getDate();
    this.daysInMonthArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Gather total calories for each day in month
    const caloriesPerDay: number[] = [];
    let maxCal: number = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key: string = 'diet-tracker-meals-' + this.formatDate(new Date(year, month, d));
      const data: string | null = localStorage.getItem(key);
      let total: number = 0;
      if (data) {
        try {
          const arr: unknown = JSON.parse(data);
          if (Array.isArray(arr)) {
            total = arr.reduce((sum: number, m: any) =>
              typeof m === 'object' && typeof m.calories === 'number'
                ? sum + m.calories : sum, 0);
          }
        } catch {}
      }
      caloriesPerDay.push(total);
      if (total > maxCal) maxCal = total;
    }
    this.monthCaloriesData = caloriesPerDay;

    // Y-axis ticks (up to 4, at round values)
    const tickCount: number = 4;
    const step: number = Math.ceil(maxCal / tickCount / 50) * 50 || 50;
    this.yTicks = [];
    for (let t = 0; t <= tickCount; t++) {
      const val: number = t * step;
      this.yTicks.push({
        pos: this.getMonthChartY(val),
        label: val.toString()
      });
    }
  }

  get monthLinePoints(): string {
    if (!this.monthCaloriesData.length) return '';
    return this.monthCaloriesData.map((c, i) =>
      `${this.getMonthChartX(i)},${this.getMonthChartY(c)}`
    ).join(' ');
  }

  getMonthChartX(dayIndex: number): number {
    const leftPad: number = 38;
    const rightPad: number = 12;
    const chartW: number = this.monthChartWidth - leftPad - rightPad;
    const n: number = this.daysInMonthArray.length;
    if (n < 2) return leftPad;
    return leftPad + (chartW * dayIndex) / (n - 1);
  }

  getMonthChartY(calories: number): number {
    const topPad: number = 18;
    const bottomPad: number = 32;
    const chartH: number = this.monthChartHeight - topPad - bottomPad;
    const maxVal: number = Math.max(...this.monthCaloriesData, 1);
    return topPad + chartH * (1 - (calories / (maxVal || 1)));
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