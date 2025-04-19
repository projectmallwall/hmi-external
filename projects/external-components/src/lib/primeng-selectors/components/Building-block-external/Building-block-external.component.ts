import { Component, HostListener } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface Block {
  x: number;
  y: number;
  color: string;
}

@Component({
  selector: 'app-building-block',
  template: `
    <div class="game-container">
      <div class="score">Score: {{ score }}</div>
      <div class="grid" [style.width.px]="gridSize * cellSize" [style.height.px]="gridHeight * cellSize">
        <div *ngFor="let block of blocks"
             class="block"
             [style.left.px]="block.x * cellSize"
             [style.top.px]="block.y * cellSize"
             [style.background]="block.color"
             [style.width.px]="cellSize"
             [style.height.px]="cellSize"></div>
        <div class="current-block"
             [style.left.px]="currentBlock.x * cellSize"
             [style.top.px]="currentBlock.y * cellSize"
             [style.background]="currentBlock.color"
             [style.width.px]="cellSize"
             [style.height.px]="cellSize"></div>
      </div>
      <div class="controls">
        <button (touchstart)="moveLeft()" aria-label="Move Left">&#8592;</button>
        <button (touchstart)="rotate()" aria-label="Rotate">&#8635;</button>
        <button (touchstart)="moveRight()" aria-label="Move Right">&#8594;</button>
        <button (touchstart)="drop()" aria-label="Drop">&#8595;</button>
      </div>
      <div class="game-over" *ngIf="gameOver">
        Game Over!<br>
        <button (click)="restart()">Restart</button>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      max-width: 330px;
      margin: 0 auto;
      user-select: none;
      position: relative;
    }
    .score {
      text-align: center;
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 1.1em;
    }
    .grid {
      background: #e3e3e3;
      border: 2px solid #333;
      position: relative;
      margin: 0 auto;
      touch-action: none;
    }
    .block, .current-block {
      position: absolute;
      box-sizing: border-box;
      border: 1px solid #999;
      border-radius: 3px;
      transition: left 0.05s, top 0.05s;
    }
    .controls {
      display: flex;
      justify-content: space-around;
      margin-top: 12px;
      gap: 6px;
    }
    .controls button {
      width: 52px;
      height: 40px;
      font-size: 1.3em;
      background: #f7f7f7;
      border: 1px solid #aaa;
      border-radius: 7px;
      outline: none;
      touch-action: manipulation;
    }
    .controls button:active {
      background: #d3eaff;
    }
    .game-over {
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255,255,255,0.93);
      padding: 30px 20px;
      border-radius: 12px;
      font-size: 1.4em;
      text-align: center;
      z-index: 10;
      border: 2px solid #666;
    }
    @media (max-width: 400px) {
      .game-container { max-width: 98vw; }
      .grid { width: 98vw !important; }
    }
  `]
})
export class BuildingBlockComponent extends CommonExternalComponent {
  gridSize = 10 as const;
  gridHeight = 16 as const;
  cellSize = 22 as const;
  colors: readonly string[] = ['#ff5252', '#ffd600', '#40c4ff', '#69f0ae', '#ab47bc', '#ffa726', '#8d6e63'];
  blocks: Block[] = [];
  currentBlock: Block = this.generateBlock();
  gameInterval!: ReturnType<typeof setInterval>;
  dropInterval = 480;
  score = 0;
  gameOver = false;

  constructor() {
    super();
    this.startGame();
  }

  startGame(): void {
    this.blocks = [];
    this.score = 0;
    this.gameOver = false;
    this.currentBlock = this.generateBlock();
    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => this.tick(), this.dropInterval);
  }

  generateBlock(): Block {
    const x = Math.floor(this.gridSize / 2);
    return {
      x,
      y: 0,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    };
  }

  canMove(x: number, y: number): boolean {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridHeight) return false;
    return !this.blocks.some(b => b.x === x && b.y === y);
  }

  tick(): void {
    if (this.canMove(this.currentBlock.x, this.currentBlock.y + 1)) {
      this.currentBlock.y += 1;
    } else {
      this.blocks.push({ ...this.currentBlock });
      this.clearLines();
      this.currentBlock = this.generateBlock();
      if (!this.canMove(this.currentBlock.x, this.currentBlock.y)) {
        this.endGame();
      }
    }
  }

  moveLeft(): void {
    if (this.gameOver) return;
    if (this.canMove(this.currentBlock.x - 1, this.currentBlock.y)) {
      this.currentBlock.x -= 1;
    }
  }

  moveRight(): void {
    if (this.gameOver) return;
    if (this.canMove(this.currentBlock.x + 1, this.currentBlock.y)) {
      this.currentBlock.x += 1;
    }
  }

  drop(): void {
    if (this.gameOver) return;
    while (this.canMove(this.currentBlock.x, this.currentBlock.y + 1)) {
      this.currentBlock.y += 1;
    }
    this.tick();
  }

  rotate(): void {
    // For single block, rotation does nothing, but included for extensibility.
  }

  clearLines(): void {
    let linesCleared = 0;
    for (let y = this.gridHeight - 1; y >= 0; y--) {
      const rowBlocks = this.blocks.filter(b => b.y === y);
      if (rowBlocks.length === this.gridSize) {
        this.blocks = this.blocks.filter(b => b.y !== y).map(b =>
          b.y < y ? { ...b, y: b.y + 1 } : b
        );
        linesCleared++;
        y++; // Check the same line again since rows above have shifted down
      }
    }
    if (linesCleared > 0) {
      this.score += linesCleared * 100;
    }
  }

  endGame(): void {
    this.gameOver = true;
    clearInterval(this.gameInterval);
  }

  restart(): void {
    this.startGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent): void {
    if (this.gameOver) return;
    switch (event.key) {
      case 'ArrowLeft':
        this.moveLeft(); break;
      case 'ArrowRight':
        this.moveRight(); break;
      case 'ArrowDown':
        this.drop(); break;
      case ' ':
        this.rotate(); break;
    }
  }

  ngOnDestroy(): void {
    if (this.gameInterval) clearInterval(this.gameInterval);
  }
}