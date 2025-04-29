import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

type Cell = {
  value: number | null;
  readonly: boolean;
};

@Component({
  selector: 'app-project',
  template: `
    <div class="sudoku-board">
      <div *ngFor="let row of board; let i = index" class="sudoku-row">
        <input
          *ngFor="let cell of row; let j = index"
          [readonly]="cell.readonly"
          [value]="cell.value !== null ? cell.value : ''"
          maxlength="1"
          (input)="onInput($event, i, j)"
          class="sudoku-cell"
          type="text"
        />
      </div>
    </div>
    <button (click)="resetBoard()">Reset</button>
    <button (click)="checkSolution()">Check</button>
    <div *ngIf="resultMessage" class="result">{{ resultMessage }}</div>
  `,
  styles: [`
    .sudoku-board {
      display: inline-block;
      border: 2px solid #333;
      padding: 8px;
      background: #fafafa;
    }
    .sudoku-row {
      display: flex;
    }
    .sudoku-cell {
      width: 32px;
      height: 32px;
      text-align: center;
      font-size: 18px;
      margin: 1px;
      border: 1px solid #888;
      background: #fff;
    }
    .sudoku-cell[readonly] {
      background: #e0e0e0;
      color: #222;
      font-weight: bold;
    }
    .result {
      margin-top: 10px;
      font-weight: bold;
    }
  `]
})
export class Project extends CommonExternalComponent {
  board: Cell[][] = [];
  private initial: number[][] = [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9]
  ];
  resultMessage: string = '';

  constructor() {
    super();
    this.resetBoard();
  }

  resetBoard(): void {
    this.board = this.initial.map(row =>
      row.map(val => ({
        value: val,
        readonly: val !== null
      }))
    );
    this.resultMessage = '';
  }

  onInput(event: Event, i: number, j: number): void {
    const input = event.target as HTMLInputElement;
    const num = parseInt(input.value, 10);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      this.board[i][j].value = num;
    } else {
      this.board[i][j].value = null;
      input.value = '';
    }
  }

  checkSolution(): void {
    if (this.isSolved()) {
      this.resultMessage = 'Congratulations! Sudoku solved correctly!';
    } else {
      this.resultMessage = 'Incorrect solution. Try again!';
    }
  }

  private isSolved(): boolean {
    // Check rows
    for (let i = 0; i < 9; i++) {
      const rowSet = new Set<number>();
      for (let j = 0; j < 9; j++) {
        const val = this.board[i][j].value;
        if (!val || rowSet.has(val)) return false;
        rowSet.add(val);
      }
    }
    // Check columns
    for (let j = 0; j < 9; j++) {
      const colSet = new Set<number>();
      for (let i = 0; i < 9; i++) {
        const val = this.board[i][j].value;
        if (!val || colSet.has(val)) return false;
        colSet.add(val);
      }
    }
    // Check 3x3 blocks
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        const blockSet = new Set<number>();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const val = this.board[blockRow * 3 + i][blockCol * 3 + j].value;
            if (!val || blockSet.has(val)) return false;
            blockSet.add(val);
          }
        }
      }
    }
    return true;
  }
}

/*
Features:
- Displays a static Sudoku puzzle grid.
- Allows user input in editable cells (1-9 only).
- Readonly cells show the initial puzzle.
- Reset and check solution functionality.
- Simple validation for correct/incorrect solution.
*/