import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface Note {
  text: string;
  priority: 'urgent' | 'later' | 'soon';
}

interface CalendarDay {
  date: Date | null;
  notes?: Note[];
}

@Component({
  selector: 'app-notebook',
  template: `
    <!-- 
      Features:
      - Monthly calendar view, no NaN in empty cells.
      - Multiple notes per day with color-coding (Urgent/Red, Later/Blue, Soon/Green).
      - Add, edit, and delete individual notes for each date.
      - Notes persisted in localStorage.
    -->
    <div class="calendar-container">
      <div class="calendar-header">
        <button (click)="prevMonth()">&lt;</button>
        <span>{{ monthNames[currentMonth] }} {{ currentYear }}</span>
        <button (click)="nextMonth()">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-name" *ngFor="let day of dayNames">{{ day }}</div>
        <div 
          class="calendar-day"
          *ngFor="let day of calendarDays"
          [class.empty]="!day.date"
          (click)="day.date && openNoteDialog(day)"
        >
          <span *ngIf="day.date">{{ day.date.getDate() }}</span>
          <div class="note-dot"
            *ngFor="let note of day.notes"
            [ngClass]="{
              'urgent': note.priority === 'urgent',
              'later': note.priority === 'later',
              'soon': note.priority === 'soon'
            }"
            title="{{ note.text }}"
          ></div>
        </div>
      </div>
    </div>

    <!-- Note Dialog -->
    <div class="dialog-backdrop" *ngIf="showDialog">
      <div class="dialog">
        <h3>Notes for {{ selectedDate?.toLocaleDateString() }}</h3>
        <div *ngIf="notesForSelectedDate.length > 0">
          <div class="note-list">
            <div class="note-item"
              *ngFor="let note of notesForSelectedDate; let i = index"
              [ngClass]="note.priority"
            >
              <span>{{ note.text }}</span>
              <span class="priority-label">({{ note.priority }})</span>
              <button (click)="editExistingNote(i)">Edit</button>
              <button (click)="deleteNote(i)">Delete</button>
            </div>
          </div>
        </div>
        <hr />
        <div>
          <textarea [(ngModel)]="noteText" rows="3" placeholder="Enter new note"></textarea>
          <div class="priority-options">
            <label>
              <input type="radio" name="priority" value="urgent" [(ngModel)]="notePriority" /> Urgent
            </label>
            <label>
              <input type="radio" name="priority" value="later" [(ngModel)]="notePriority" /> Later
            </label>
            <label>
              <input type="radio" name="priority" value="soon" [(ngModel)]="notePriority" /> Soon
            </label>
          </div>
          <div class="dialog-actions">
            <button (click)="saveNote()">{{ editingNoteIndex === null ? 'Add Note' : 'Update Note' }}</button>
            <button (click)="closeDialog()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container { width: 350px; margin: auto; font-family: Arial, sans-serif; }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .calendar-day-name { font-weight: bold; text-align: center; background: #f0f0f0; padding: 5px 0; }
    .calendar-day { height: 50px; text-align: right; padding: 6px; cursor: pointer; position: relative; border-radius: 6px; transition: box-shadow 0.2s; }
    .calendar-day.empty { background: none; cursor: default; }
    .calendar-day:hover:not(.empty) { box-shadow: 0 0 5px #aaa; }
    .note-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-left: 2px; vertical-align: middle; }
    .note-dot.urgent { background: #e53935; }
    .note-dot.later { background: #1976d2; }
    .note-dot.soon { background: #43a047; }
    .dialog-backdrop { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; z-index: 1000; }
    .dialog { background:#fff; padding:20px; border-radius:8px; min-width:270px; box-shadow:0 2px 16px rgba(0,0,0,0.18); }
    .note-list { margin-bottom: 8px; }
    .note-item { background: #f9f9f9; border-radius: 4px; padding: 5px 8px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;}
    .note-item.urgent { border-left: 4px solid #e53935; }
    .note-item.later { border-left: 4px solid #1976d2; }
    .note-item.soon { border-left: 4px solid #43a047; }
    .priority-label { font-size: 0.85em; color: #888; margin-left: 4px; }
    .priority-options { margin: 10px 0; }
    .priority-options label { margin-right: 15px; }
    .dialog-actions { text-align:right; }
    textarea { width:100%; resize:none; }
    button { margin-left: 6px; }
  `]
})
export class NotebookComponent extends CommonExternalComponent {
  dayNames: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames: readonly string[] = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  calendarDays: CalendarDay[] = [];

  showDialog: boolean = false;
  selectedDate: Date | null = null;
  noteText: string = '';
  notePriority: 'urgent' | 'later' | 'soon' = 'urgent';
  notesForSelectedDate: Note[] = [];
  editingNoteIndex: number | null = null;

  private storageKey = 'notebook-multinotes';

  constructor() {
    super();
    this.generateCalendar();
  }

  generateCalendar(): void {
    const firstDayOfMonth: Date = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth: Date = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay: number = firstDayOfMonth.getDay();
    const totalDays: number = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    // Fill leading empty days
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null });
    }
    // Fill actual days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      const notes = this.getNotesForDate(date);
      days.push({ date, notes });
    }
    // Fill trailing empty days
    while (days.length % 7 !== 0) {
      days.push({ date: null });
    }
    this.calendarDays = days;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  openNoteDialog(day: CalendarDay): void {
    if (!day.date) return;
    this.selectedDate = new Date(day.date.getTime());
    this.notesForSelectedDate = [...(this.getNotesForDate(this.selectedDate) ?? [])];
    this.noteText = '';
    this.notePriority = 'urgent';
    this.editingNoteIndex = null;
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedDate = null;
    this.noteText = '';
    this.notePriority = 'urgent';
    this.editingNoteIndex = null;
    this.notesForSelectedDate = [];
  }

  saveNote(): void {
    if (!this.selectedDate) return;
    const notes = this.loadNotes();
    const key = this.formatDateKey(this.selectedDate);
    if (!Array.isArray(notes[key])) notes[key] = [];
    if (this.editingNoteIndex !== null) {
      // Update existing note
      notes[key][this.editingNoteIndex] = {
        text: this.noteText,
        priority: this.notePriority
      };
    } else if (this.noteText.trim()) {
      // Add new note
      notes[key].push({
        text: this.noteText,
        priority: this.notePriority
      });
    }
    this.saveNotes(notes);
    this.generateCalendar();
    this.openNoteDialog({ date: this.selectedDate }); // Refresh dialog notes
  }

  editExistingNote(index: number): void {
    this.editingNoteIndex = index;
    const note = this.notesForSelectedDate[index];
    this.noteText = note.text;
    this.notePriority = note.priority;
  }

  deleteNote(index: number): void {
    if (this.selectedDate === null) return;
    const notes = this.loadNotes();
    const key = this.formatDateKey(this.selectedDate);
    if (Array.isArray(notes[key])) {
      notes[key].splice(index, 1);
      if (notes[key].length === 0) {
        delete notes[key];
      }
      this.saveNotes(notes);
      this.generateCalendar();
      this.openNoteDialog({ date: this.selectedDate }); // Refresh dialog notes
    }
  }

  getNotesForDate(date: Date): Note[] {
    const notes = this.loadNotes();
    return Array.isArray(notes[this.formatDateKey(date)]) ? notes[this.formatDateKey(date)] : [];
  }

  loadNotes(): Record<string, Note[]> {
    const raw = localStorage.getItem(this.storageKey);
    try {
      return raw ? JSON.parse(raw) as Record<string, Note[]> : {};
    } catch {
      return {};
    }
  }

  saveNotes(notes: Record<string, Note[]>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
  }

  formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
  }
}