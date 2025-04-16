import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-tictactest',
  template: `
    <div style="text-align: center; margin-top: 50px;">
      <h1>Tic Tac Toe</h1>
      <div style="display: grid; grid-template-columns: repeat(3, 100px); gap: 5px;">
        <button *ngFor="let cell of cells; let i = index" 
                (click)="makeMove(i)" 
                [disabled]="cell || winner"
                style="width: 100px; height: 100px; font-size: 24px;">
          {{ cell }}
        </button>
      </div>
      <div *ngIf="winner" style="margin-top: 20px; font-size: 24px;">
        <p>{{ winner }} wins!</p>
      </div>
      <button (click)="reset()" style="margin-top: 20px;">Reset Game</button>
    </div>
  `,
  styles: [`
    button {
      cursor: pointer;
      background-color: #f0f0f0;
      border: 2px solid #ccc;
      border-radius: 5px;
      transition: background-color 0.3s;
    }
    button:hover {
      background-color: #e0e0e0;
    }
  `]
})
export class Tictactest extends CommonExternalComponent {
  cells: string[] = Array(9).fill(null);
  currentPlayer: string = 'X';
  winner: string | null = null;

  makeMove(index: number): void {
    if (!this.cells[index] && !this.winner) {
      this.cells[index] = this.currentPlayer;
      this.checkWinner();
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
  }

  checkWinner(): void {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (this.cells[a] && this.cells[a] === this.cells[b] && this.cells[a] === this.cells[c]) {
        this.winner = this.cells[a];
        return;
      }
    }
  }

  reset(): void {
    this.cells.fill(null);
    this.winner = null;
    this.currentPlayer = 'X';
  }
}