import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

// Feature Summary:
// - Offline-first, mobile-friendly expense splitter
// - Create groups and add members (local storage only)
// - Add expenses: amount, description, date, payer, split between selected members
// - Auto-calculates balances ("who owes whom") per group
// - Group summary: total spent per person, net balances
// - All data stored in browser IndexedDB (no backend)
// - Simple navigation between groups, expenses, summaries
// - Soft color palette & rounded corners for UI
// - Expense form validation with error messages

type Member = { id: string; name: string };
type Expense = {
  id: string;
  amount: number;
  description: string;
  date: string;
  payerId: string;
  splitWithIds: string[];
};
type Group = {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
};

@Component({
  selector: 'app-expense-splitter',
  template: `
    <div class="container">
      <h2>Expense Splitter</h2>
      <nav>
        <button *ngIf="view!=='groups'" (click)="setView('groups')">Groups</button>
        <button *ngIf="selectedGroup && view!=='expenses'" (click)="setView('expenses')">Expenses</button>
        <button *ngIf="selectedGroup && view!=='summary'" (click)="setView('summary')">Summary</button>
      </nav>

      <!-- GROUPS VIEW -->
      <section *ngIf="view==='groups'">
        <h3>Your Groups</h3>
        <ul>
          <li *ngFor="let group of groups" (click)="selectGroup(group)">
            {{group.name}} ({{group.members.length}} members)
          </li>
        </ul>
        <form (submit)="addGroup(); $event.preventDefault();" autocomplete="off">
          <input type="text" [(ngModel)]="newGroupName" name="groupName" placeholder="New group name" required />
          <button type="submit">Add Group</button>
        </form>
      </section>

      <!-- EXPENSES VIEW -->
      <section *ngIf="view==='expenses' && selectedGroup">
        <h3>{{selectedGroup.name}}: Expenses</h3>
        <ul>
          <li *ngFor="let exp of selectedGroup.expenses">
            {{exp.description}} - {{exp.amount | currency:'USD'}} by {{memberName(exp.payerId)}} on {{exp.date}}
          </li>
        </ul>
        <hr>
        <form (ngSubmit)="validateAndAddExpense(); $event.preventDefault();" #expenseFormRef="ngForm" autocomplete="off" novalidate>
          <input
            type="text"
            [(ngModel)]="expenseForm.description"
            name="desc"
            placeholder="Description"
            required
            [class.invalid]="expenseErrors.description"
          />
          <span class="error" *ngIf="expenseErrors.description">{{expenseErrors.description}}</span>
          
          <input
            type="number"
            [(ngModel)]="expenseForm.amount"
            name="amount"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            required
            [class.invalid]="expenseErrors.amount"
          />
          <span class="error" *ngIf="expenseErrors.amount">{{expenseErrors.amount}}</span>
          
          <input
            type="date"
            [(ngModel)]="expenseForm.date"
            name="date"
            required
            [class.invalid]="expenseErrors.date"
          />
          <span class="error" *ngIf="expenseErrors.date">{{expenseErrors.date}}</span>
          
          <select
            [(ngModel)]="expenseForm.payerId"
            name="payer"
            required
            [class.invalid]="expenseErrors.payerId"
          >
            <option [ngValue]="null" disabled selected>Payer</option>
            <option *ngFor="let m of selectedGroup.members" [value]="m.id">{{m.name}}</option>
          </select>
          <span class="error" *ngIf="expenseErrors.payerId">{{expenseErrors.payerId}}</span>
          
          <label>Split with:</label>
          <div class="split-list">
            <label *ngFor="let m of selectedGroup.members">
              <input type="checkbox"
                [checked]="expenseForm.splitWithIds.includes(m.id)"
                (change)="onSplitWithChange(m.id, $event)" />
              {{m.name}}
            </label>
          </div>
          <span class="error" *ngIf="expenseErrors.splitWithIds">{{expenseErrors.splitWithIds}}</span>
          <button type="submit">Add Expense</button>
        </form>
        <hr>
        <h4>Members</h4>
        <ul>
          <li *ngFor="let m of selectedGroup.members">{{m.name}}</li>
        </ul>
        <form (submit)="addMember(); $event.preventDefault();" autocomplete="off">
          <input type="text" [(ngModel)]="newMemberName" name="memberName" placeholder="New member name" required />
          <button type="submit">Add Member</button>
        </form>
      </section>

      <!-- SUMMARY VIEW -->
      <section *ngIf="view==='summary' && selectedGroup">
        <h3>{{selectedGroup.name}}: Summary</h3>
        <ul>
          <li *ngFor="let m of selectedGroup.members">
            {{m.name}}: {{totalSpent(m.id) | currency:'USD'}} spent,
            Net: <span [class.positive]="netBalance(m.id)>=0" [class.negative]="netBalance(m.id)<0">
              {{netBalance(m.id) | currency:'USD'}}
            </span>
          </li>
        </ul>
        <h4>Who owes whom:</h4>
        <ul>
          <li *ngFor="let o of whoOwesWhom()">
            {{o.from}} owes {{o.to}}: {{o.amount | currency:'USD'}}
          </li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .container {
      max-width: 420px;
      margin: auto;
      padding: 1.5em;
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f7fafc;
      border-radius: 18px;
      box-shadow: 0 2px 8px rgba(110, 123, 139, 0.07);
    }
    h2, h3, h4 {
      color: #465775;
      margin-top: 0.3em;
    }
    nav {
      display: flex;
      gap: 1em;
      margin-bottom: 1em;
    }
    nav button {
      background: #b5ead7;
      color: #465775;
      border: none;
      border-radius: 12px;
      padding: 0.5em 1.1em;
      font-weight: 500;
      transition: background 0.2s;
      box-shadow: 0 1px 3px rgba(181,234,215,0.16);
    }
    nav button:hover {
      background: #86e7c5;
    }
    section, form, ul, li, input, select, button {
      border-radius: 12px;
    }
    section {
      background: #ffffffcc;
      padding: 1em;
      margin-bottom: 1em;
      box-shadow: 0 1px 6px rgba(70,87,117,0.06);
    }
    ul {
      padding-left: 1em;
      margin: 0.5em 0 1em 0;
      background: #f2f6fc;
      border-radius: 10px;
    }
    ul li {
      margin: 0.4em 0;
      padding: 0.3em 0.6em;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.15s;
    }
    ul li:hover {
      background: #d4eaf7;
    }
    form {
      margin-top: 1em;
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      background: #e4eaf7;
      padding: 0.8em;
      border-radius: 14px;
      box-shadow: 0 1px 3px rgba(70,87,117,0.04);
    }
    input, select, button {
      font-size: 1em;
      padding: 0.45em 0.7em;
      border-radius: 10px;
      border: 1px solid #bcdff1;
      outline: none;
      background: #fafdfe;
      margin-bottom: 0;
    }
    input:focus, select:focus {
      border-color: #a7e9af;
      background: #e8fce8;
    }
    button {
      background: #b5ead7;
      color: #465775;
      border: none;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.2em;
      transition: background 0.2s;
      box-shadow: 0 1px 2px rgba(181,234,215,0.11);
    }
    button:hover {
      background: #86e7c5;
    }
    .split-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5em;
      margin-bottom: 0.2em;
    }
    .split-list label {
      background: #f2f6fc;
      padding: 0.25em 0.7em;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .split-list label:hover {
      background: #d4eaf7;
    }
    .positive { color: #2bb673; font-weight: 600;}
    .negative { color: #e17055; font-weight: 600;}
    .error {
      color: #e17055;
      font-size: 0.95em;
      margin-bottom: -0.3em;
      margin-top: -0.3em;
      padding-left: 0.2em;
      display: block;
      font-weight: 500;
    }
    input.invalid, select.invalid {
      border: 1.5px solid #e17055;
      background: #fff6f5;
    }
    @media (max-width: 600px) {
      .container { padding: 0.5em; }
      nav { flex-direction: column; gap: 0.5em; }
      section { padding: 0.7em; }
      form { padding: 0.6em; }
    }
  `]
})
export class ExpenseSplitterComponent extends CommonExternalComponent {
  groups: Group[] = [];
  view: 'groups'|'expenses'|'summary' = 'groups';
  selectedGroup: Group|null = null;

  newGroupName: string = '';
  newMemberName: string = '';

  expenseForm: {
    description: string;
    amount: number|null;
    date: string;
    payerId: string|null;
    splitWithIds: string[];
  } = this.resetExpenseForm();

  // Validation errors for expense form
  expenseErrors: {
    description?: string;
    amount?: string;
    date?: string;
    payerId?: string;
    splitWithIds?: string;
  } = {};

  constructor() {
    super();
    this.loadGroups();
  }

  // --- Local Storage (IndexedDB) ---
  private dbName = 'ExpenseSplitterDB';
  private storeName = 'groups';

  async loadGroups(): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    const req = store.getAll();
    req.onsuccess = () => {
      this.groups = req.result as Group[];
      if (this.selectedGroup) {
        this.selectedGroup = this.groups.find(g => g.id === this.selectedGroup!.id) || null;
      }
    };
  }

  async saveGroups(): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await store.clear();
    for (const g of this.groups) {
      store.add(g);
    }
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // --- UI Logic ---

  setView(v: 'groups'|'expenses'|'summary'): void {
    this.view = v;
  }

  selectGroup(group: Group): void {
    this.selectedGroup = group;
    this.setView('expenses');
  }

  addGroup(): void {
    if (!this.newGroupName.trim()) return;
    const group: Group = {
      id: crypto.randomUUID(),
      name: this.newGroupName.trim(),
      members: [],
      expenses: []
    };
    this.groups.push(group);
    this.saveGroups();
    this.newGroupName = '';
  }

  addMember(): void {
    if (!this.selectedGroup || !this.newMemberName.trim()) return;
    const member: Member = { id: crypto.randomUUID(), name: this.newMemberName.trim() };
    this.selectedGroup.members.push(member);
    this.saveGroups();
    this.newMemberName = '';
  }

  validateAndAddExpense(): void {
    this.expenseErrors = {};
    let valid = true;

    if (!this.expenseForm.description.trim()) {
      this.expenseErrors.description = 'Description is required.';
      valid = false;
    }
    if (
      this.expenseForm.amount === null ||
      isNaN(Number(this.expenseForm.amount)) ||
      Number(this.expenseForm.amount) <= 0
    ) {
      this.expenseErrors.amount = 'Enter a valid positive amount.';
      valid = false;
    }
    if (!this.expenseForm.date) {
      this.expenseErrors.date = 'Date is required.';
      valid = false;
    }
    if (!this.expenseForm.payerId) {
      this.expenseErrors.payerId = 'Select a payer.';
      valid = false;
    }
    if (!this.expenseForm.splitWithIds.length) {
      this.expenseErrors.splitWithIds = 'Select at least one member to split with.';
      valid = false;
    }
    if (!valid) return;

    this.addExpense();
    this.expenseErrors = {};
  }

  addExpense(): void {
    if (!this.selectedGroup) return;
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: Number(this.expenseForm.amount),
      description: this.expenseForm.description.trim(),
      date: this.expenseForm.date,
      payerId: this.expenseForm.payerId!,
      splitWithIds: [...this.expenseForm.splitWithIds]
    };
    this.selectedGroup.expenses.push(expense);
    this.saveGroups();
    this.expenseForm = this.resetExpenseForm();
  }

  resetExpenseForm() {
    return {
      description: '',
      amount: null,
      date: new Date().toISOString().slice(0,10),
      payerId: null,
      splitWithIds: []
    };
  }

  memberName(id: string): string {
    if (!this.selectedGroup) return '';
    const m = this.selectedGroup.members.find(x => x.id === id);
    return m ? m.name : '';
  }

  // Checkbox handling for splitWithIds
  onSplitWithChange(memberId: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const checked: boolean = !!input?.checked;
    if (checked) {
      if (!this.expenseForm.splitWithIds.includes(memberId)) {
        this.expenseForm.splitWithIds.push(memberId);
      }
    } else {
      this.expenseForm.splitWithIds = this.expenseForm.splitWithIds.filter(id => id !== memberId);
    }
  }

  // --- Calculation helpers ---

  totalSpent(memberId: string): number {
    if (!this.selectedGroup) return 0;
    return this.selectedGroup.expenses
      .filter(e => e.payerId === memberId)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  netBalance(memberId: string): number {
    if (!this.selectedGroup) return 0;
    let paid = 0, owed = 0;
    for (const e of this.selectedGroup.expenses) {
      const splitCount = e.splitWithIds.length;
      if (e.payerId === memberId) paid += e.amount;
      if (e.splitWithIds.includes(memberId)) owed += e.amount / splitCount;
    }
    return paid - owed;
  }

  whoOwesWhom(): {from: string, to: string, amount: number}[] {
    if (!this.selectedGroup) return [];
    const balances: {[id: string]: number} = {};
    for (const m of this.selectedGroup.members) {
      balances[m.id] = this.netBalance(m.id);
    }
    const debtors = Object.entries(balances).filter(([_, b]) => b < -0.01)
      .map(([id, b]) => ({id, amt: -b}));
    const creditors = Object.entries(balances).filter(([_, b]) => b > 0.01)
      .map(([id, b]) => ({id, amt: b}));

    const result: {from: string, to: string, amount: number}[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i], c = creditors[j];
      const pay = Math.min(d.amt, c.amt);
      result.push({
        from: this.memberName(d.id),
        to: this.memberName(c.id),
        amount: Math.round(pay * 100) / 100
      });
      d.amt -= pay;
      c.amt -= pay;
      if (d.amt < 0.01) i++;
      if (c.amt < 0.01) j++;
    }
    return result;
  }
}