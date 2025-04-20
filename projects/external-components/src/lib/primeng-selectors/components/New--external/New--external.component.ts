import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-new',
  template: `
    <div class="calendar">
      <div class="calendar-header">
        <div *ngFor="let day of weekDays" class="calendar-cell calendar-header-cell"
             [ngClass]="{'monday': day === 'Mon', 'sunday': day === 'Sun'}">
          {{ day }}
        </div>
      </div>
      <div class="calendar-body">
        <div *ngFor="let week of weeks">
          <div *ngFor="let date of week" class="calendar-cell"
               [ngClass]="{
                 'monday': date && date.dayOfWeek === 1,
                 'sunday': date && date.dayOfWeek === 0,
                 'empty': !date
               }">
            {{ date?.date || '' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar {
      width: 350px;
      border: 1px solid #ccc;
      font-family: Arial, sans-serif;
    }
    .calendar-header {
      display: flex;
    }
    .calendar-header-cell {
      flex: 1;
      padding: 8px 0;
      text-align: center;
      font-weight: bold;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }
    .calendar-body {
      display: flex;
      flex-direction: column;
    }
    .calendar-cell {
      width: 50px;
      height: 40px;
      display: inline-block;
      text-align: center;
      vertical-align: middle;
      line-height: 40px;
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
      font-size: 16px;
    }
    .calendar-cell:last-child {
      border-right: none;
    }
    .calendar-header-cell.monday,
    .calendar-cell.monday {
      background-color: #b2f2bb !important;
      color: #155724;
    }
    .calendar-header-cell.sunday,
    .calendar-cell.sunday {
      background-color: #ffd8a8 !important;
      color: #d9480f;
    }
    .calendar-cell.empty {
      background: #fafafa;
      color: transparent;
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class NewComponent extends CommonExternalComponent {
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weeks: Array<Array<{date: number, dayOfWeek: number} | null>> = [];

  constructor() {
    super();
    this.generateCalendar(new Date());
  }

  generateCalendar(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of the month (0=Sunday)
    const firstDay = new Date(year, month, 1).getDay();
    // Number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let weeks: Array<Array<{date: number, dayOfWeek: number} | null>> = [];
    let week: Array<{date: number, dayOfWeek: number} | null> = [];

    // Fill initial empty cells
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      week.push({ date: day, dayOfWeek: currentDate.getDay() });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    // Fill remaining empty cells at end
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    this.weeks = weeks;
  }
}