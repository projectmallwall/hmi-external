// investment-tracker.component.ts

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface Investment {
  id: number;
  type: 'Bank' | 'Mutual Fund' | 'Stock' | 'Insurance';
  name: string;
  amount: number;
  date: string;
  notes?: string;
}

@Component({
  selector: 'app-investment-tracker',
  template: `
    <!-- 
      Features:
      - Add, edit, delete investments (Bank, Mutual Fund, Stock, Insurance)
      - Data stored in browser (local storage)
      - Download/Upload data as .txt file for backup/restore
      - Bootstrap 5 design, PrimeIcons for actions
      - Inline editing and clear summaries
    -->
    <div class="container my-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <i class="pi pi-wallet me-2"></i>
          Investment Tracker
        </h2>
        <div>
          <button class="btn btn-outline-primary me-2" (click)="downloadData()" title="Download Data">
            <i class="pi pi-download"></i>
          </button>
          <label class="btn btn-outline-secondary mb-0" title="Upload Data">
            <i class="pi pi-upload"></i>
            <input type="file" accept=".txt" hidden (change)="uploadData($event)">
          </label>
        </div>
      </div>

      <form class="row g-2 mb-4" (ngSubmit)="addInvestment()" #invForm="ngForm">
        <div class="col-md-2">
          <select class="form-select" required [(ngModel)]="newInvestment.type" name="type">
            <option value="" disabled selected>Type</option>
            <option *ngFor="let t of types" [value]="t">{{t}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <input class="form-control" required placeholder="Name" [(ngModel)]="newInvestment.name" name="name" maxlength="50">
        </div>
        <div class="col-md-2">
          <input class="form-control" required type="number" min="1" step="any" placeholder="Amount" [(ngModel)]="newInvestment.amount" name="amount">
        </div>
        <div class="col-md-2">
          <input class="form-control" required type="date" [(ngModel)]="newInvestment.date" name="date">
        </div>
        <div class="col-md-2">
          <input class="form-control" placeholder="Notes" [(ngModel)]="newInvestment.notes" name="notes" maxlength="100">
        </div>
        <div class="col-md-1 d-grid">
          <button class="btn btn-success" type="submit" [disabled]="!invForm.form.valid">
            <i class="pi pi-plus"></i>
          </button>
        </div>
      </form>

      <div *ngIf="investments.length > 0; else noData">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Notes</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of investments; let i = index">
              <td>
                <span [ngClass]="iconClass(inv.type)" class="me-1"></span>{{inv.type}}
              </td>
              <td>
                <span *ngIf="editIndex !== i">{{inv.name}}</span>
                <input *ngIf="editIndex === i" class="form-control form-control-sm" [(ngModel)]="editInvestment.name" maxlength="50">
              </td>
              <td>
                <span *ngIf="editIndex !== i">{{inv.amount | number:'1.2-2'}}</span>
                <input *ngIf="editIndex === i" class="form-control form-control-sm" type="number" min="1" step="any" [(ngModel)]="editInvestment.amount">
              </td>
              <td>
                <span *ngIf="editIndex !== i">{{inv.date}}</span>
                <input *ngIf="editIndex === i" class="form-control form-control-sm" type="date" [(ngModel)]="editInvestment.date">
              </td>
              <td>
                <span *ngIf="editIndex !== i">{{inv.notes}}</span>
                <input *ngIf="editIndex === i" class="form-control form-control-sm" [(ngModel)]="editInvestment.notes" maxlength="100">
              </td>
              <td class="text-end">
                <button *ngIf="editIndex !== i" class="btn btn-sm btn-outline-primary me-1" (click)="startEdit(i)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button *ngIf="editIndex === i" class="btn btn-sm btn-success me-1" (click)="saveEdit(i)">
                  <i class="pi pi-check"></i>
                </button>
                <button *ngIf="editIndex === i" class="btn btn-sm btn-secondary me-1" (click)="cancelEdit()">
                  <i class="pi pi-times"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteInvestment(i)">
                  <i class="pi pi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="alert alert-info mt-3">
          <strong>Total:</strong>
          <span *ngFor="let t of types; let last = last">
            {{t}}: <b>{{totalByType(t) | number:'1.2-2'}}</b>
            <span *ngIf="!last">|</span>
          </span>
          &nbsp;|&nbsp;
          All: <b>{{totalAll() | number:'1.2-2'}}</b>
        </div>
      </div>
      <ng-template #noData>
        <div class="alert alert-warning text-center">
          <i class="pi pi-info-circle me-1"></i>
          No investments added yet.
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .pi-bank { color: #0d6efd; }
    .pi-chart-line { color: #20c997; }
    .pi-briefcase { color: #ffc107; }
    .pi-shield { color: #fd7e14; }
    input[type="file"] { display: none; }
  `]
})
export class InvestmentTrackerComponent extends CommonExternalComponent {
  types: Array<Investment['type']> = ['Bank', 'Mutual Fund', 'Stock', 'Insurance'];
  investments: Investment[] = [];
  newInvestment: Partial<Investment> = { type: undefined, name: '', amount: undefined, date: '' };
  editIndex: number | null = null;
  editInvestment: Partial<Investment> = {};

  private storageKey = 'investment_tracker_data';

  constructor(private cd: ChangeDetectorRef) {
    super();
    this.loadFromStorage();
  }

  iconClass(type: Investment['type']): string {
    switch (type) {
      case 'Bank': return 'pi pi-bank';
      case 'Mutual Fund': return 'pi pi-chart-line';
      case 'Stock': return 'pi pi-briefcase';
      case 'Insurance': return 'pi pi-shield';
      default: return '';
    }
  }

  addInvestment(): void {
    if (
      !this.newInvestment.type ||
      !this.newInvestment.name?.trim() ||
      typeof this.newInvestment.amount !== 'number' ||
      !this.newInvestment.date
    ) { return; }

    const investment: Investment = {
      id: Date.now(),
      type: this.newInvestment.type,
      name: this.newInvestment.name.trim(),
      amount: Number(this.newInvestment.amount),
      date: this.newInvestment.date,
      notes: this.newInvestment.notes?.trim()
    };
    this.investments.push(investment);
    this.saveToStorage();
    this.newInvestment = { type: undefined, name: '', amount: undefined, date: '' };
  }

  startEdit(index: number): void {
    this.editIndex = index;
    this.editInvestment = { ...this.investments[index] };
  }

  saveEdit(index: number): void {
    if (
      !this.editInvestment.type ||
      !this.editInvestment.name?.trim() ||
      typeof this.editInvestment.amount !== 'number' ||
      !this.editInvestment.date
    ) { return; }

    this.investments[index] = {
      ...(this.investments[index]),
      ...this.editInvestment,
      name: this.editInvestment.name.trim(),
      notes: this.editInvestment.notes?.trim()
    } as Investment;
    this.editIndex = null;
    this.editInvestment = {};
    this.saveToStorage();
  }

  cancelEdit(): void {
    this.editIndex = null;
    this.editInvestment = {};
  }

  deleteInvestment(index: number): void {
    if (confirm('Delete this investment?')) {
      this.investments.splice(index, 1);
      this.saveToStorage();
    }
  }

  totalByType(type: Investment['type']): number {
    return this.investments.filter(inv => inv.type === type).reduce((sum, inv) => sum + inv.amount, 0);
  }

  totalAll(): number {
    return this.investments.reduce((sum, inv) => sum + inv.amount, 0);
  }

  saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.investments));
  }

  loadFromStorage(): void {
    const data = localStorage.getItem(this.storageKey);
    this.investments = data ? JSON.parse(data) : [];
  }

  downloadData(): void {
    this.componentDataDownloader({ investments: this.investments });
  }

  async uploadData(event: Event): Promise<void> {
    const result = await this.componentDataUploader(event);
    if (result && result.investments) {
      this.investments = result.investments;
      this.saveToStorage();
      this.cd.detectChanges();
    }
  }
}