// expense-splitter.component.ts

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
        <form (submit)="addGroup()" autocomplete="off">
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
        <form (submit)="addExpense()" autocomplete="off">
          <input type="text" [(ngModel)]="expenseForm.description" name="desc" placeholder="Description" required />
          <input type="number" [(ngModel)]="expenseForm.amount" name="amount" min="0.01" step="0.01" placeholder="Amount" required />
          <input type="date" [(ngModel)]="expenseForm.date" name="date" required />
          <select [(ngModel)]="expenseForm.payerId" name="payer" required>
            <option [ngValue]="null" disabled>Payer</option>
            <option *ngFor="let m of selectedGroup.members" [value]="m.id">{{m.name}}</option>
          </select>
          <label>Split with:</label>
          <div class="split-list">
            <label *ngFor="let m of selectedGroup.members">
              <input type="checkbox" [value]="m.id"
                [(ngModel)]="expenseForm.splitWithIds"
                name="splitWith-{{m.id}}" [checked]="expenseForm.splitWithIds.includes(m.id)" />
              {{m.name}}
            </label>
          </div>
          <button type="submit">Add Expense</button>
        </form>
        <hr>
        <h4>Members</h4>
        <ul>
          <li *ngFor="let m of selectedGroup.members">{{m.name}}</li>
        </ul>
        <form (submit)="addMember()" autocomplete="off">
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
    .container { max-width: 400px; margin: auto; padding: 1em; font-family: sans-serif; }
    nav { display: flex; gap: 1em; margin-bottom: 1em; }
    ul { padding-left: 1em; }
    form { margin-top: 1em; display: flex; flex-direction: column; gap: 0.5em; }
    input, select, button { font-size: 1em; padding: 0.4em; border-radius: 4px; border: 1px solid #ccc; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    button:hover { background: #0056b3; }
    .split-list { display: flex; flex-wrap: wrap; gap: 0.5em; }
    .positive { color: green; }
    .negative { color: red; }
    @media (max-width: 600px) {
      .container { padding: 0.5em; }
      nav { flex-direction: column; gap: 0.5em; }
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

  addExpense(): void {
    if (!this.selectedGroup ||
        !this.expenseForm.description.trim() ||
        !this.expenseForm.amount ||
        !this.expenseForm.date ||
        !this.expenseForm.payerId ||
        !this.expenseForm.splitWithIds.length) return;
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: this.expenseForm.amount,
      description: this.expenseForm.description.trim(),
      date: this.expenseForm.date,
      payerId: this.expenseForm.payerId,
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