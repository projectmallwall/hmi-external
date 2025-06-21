import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Monthly calendar view with Bootstrap 5 styling.
  - Add, edit, and delete multiple notes for each date.
  - Uses Bootstrap Icons for edit (pencil) and delete (trash).
  - Select a date to view its note(s) in a section below the calendar.
  - Inline note editing with save/cancel options for each note.
  - Highlights days with one or more notes.
  - All data is persisted in localStorage by default.
*/

interface CalendarNote {
  id: string; // unique ID for each note
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
            [class.bg-info-subtle]="hasNotes(day)"
            [class.border-primary]="selectedDay === day"
            style="min-height:52px; cursor:pointer;"
            (click)="selectDate(day)">
            <span class="fw-semibold">{{ day }}</span>
            <span *ngIf="hasNotes(day)" class="position-absolute top-0 end-0 badge bg-info p-1 mt-1 me-1"></span>
          </div>
        </ng-container>
      </div>

      <!-- Notes section for selected date -->
      <div *ngIf="selectedDay !== null" class="mt-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title mb-3">
              Notes for {{ months[currentMonth] }} {{ selectedDay }}, {{ currentYear }}
            </h6>
            <ng-container *ngIf="getNotes(selectedDay!) as notesForDay">
              <div *ngIf="notesForDay.length > 0; else addForm">
                <ul class="list-group mb-3">
                  <li *ngFor="let note of notesForDay" class="list-group-item d-flex flex-column align-items-start">
                    <div *ngIf="!note.isEditing; else editForm">
                      <div class="w-100 d-flex justify-content-between align-items-center">
                        <span>{{ note.text }}</span>
                        <div>
                          <button class="btn btn-sm btn-outline-secondary me-2" (click)="editNote(note)" title="Edit">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" (click)="deleteNote(note)" title="Delete">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <ng-template #editForm>
                      <textarea [(ngModel)]="note.tempText" class="form-control mb-2" rows="2"></textarea>
                      <div>
                        <button class="btn btn-sm btn-primary me-2" (click)="saveNote(note)">Save</button>
                        <button class="btn btn-sm btn-secondary" (click)="cancelEdit(note)">Cancel</button>
                      </div>
                    </ng-template>
                  </li>
                </ul>
                <div *ngIf="addingNoteDay === selectedDay; else showAddBtn">
                  <textarea [(ngModel)]="newNoteText" class="form-control mb-2" rows="2"></textarea>
                  <button class="btn btn-sm btn-success me-2" (click)="addNote(selectedDay!)">Save</button>
                  <button class="btn btn-sm btn-secondary" (click)="cancelAddNote()">Cancel</button>
                </div>
                <ng-template #showAddBtn>
                  <button class="btn btn-sm btn-outline-success" (click)="startAddNote(selectedDay!)">Add Note</button>
                </ng-template>
              </div>
            </ng-container>
            <ng-template #addForm>
              <div *ngIf="addingNoteDay === selectedDay; else showAddBtn2">
                <textarea [(ngModel)]="newNoteText" class="form-control mb-2" rows="2"></textarea>
                <button class="btn btn-sm btn-success me-2" (click)="addNote(selectedDay!)">Save</button>
                <button class="btn btn-sm btn-secondary" (click)="cancelAddNote()">Cancel</button>
              </div>
              <ng-template #showAddBtn2>
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

  private storageKey: string = 'calander-with-notes-data';

  constructor() {
    super();
    this.loadNotes();
  }

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

  hasNotes(day: number): boolean {
    return this.notes.some((n: CalendarNote) => n.date === this.formatDate(day));
  }

  getNotes(day: number): CalendarNote[] {
    return this.notes.filter((n: CalendarNote) => n.date === this.formatDate(day));
  }

  selectDate(day: number): void {
    this.selectedDay = day;
    this.addingNoteDay = null;
    this.newNoteText = '';
    // Remove edit mode if user selects another date
    const notesForDay: CalendarNote[] = this.getNotes(day);
    notesForDay.forEach((note: CalendarNote) => {
      if (note.isEditing) {
        note.isEditing = false;
        delete note.tempText;
      }
    });
  }

  startAddNote(day: number): void {
    this.addingNoteDay = day;
    this.newNoteText = '';
  }

  addNote(day: number): void {
    if (this.newNoteText.trim()) {
      this.notes.push({
        id: this.generateId(),
        date: this.formatDate(day),
        text: this.newNoteText.trim()
      });
      this.saveNotes();
    }
    this.addingNoteDay = null;
    this.newNoteText = '';
  }

  cancelAddNote(): void {
    this.addingNoteDay = null;
    this.newNoteText = '';
  }

  editNote(note: CalendarNote): void {
    note.isEditing = true;
    note.tempText = note.text;
  }

  saveNote(note: CalendarNote): void {
    if (typeof note.tempText === 'string') {
      note.text = note.tempText.trim();
      note.isEditing = false;
      delete note.tempText;
      this.saveNotes();
    }
  }

  cancelEdit(note: CalendarNote): void {
    note.isEditing = false;
    delete note.tempText;
  }

  deleteNote(note: CalendarNote): void {
    this.notes = this.notes.filter((n: CalendarNote) => n.id !== note.id);
    this.saveNotes();
    // If no notes left for the selected day, deselect
    if (this.selectedDay !== null && this.getNotes(this.selectedDay).length === 0) {
      this.selectedDay = null;
    }
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

  // Unique ID generator for notes
  private generateId(): string {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  // Local Storage Persistence
  private saveNotes(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
  }

  private loadNotes(): void {
    const raw: string | null = localStorage.getItem(this.storageKey);
    this.notes = raw ? JSON.parse(raw) : [];
  }
}