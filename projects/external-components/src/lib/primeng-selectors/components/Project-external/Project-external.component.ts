import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

type Cell = {
  value: number;
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
          [value]="cell.value !== 0 ? cell.value : ''"
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
  private readonly initial: number[][] = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
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
        readonly: val !== 0
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
      this.board[i][j].value = 0;
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
        const val: number = this.board[i][j].value;
        if (val === 0 || rowSet.has(val)) return false;
        rowSet.add(val);
      }
    }
    // Check columns
    for (let j = 0; j < 9; j++) {
      const colSet = new Set<number>();
      for (let i = 0; i < 9; i++) {
        const val: number = this.board[i][j].value;
        if (val === 0 || colSet.has(val)) return false;
        colSet.add(val);
      }
    }
    // Check 3x3 blocks
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        const blockSet = new Set<number>();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const val: number = this.board[blockRow * 3 + i][blockCol * 3 + j].value;
            if (val === 0 || blockSet.has(val)) return false;
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
- Strict typing: No nulls, uses 0 for empty cells.
- Displays a static Sudoku puzzle grid.
- Allows user input in editable cells (1-9 only).
- Readonly cells show the initial puzzle.
- Reset and check solution functionality.
- Simple validation for correct/incorrect solution.
*/