import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  WorkoutTracker Component

  Features:
  - Create a daily workout plan for each day of the week (Mon-Sun)
  - For each day, add multiple exercises with sets, reps, and weight
  - Log completion status and optional notes per exercise
  - View and update logs for each day's workout
  - Uses Angular Reactive Forms with strict type checking
  - Inline HTML & CSS
*/

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface WorkoutLog {
  completed: boolean;
  notes: string;
}

interface ExerciseEntry {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  log: WorkoutLog;
}

interface DailyPlan {
  day: DayOfWeek;
  exercises: ExerciseEntry[];
}

@Component({
  selector: 'app-workout-tracker',
  template: `
    <div class="workout-container">
      <h2>Weekly Workout Plan</h2>
      <div *ngFor="let plan of weeklyPlan; let d = index" class="day-section">
        <h3>{{ plan.day }}</h3>
        <form [formGroup]="exerciseForms[d]" (ngSubmit)="addExercise(d)">
          <input type="text" placeholder="Exercise" formControlName="name" required maxlength="50"/>
          <input type="number" placeholder="Sets" formControlName="sets" min="1" required />
          <input type="number" placeholder="Reps" formControlName="reps" min="1" required />
          <input type="number" placeholder="Weight (kg)" formControlName="weight" min="0" required />
          <button type="submit" [disabled]="exerciseForms[d].invalid">Add</button>
        </form>
        <table *ngIf="plan.exercises.length > 0">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Weight</th>
              <th>Completed</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ex of plan.exercises; let i = index">
              <td>{{ ex.name }}</td>
              <td>{{ ex.sets }}</td>
              <td>{{ ex.reps }}</td>
              <td>{{ ex.weight }}</td>
              <td>
                <input type="checkbox" [(ngModel)]="ex.log.completed" [ngModelOptions]="{standalone: true}" />
              </td>
              <td>
                <input type="text" [(ngModel)]="ex.log.notes" [ngModelOptions]="{standalone: true}" placeholder="Optional notes" maxlength="100"/>
              </td>
              <td>
                <button (click)="removeExercise(d, i)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .workout-container {
      max-width: 700px;
      margin: auto;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    }
    h2 {
      text-align: center;
    }
    .day-section {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }
    h3 {
      color: #1976d2;
      margin-bottom: 0.5rem;
    }
    form {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
      align-items: center;
    }
    input[type="text"], input[type="number"] {
      flex: 1 0 110px;
      padding: 0.3rem;
      font-size: 1rem;
    }
    button[type="submit"] {
      flex: 0 0 70px;
      padding: 0.4rem;
      background: #1976d2;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.5rem;
      font-size: 0.95rem;
    }
    th, td {
      border: 1px solid #bbb;
      padding: 0.4rem;
      text-align: center;
    }
    th {
      background: #e3f2fd;
    }
    button {
      background: #d32f2f;
      color: #fff;
      border: none;
      padding: 0.3rem 0.7rem;
      border-radius: 4px;
      cursor: pointer;
    }
    @media (max-width: 800px) {
      .workout-container {
        padding: 0.5rem;
      }
      form {
        flex-direction: column;
        gap: 0.3rem;
      }
      input, button[type="submit"] {
        flex: 1 0 100%;
      }
    }
  `]
})
export class WorkoutTrackerComponent extends CommonExternalComponent {
  readonly daysOfWeek: DayOfWeek[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  weeklyPlan: DailyPlan[] = [];
  exerciseForms: FormGroup[] = [];

  constructor(private fb: FormBuilder) {
    super();
    this.initWeeklyPlan();
  }

  private initWeeklyPlan(): void {
    this.weeklyPlan = this.daysOfWeek.map(day => ({
      day,
      exercises: []
    }));
    this.exerciseForms = this.daysOfWeek.map(() =>
      this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(50)]],
        sets: [1, [Validators.required, Validators.min(1)]],
        reps: [1, [Validators.required, Validators.min(1)]],
        weight: [0, [Validators.required, Validators.min(0)]]
      })
    );
  }

  addExercise(dayIndex: number): void {
    const form: FormGroup = this.exerciseForms[dayIndex];
    if (form.valid) {
      const entry: ExerciseEntry = {
        name: form.value.name as string,
        sets: form.value.sets as number,
        reps: form.value.reps as number,
        weight: form.value.weight as number,
        log: { completed: false, notes: '' }
      };
      this.weeklyPlan[dayIndex].exercises.push(entry);
      form.reset({ name: '', sets: 1, reps: 1, weight: 0 });
    }
  }

  removeExercise(dayIndex: number, exIndex: number): void {
    this.weeklyPlan[dayIndex].exercises.splice(exIndex, 1);
  }
}