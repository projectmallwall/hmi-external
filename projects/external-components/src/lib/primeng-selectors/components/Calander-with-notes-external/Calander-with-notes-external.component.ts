import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Monthly calendar view with Bootstrap 5 styling.
  - Add, edit, and delete notes for each date.
  - Select a date to view its note(s) in a section below the calendar.
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
    <div class="container my-4 p-3 border rounded shadow-sm bg-light">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <button class="btn btn-outline-primary btn-sm" (click)="prevMonth()">&lt;</button>
        <span class="fw-bold fs-5">{{ months[currentMonth] }} {{ currentYear }}</span>
        <button class="btn btn-outline-primary btn-sm" (click)="nextMonth()">&gt;</button>
      </div>
      <div class="d-grid mb-2" style="grid-template-columns: repeat(7, 1fr); gap: 2px;">
        <div *ngFor="let day of weekDays" class="text-center fw-semibold py-1 text-secondary small">{{ day }}</div>
        <ng-container *ngFor="let blank of blanks">
          <div></div>
        </ng-container>
        <ng-container *ngFor="let day of daysInMonth">
          <div 
            class="border rounded position-relative bg-white calendar-cell-hover"
            [class.bg-info-subtle]="hasNote(day)"
            [class.border-primary]="selectedDay === day"
            style="min-height:52px; cursor:pointer;"
            (click)="selectDate(day)">
            <span class="fw-semibold">{{ day }}</span>
            <span *ngIf="hasNote(day)" class="position-absolute top-0 end-0 badge bg-info p-1 mt-1 me-1"></span>
          </div>
        </ng-container>
      </div>

      <!-- Note input/add/edit for selected date -->
      <div *ngIf="selectedDay !== null" class="mt-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title mb-3">
              Notes for {{ months[currentMonth] }} {{ selectedDay }}, {{ currentYear }}
            </h6>
            <ng-container *ngIf="getNote(selectedDay!) as note; else addForm">
              <div *ngIf="!note.isEditing; else editForm">
                <p class="mb-2">{{ note.text }}</p>
                <button class="btn btn-sm btn-outline-secondary me-2" (click)="editNote(selectedDay!)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteNote(selectedDay!)">Delete</button>
              </div>
              <ng-template #editForm>
                <textarea [(ngModel)]="note.tempText" class="form-control mb-2" rows="2"></textarea>
                <button class="btn btn-sm btn-primary me-2" (click)="saveNote(selectedDay!)">Save</button>
                <button class="btn btn-sm btn-secondary" (click)="cancelEdit(selectedDay!)">Cancel</button>
              </ng-template>
            </ng-container>
            <ng-template #addForm>
              <div *ngIf="addingNoteDay === selectedDay; else showAddBtn">
                <textarea [(ngModel)]="newNoteText" class="form-control mb-2" rows="2"></textarea>
                <button class="btn btn-sm btn-success me-2" (click)="addNote(selectedDay!)">Save</button>
                <button class="btn btn-sm btn-secondary" (click)="cancelAddNote()">Cancel</button>
              </div>
              <ng-template #showAddBtn>
                <button class="btn btn-sm btn-outline-success" (click)="startAddNote(selectedDay!)">Add Note</button>
              </ng-template>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-cell-hover:hover {
      background-color: #e9ecef !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .badge.bg-info {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      padding: 0;
    }
  `]
})
export class CalanderWithNotesComponent extends CommonExternalComponent {
  months: readonly string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekDays: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();

  notes: CalendarNote[] = [];
  addingNoteDay: number | null = null;
  newNoteText: string = '';
  selectedDay: number | null = null;

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
    return this.notes.some((n: CalendarNote) => n.date === this.formatDate(day));
  }

  getNote(day: number): CalendarNote | undefined {
    return this.notes.find((n: CalendarNote) => n.date === this.formatDate(day));
  }

  selectDate(day: number): void {
    this.selectedDay = day;
    this.addingNoteDay = null;
    this.newNoteText = '';
    // Remove edit mode if user selects another date
    const note = this.getNote(day);
    if (note && note.isEditing) {
      note.isEditing = false;
      delete note.tempText;
    }
  }

  startAddNote(day: number): void {
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

  editNote(day: number): void {
    const note: CalendarNote | undefined = this.getNote(day);
    if (note) {
      note.isEditing = true;
      note.tempText = note.text;
    }
  }

  saveNote(day: number): void {
    const note: CalendarNote | undefined = this.getNote(day);
    if (note && typeof note.tempText === 'string') {
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

  deleteNote(day: number): void {
    const dateStr: string = this.formatDate(day);
    this.notes = this.notes.filter((n: CalendarNote) => n.date !== dateStr);
    this.selectedDay = null;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.addingNoteDay = null;
    this.selectedDay = null;
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.addingNoteDay = null;
    this.selectedDay = null;
  }
}