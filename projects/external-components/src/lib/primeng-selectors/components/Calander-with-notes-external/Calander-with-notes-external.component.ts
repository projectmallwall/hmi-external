import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Monthly calendar view.
  - Add, edit, and delete notes for each date.
  - Inline note editing with save/cancel options.
  - Highlights days with notes.
*/

interface CalendarNote {
  date: string; // 'YYYY-MM-DD'
  text: string;
  isEditing?: boolean;
  tempText?: string;
}

@Component({
  selector: 'app-calander-with-notes',
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <button (click)="prevMonth()">&lt;</button>
        <span>{{ months[currentMonth] }} {{ currentYear }}</span>
        <button (click)="nextMonth()">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day" *ngFor="let day of weekDays">{{ day }}</div>
        <ng-container *ngFor="let blank of blanks">
          <div class="calendar-cell empty"></div>
        </ng-container>
        <ng-container *ngFor="let day of daysInMonth">
          <div 
            class="calendar-cell"
            [class.has-note]="hasNote(day)"
            (click)="selectDate(day)">
            <span>{{ day }}</span>
            <div class="note-preview" *ngIf="getNote(day) && !getNote(day)?.isEditing">
              {{ getNote(day)?.text }}
              <button class="edit-btn" (click)="editNote($event, day)">Edit</button>
              <button class="delete-btn" (click)="deleteNote($event, day)">Delete</button>
            </div>
            <div *ngIf="getNote(day)?.isEditing" class="edit-form">
              <textarea [(ngModel)]="getNote(day)!.tempText"></textarea>
              <button (click)="saveNote(day)">Save</button>
              <button (click)="cancelEdit(day)">Cancel</button>
            </div>
            <div *ngIf="!getNote(day)" class="add-note-form">
              <button class="add-btn" (click)="startAddNote($event, day)">Add Note</button>
            </div>
            <div *ngIf="addingNoteDay === day" class="edit-form">
              <textarea [(ngModel)]="newNoteText"></textarea>
              <button (click)="addNote(day)">Save</button>
              <button (click)="cancelAddNote()">Cancel</button>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      width: 350px;
      margin: 20px auto;
      font-family: Arial, sans-serif;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    .calendar-day {
      font-weight: bold;
      text-align: center;
      padding: 4px 0;
    }
    .calendar-cell {
      min-height: 60px;
      border-radius: 6px;
      background: #fff;
      border: 1px solid #eee;
      position: relative;
      padding: 2px 4px;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .calendar-cell.has-note {
      background: #e3f7ff;
      border-color: #90caf9;
    }
    .calendar-cell.empty {
      background: transparent;
      border: none;
      cursor: default;
    }
    .note-preview {
      font-size: 13px;
      color: #333;
      margin-top: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .edit-btn, .delete-btn, .add-btn {
      font-size: 11px;
      margin-right: 4px;
      background: none;
      border: none;
      color: #1976d2;
      cursor: pointer;
      padding: 0;
    }
    .edit-btn:hover, .delete-btn:hover, .add-btn:hover {
      text-decoration: underline;
    }
    .edit-form textarea {
      width: 100%;
      min-height: 32px;
      margin-bottom: 4px;
      resize: vertical;
    }
    .edit-form button {
      font-size: 12px;
      margin-right: 4px;
    }
    .add-note-form {
      margin-top: 8px;
    }
  `]
})
export class CalanderWithNotesComponent extends CommonExternalComponent {
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();

  notes: CalendarNote[] = [];
  addingNoteDay: number | null = null;
  newNoteText: string = '';

  get daysInMonth(): number[] {
    const numDays: number = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => i + 1);
  }

  get blanks(): undefined[] {
    const firstDay: number = new Date(this.currentYear, this.currentMonth, 1).getDay();
    return Array(firstDay).fill(undefined);
  }

  private formatDate(day: number): string {
    const mm: string = String(this.currentMonth + 1).padStart(2, '0');
    const dd: string = String(day).padStart(2, '0');
    return `${this.currentYear}-${mm}-${dd}`;
  }

  hasNote(day: number): boolean {
    return this.notes.some(n => n.date === this.formatDate(day));
  }

  getNote(day: number): CalendarNote | undefined {
    return this.notes.find(n => n.date === this.formatDate(day));
  }

  selectDate(day: number): void {
    // Placeholder for future selection logic
  }

  startAddNote(event: MouseEvent, day: number): void {
    event.stopPropagation();
    this.addingNoteDay = day;
    this.newNoteText = '';
  }

  addNote(day: number): void {
    if (this.newNoteText.trim()) {
      this.notes.push({
        date: this.formatDate(day),
        text: this.newNoteText.trim()
      });
    }
    this.addingNoteDay = null;
    this.newNoteText = '';
  }

  cancelAddNote(): void {
    this.addingNoteDay = null;
    this.newNoteText = '';
  }

  editNote(event: MouseEvent, day: number): void {
    event.stopPropagation();
    const note: CalendarNote | undefined = this.getNote(day);
    if (note) {
      note.isEditing = true;
      note.tempText = note.text;
    }
  }

  saveNote(day: number): void {
    const note: CalendarNote | undefined = this.getNote(day);
    if (note && note.tempText !== undefined) {
      note.text = note.tempText.trim();
      note.isEditing = false;
      delete note.tempText;
    }
  }

  cancelEdit(day: number): void {
    const note: CalendarNote | undefined = this.getNote(day);
    if (note) {
      note.isEditing = false;
      delete note.tempText;
    }
  }

  deleteNote(event: MouseEvent, day: number): void {
    event.stopPropagation();
    const dateStr: string = this.formatDate(day);
    this.notes = this.notes.filter(n => n.date !== dateStr);
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.addingNoteDay = null;
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.addingNoteDay = null;
  }
}